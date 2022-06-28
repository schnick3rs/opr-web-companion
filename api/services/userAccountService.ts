// @ts-ignore
import dotenv from 'dotenv';

import bcrypt from 'bcryptjs';
import {nanoid} from 'nanoid';
import pbkdf2Hmac from 'pbkdf2-hmac';
import PatreonService from './patreonService';

import {query, queryOne} from '../config/database';
import {IFullUser, IPrivateUser} from '../models/DbInterfaces';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const EMAIL_SALT = process.env.AUTH_EMAIL_SALT;
const PASSWORD_SALT_ROUNDS = 12;

export default class UserAccountService {

  public static async getUserByEmail(email): Promise<IFullUser> {
    const hashedEmail = await this.hashEmail(email);
    return this.getUserByHashedEmail(hashedEmail);
  }

  private static async getUserByHashedEmail(hashedEmail): Promise<IFullUser> {
    return await queryOne(`
      SELECT
        id,
        username,
        enabled,
        uuid,
        created_at AS "createdAt",
        password,
        email_hashed AS "emailHashed",
        password_reset_token AS "passwordResetToken",
        password_reset_token_expire AS "passwordResetTokenExpire",
        patreon_refresh_token AS "patreonRefreshToken",
        patreon_active_until AS "patreonActiveUntil",
        roles,
        patreon_scope AS "patreonScope",
        patreon_thumb_url AS "patreonThumbUrl"
      FROM opr_companion.user_accounts
      WHERE email_hashed = $1
      `,
      [hashedEmail]
    );
  }

  public static async getAllUsers(): Promise<IPrivateUser[]> {
    return await query<IPrivateUser>(
      `SELECT
      id,
      username,
      enabled,
      uuid,
      created_at AS "createdAt",
      patreon_active_until AS "patreonActiveUntil",
      patreon_active_until > now() AS "patreon",
      case when patreon_active_until > now()
          then (select array_agg(DISTINCT e) from unnest(array_append(roles, 'army-books')) e)
          else roles
          end as roles
    FROM opr_companion.user_accounts`);
  }

  public static async getUserByUuid(uuid): Promise<IPrivateUser> {
    return await queryOne<IPrivateUser>(
      `SELECT
      id,
      username,
      enabled,
      uuid,
      created_at AS "createdAt",
      patreon_active_until AS "patreonActiveUntil",
      patreon_active_until > now() AS "patreon",
      case when patreon_active_until > now()
          then (select array_agg(DISTINCT e) from unnest(array_append(roles, 'army-books')) e)
          else roles
          end as roles
    FROM opr_companion.user_accounts
    WHERE uuid = $1`,
      [uuid]
    );
  }

  public static async createNewPasswordResetRequest(user: any): Promise<string> {
    const token = nanoid(64);
    await query(
      'UPDATE opr_companion.user_accounts ' +
      'SET password_reset_token = $1 ' +
      'WHERE email_hashed = $2',
      [token, user.email_hashed]
    );
    return token;
  }

  public static async updateUserResetPassword(email: string, token: string, password: string) {
    const emailHash = await this.hashEmail(email);
    const passwordHash = bcrypt.hashSync(password, PASSWORD_SALT_ROUNDS);
    await query(
      'UPDATE opr_companion.user_accounts ' +
      'SET password = $1, password_reset_token = null ' +
      'WHERE password_reset_token = $2 AND email_hashed = $3',
      [passwordHash, token, emailHash]
    );
  }

  public static async getPatreonData(uuid: string): Promise<any> {
    // Save refresh token against the user?
    return await queryOne<any>(
      `SELECT
        patreon_refresh_token AS "patreonRefreshToken",
        patreon_active_until AS "patreonActiveUntil",
        patreon_scope AS "patreonScope",
        patreon_thumb_url AS "patreonThumbUrl"
     FROM opr_companion.user_accounts
     WHERE uuid = $1`,
      [uuid]
    );
  }

  public static async refreshPatreonToken(userUuid: string) {
    const { patreonRefreshToken: currentRefreshToken } = await this.getPatreonData(userUuid);

    if (!currentRefreshToken) {
      console.warn('No refresh token found for user:', userUuid);
      return;
    }

    // eslint-disable-next-line camelcase
    const { access_token: accessToken, refresh_token: refreshToken } =
      await PatreonService.getPatreonOauthTokensFromRefresh(currentRefreshToken);

    await this.setUserPatreonRefreshToken(userUuid, refreshToken);

    const isActive = await PatreonService.isActiveOnePageRulesMember(accessToken);

    console.info('User is Patreon =', isActive);

    const activeUntil = isActive ? PatreonService.computeComingActiveUntilDate() : null;
    console.info('Users patreon is considered active until ', activeUntil);

    await this.setUserPatreonActive(userUuid, activeUntil);
  }

  public static async getUserPatreonRefreshToken(userId: number): Promise<string> {
    // Save refresh token against the user?
    const rows = await queryOne<any>(
      'SELECT patreon_refresh_token AS "patreonRefreshToken" FROM opr_companion.user_accounts WHERE id = $1',
      [userId]
    );
    return rows.patreonRefreshToken;
  }

  public static async setUserPatreonRefreshToken(uuid: string, refreshToken: string) {
    // Save refresh token against the user?
    await query(
      'UPDATE opr_companion.user_accounts SET patreon_refresh_token = $2 WHERE uuid = $1',
      [uuid, refreshToken]
    );
  }

  public static async setUserPatreonActive(uuid: string, activeUntil: Date) {
    // Save refresh token against the user?
    await query(
      'UPDATE opr_companion.user_accounts SET patreon_active_until = $2 WHERE uuid = $1',
      [uuid, activeUntil]
    );
  }

  public static async removePatreon(userId: number) {
    await query(
      `UPDATE opr_companion.user_accounts SET
       patreon_active_until = null,
       patreon_refresh_token = null
     WHERE id = $1`,
      [userId]
    );
  }

  public static async createUser(username: string, email: string, password: string): Promise<string> {
    const emailHash = await this.hashEmail(email);
    const passwordHash = bcrypt.hashSync(password, PASSWORD_SALT_ROUNDS);
    const uuid = nanoid(11);
    const rows = await query<any>(
      'INSERT INTO opr_companion.user_accounts (email_hashed, password, username, uuid, enabled) VALUES ($1, $2, $3, $4, $5) RETURNING uuid',
      [emailHash, passwordHash, username, uuid, true],
    );
    return rows[0].uuid;
  }

  public static buf2hex(buffer: ArrayBuffer): string { // buffer is an ArrayBuffer
    // @ts-ignore
    return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  }

  public static async hashEmail(email: string): Promise<string> {
    const hashedEmail = await pbkdf2Hmac(email, EMAIL_SALT, 1000, 128, 'SHA-512');
    return this.buf2hex(hashedEmail);
  }

  public static validateEmail(email: string): boolean {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  public static validatePassword(password: string): boolean {
    return password && password.length > 0;
  }

  public static validatePasswordConstrains(password: string): boolean {
    const re = /^.{8,}$/;
    return re.test(String(password).toLowerCase());
  }

}
