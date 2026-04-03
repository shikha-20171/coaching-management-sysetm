import "../config/loadEnv.js";
import { promiseDB } from "../config/db.js";

function printSection(title, rows) {
  console.log(`\n${title}`);
  if (!rows.length) {
    console.log("No rows found.");
    return;
  }

  console.table(rows);
}

async function main() {
  const [users] = await promiseDB.query(
    `SELECT id, name, email, password, role
     FROM users
     ORDER BY id DESC
     LIMIT 10`
  );

  const [authEvents] = await promiseDB.query(
    `SELECT id, event_type, user_id, user_name, email, role, ip_address, created_at
     FROM auth_events
     ORDER BY id DESC
     LIMIT 20`
  );

  printSection("Latest users saved in SQL", users);
  printSection("Latest register/login events saved in SQL", authEvents);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unable to show auth data:", error.message);
    process.exit(1);
  });
