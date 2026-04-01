import mysql from "mysql2";
import "./loadEnv.js";

const useSsl =
  process.env.DB_SSL === "true" ||
  process.env.DB_SSL === "1" ||
  process.env.MYSQL_SSL === "true" ||
  process.env.MYSQL_SSL === "1";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

export const promiseDB = db.promise();

export default db;
