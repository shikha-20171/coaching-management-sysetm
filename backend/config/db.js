import mysql from "mysql2";
import "./loadEnv.js";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const promiseDB = db.promise();

export default db;
