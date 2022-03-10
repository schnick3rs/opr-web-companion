// https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import { Pool } from "pg";

var p;
try {
  p = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DISABLE_PG_SSL ? false : {
      rejectUnauthorized: false,
    },
  });
} catch (e) {
  console.error(e);
}

export const pool = p;
