import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "../config/loadEnv.js";
import { promiseDB } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, "../config/schema.sql");

function splitStatements(sql) {
  return sql
    .split(/;\s*\n/g)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function main() {
  const schemaSql = await fs.readFile(schemaPath, "utf-8");
  const statements = splitStatements(schemaSql);
  const connection = await promiseDB.getConnection();

  try {
    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log("Database schema ready.");
    console.log("Tables for auth demo: users, auth_events");
  } finally {
    connection.release();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to initialize auth database:", error.message);
    process.exit(1);
  });
