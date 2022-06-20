import dotenv from 'dotenv';

import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import pbkdf2Hmac from 'pbkdf2-hmac';
import * as patreonService from '../account/patreon-service';

import { pool } from '../../db';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const EMAIL_SALT = process.env.AUTH_EMAIL_SALT;
const PASSWORD_SALT_ROUNDS = 12;

export async function getUserByEmail(email) {
  // const { rows } = await pool.query('SELECT * FROM opr_companion.user_accounts WHERE email = $1', [email]);
  const hashedEmail = await hashEmail(email);
  return getUserByHashedEmail(hashedEmail);
}

export async function getUserByHashedEmail(hashedEmail) {
  const { rows } = await pool.query('SELECT * FROM opr_companion.user_accounts WHERE email_hashed = $1', [hashedEmail]);
  return rows[0];
}

export async function getAllUsersWithoutHash(email) {
  const { rows } = await pool.query('SELECT * FROM opr_companion.user_accounts WHERE email_hashed IS NULL');
  return rows;
}

export async function getAllUsers() {
  const { rows: users } = await pool.query(
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
  return users;
}

export async function getUserByUuid(uuid) {
  const { rows } = await pool.query(
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
  return rows[0];
}

export async function updateUserEmailHash(user) {
  const hashedEmail = await hashEmail(user.email);
  // console.info(`hash ${user.id}#${user.email} -> ${hashedEmail}`);
  await pool.query(
    'UPDATE opr_companion.user_accounts SET email_hashed = $1 WHERE id = $2 AND email = $3',
    [hashedEmail, user.id, user.email]
  );
}

export async function createNewPasswordResetRequest(user) {
  const token = nanoid(64);
  await pool.query(
    'UPDATE opr_companion.user_accounts ' +
    'SET password_reset_token = $1 ' +
    'WHERE email_hashed = $2',
    [token, user.email_hashed]
  );
  return token;
}

export async function updateUserResetPassword(email, token, password) {
  const emailHash = await hashEmail(email);
  const passwordHash = bcrypt.hashSync(password, PASSWORD_SALT_ROUNDS);
  await pool.query(
    'UPDATE opr_companion.user_accounts ' +
    'SET password = $1, password_reset_token = null ' +
    'WHERE password_reset_token = $2 AND email_hashed = $3',
    [passwordHash, token, emailHash]
  );
}

export async function getPatreonData(uuid) {
  // Save refresh token against the user?
  const { rows } = await pool.query(
    `SELECT
        patreon_refresh_token AS "patreonRefreshToken",
        patreon_active_until AS "patreonActiveUntil",
        patreon_scope AS "patreonScope",
        patreon_thumb_url AS "patreonThumbUrl"
     FROM opr_companion.user_accounts
     WHERE uuid = $1`,
    [uuid]
  );
  return rows[0];
}

export async function refreshPatreonToken(userUuid) {
  const { patreonRefreshToken: currentRefreshToken } = await getPatreonData(userUuid);

  if (!currentRefreshToken) {
    console.warn('No refresh token found for user:', userUuid);
    return;
  }

  // eslint-disable-next-line camelcase
  const { access_token: accessToken, refresh_token: refreshToken } =
    await patreonService.getPatreonOauthTokensFromRefresh(currentRefreshToken);

  await patreonService.setUserPatreonRefreshToken(userUuid, refreshToken);

  const isActive = await patreonService.isActiveOnePageRulesMember(accessToken);

  console.info('User is Patreon =', isActive);

  const activeUntil = isActive ? patreonService.getActiveUntil() : null;
  console.info('Users patreon is considered active until ', activeUntil);

  await setUserPatreonActive(userUuid, activeUntil);
}

export async function setUserPatreonActive(uuid, activeUntil) {
  // Save refresh token against the user?
  await pool.query(
    'UPDATE opr_companion.user_accounts SET patreon_active_until = $2 WHERE uuid = $1',
    [uuid, activeUntil]
  );
}

export async function removePatreon(userId) {
  await pool.query(
    `UPDATE opr_companion.user_accounts SET
       patreon_active_until = null,
       patreon_refresh_token = null
     WHERE id = $1`,
    [userId]
  );
}

export async function createUser(username, email, password) {
  const emailHash = await hashEmail(email);
  const passwordHash = bcrypt.hashSync(password, PASSWORD_SALT_ROUNDS);
  const uuid = nanoid(11);
  const { rows } = await pool.query(
    'INSERT INTO opr_companion.user_accounts (email_hashed, password, username, uuid, enabled) VALUES ($1, $2, $3, $4, $5) RETURNING uuid',
    [emailHash, passwordHash, username, uuid, true],
  );
  return rows[0].uuid;
}

export function buf2hex(buffer) { // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashEmail(email) {
  const hashedEmail = await pbkdf2Hmac(email, EMAIL_SALT, 1000, 128, 'SHA-512');
  // console.info(`Hashed email ${email} -> ${hashedEmail}`);
  return buf2hex(hashedEmail);
}

export function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function validatePassword(password) {
  return password && password.length > 0;
}

export function validatePasswordConstrains(password) {
  const re = /^.{8,}$/;
  return re.test(String(password).toLowerCase());
}
