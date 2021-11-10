if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const salt = process.env.AUTH_EMAIL_SALT;

const { hashSync } = require('bcrypt');
const { nanoid } = require('nanoid');
const { pbkdf2Sync } = require('pbkdf2')

const { pool } = require('../../db');

async function getUserByEmail(email) {
  //const { rows } = await pool.query('SELECT * FROM opr_companion.user_accounts WHERE email = $1', [email]);
  const hashedEmail = await hashEmail(email);
  return getUserByHashedEmail(hashedEmail);
}

async function getUserByHashedEmail(hashedEmail) {
  const { rows } = await pool.query('SELECT * FROM opr_companion.user_accounts WHERE email_hashed = $1', [hashedEmail]);
  return rows[0];
}

async function getAllUsersWithoutHash(email) {
  const { rows } = await pool.query('SELECT * FROM opr_companion.user_accounts WHERE email_hashed IS NULL');
  return rows;
}

async function getUserByUuid(uuid) {
  const { rows } = await pool.query(
      'SELECT id, username, enabled, uuid, is_opa "isOpa", is_super_admin "isAdmin", created_at "createdAt"  ' +
      'FROM opr_companion.user_accounts ' +
      'WHERE uuid = $1', [uuid]);
  return rows[0];
}

async function updateUserEmailHash(user) {
  const hashedEmail = await hashEmail(user.email);
  console.info(`hash ${user.id}#${user.email} -> ${hashedEmail}`);
  await pool.query(
    'UPDATE opr_companion.user_accounts SET email_hashed = $1 WHERE id = $2 AND email = $3',
    [hashedEmail, user.id, user.email]
  );
}

async function createNewPasswordResetRequest(user) {
  const token = nanoid(64);
  await pool.query(
    'UPDATE opr_companion.user_accounts ' +
    'SET password_reset_token = $1 ' +
    'WHERE email_hashed = $2',
    [token, user.email_hashed]
  );
  return token;
}

async function updateUserResetPassword(email, token, password) {
  const emailHash = await hashEmail(email);
  const passwordHash = hashSync(password, 12);
  await pool.query(
    'UPDATE opr_companion.user_accounts ' +
    'SET password = $1, password_reset_token = null ' +
    'WHERE password_reset_token = $2 AND email_hashed = $3',
    [passwordHash, token, emailHash]
  );

}

async function createUser(username, email, password) {
  const emailHash = await hashEmail(email);
  const passwordHash = hashSync(password, 12);
  const uuid = nanoid(11);
  const { rows } = await pool.query(
    'INSERT INTO opr_companion.user_accounts (email_hashed, password, username, uuid, enabled) VALUES ($1, $2, $3, $4, $5) RETURNING uuid',
    [emailHash, passwordHash, username, uuid, true],
  );
  return rows[0].uuid;
}

async function hashEmail(email) {
  const hashedEmail = pbkdf2Sync(email, salt, 1000, 128, 'sha512').toString('hex');
  // console.info(`Hashed email ${email} -> ${hashedEmail}`);
  return hashedEmail;
}

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
  return password && password.length > 0;
}

function validatePasswordConstrains(password) {
  const re = /^.{8,}$/;
  return re.test(String(password).toLowerCase());
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserByUuid,
  getAllUsersWithoutHash,
  updateUserEmailHash,
  validateEmail,
  validatePassword,
  validatePasswordConstrains,
  hashEmail,
  createNewPasswordResetRequest,
  updateUserResetPassword,
};
