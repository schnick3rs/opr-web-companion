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
    return await queryOne(
      'SELECT * FROM opr_companion.user_accounts WHERE email_hashed = $1',
      [hashedEmail]
    );
  }

  public static async getAllUsers(): Promise<IPrivateUser[]> {
    return await query(
      `SELECT
      id,
      username,
      enabled,
      uuid,
      created_at "createdAt",
      patreon_active_until "patreonActiveUntil",
      patreon_active_until > now() "patreon",
      case when patreon_active_until > now()
          then (select array_agg(DISTINCT e) from unnest(array_append(roles, 'army-books')) e)
          else roles
          end as roles
    FROM opr_companion.user_accounts`);
  }

  public static async getUserByUuid(uuid): Promise<IPrivateUser> {
    return await queryOne(
      `SELECT
      id,
      username,
      enabled,
      uuid,
      created_at "createdAt",
      patreon_active_until "patreonActiveUntil",
      patreon_active_until > now() "patreon",
      case when patreon_active_until > now()
          then (select array_agg(DISTINCT e) from unnest(array_append(roles, 'army-books')) e)
          else roles
          end as roles
    FROM opr_companion.user_accounts
    WHERE uuid = $1`,
      [uuid]
    );
  }

  public static async createNewPasswordResetRequest(user): Promise<string> {
    const token = nanoid(64);
    await query(
      'UPDATE opr_companion.user_accounts ' +
      'SET password_reset_token = $1 ' +
      'WHERE email_hashed = $2',
      [token, user.email_hashed]
    );
    return token;
  }

  public static async updateUserResetPassword(email, token, password) {
    const emailHash = await this.hashEmail(email);
    const passwordHash = bcrypt.hashSync(password, PASSWORD_SALT_ROUNDS);
    await query(
      'UPDATE opr_companion.user_accounts ' +
      'SET password = $1, password_reset_token = null ' +
      'WHERE password_reset_token = $2 AND email_hashed = $3',
      [passwordHash, token, emailHash]
    );
  }

  public static async getPatreonData(uuid): Promise<any> {
    // Save refresh token against the user?
    return await queryOne(
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

  public static async refreshPatreonToken(userUuid) {
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

  public static async getUserPatreonRefreshToken(userId): Promise<string> {
    // Save refresh token against the user?
    const rows = await queryOne(
      'SELECT patreon_refresh_token FROM opr_companion.user_accounts WHERE id = $1',
      [userId]
    );
    return rows.patreon_refresh_token;
  }

  public static async setUserPatreonRefreshToken(uuid, refreshToken) {
    // Save refresh token against the user?
    await query(
      'UPDATE opr_companion.user_accounts SET patreon_refresh_token = $2 WHERE uuid = $1',
      [uuid, refreshToken]
    );
  }

  public static async setUserPatreonActive(uuid, activeUntil) {
    // Save refresh token against the user?
    await query(
      'UPDATE opr_companion.user_accounts SET patreon_active_until = $2 WHERE uuid = $1',
      [uuid, activeUntil]
    );
  }

  public static async removePatreon(userId) {
    await query(
      `UPDATE opr_companion.user_accounts SET
       patreon_active_until = null,
       patreon_refresh_token = null
     WHERE id = $1`,
      [userId]
    );
  }

  public static async createUser(username, email, password) {
    const emailHash = await this.hashEmail(email);
    const passwordHash = bcrypt.hashSync(password, PASSWORD_SALT_ROUNDS);
    const uuid = nanoid(11);
    const rows = await queryOne(
      'INSERT INTO opr_companion.user_accounts (email_hashed, password, username, uuid, enabled) VALUES ($1, $2, $3, $4, $5) RETURNING uuid',
      [emailHash, passwordHash, username, uuid, true],
    );
    return rows.uuid;
  }

  public static buf2hex(buffer): string { // buffer is an ArrayBuffer
    // @ts-ignore
    return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  }

  public static async hashEmail(email): Promise<string> {
    const hashedEmail = await pbkdf2Hmac(email, EMAIL_SALT, 1000, 128, 'SHA-512');
    return this.buf2hex(hashedEmail);
  }

  public static validateEmail(email): boolean {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  public static validatePassword(password): boolean {
    return password && password.length > 0;
  }

  public static validatePasswordConstrains(password): boolean {
    const re = /^.{8,}$/;
    return re.test(String(password).toLowerCase());
  }

}
