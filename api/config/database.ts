// https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js
// @ts-ignore
import dotenv from 'dotenv';

import { Pool } from 'pg';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

let p;
try {
  p = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DISABLE_PG_SSL
      ? false
      : {
          rejectUnauthorized: false,
        },
  });
} catch (e) {
  console.error(e);
}

export async function query(text, values = []): Promise<any> {
  const { rows } = await pool.query(text, values);
  return rows;
}

export async function queryOne(text, values = []): Promise<any> {
  const { rows } = await pool.query(text, values);
  return rows[0];
}

export async function map(text, values = [], func): Promise<any> {
  const { rows } = await pool.query(text, values);
  return rows.map(row => func(row));
}

export const pool = p;
