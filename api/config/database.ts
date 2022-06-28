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

export async function query<T>(text: string, values: any[] = []): Promise<T[]> {
  const { rows } = await pool.query(text, values);
  return rows;
}

export async function queryOne<T>(text: string, values: any[] = []): Promise<T> {
  const { rows } = await pool.query(text, values);
  return rows[0];
}

export async function map(text: string, values: any[] = [], func: Function): Promise<any[]> {
  const { rows } = await pool.query(text, values);
  return rows.map(row => func(row));
}

export const pool = p;
