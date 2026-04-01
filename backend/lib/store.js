import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { promiseDB } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storePath = path.join(__dirname, "../data/store.json");
const schemaPath = path.join(__dirname, "../config/schema.sql");

const defaultStore = {
  users: [],
  institutes: [],
  students: [],
  courses: [],
  batches: [],
  fees: [],
  attendance: [],
  tests: [],
  notifications: [],
  materials: [],
  auditLogs: [],
};

let initPromise;

function isDatabaseConfigured() {
  return Boolean(
    process.env.DB_HOST &&
      process.env.DB_USER &&
      process.env.DB_NAME
  );
}

function normalizeStore(data = {}) {
  return {
    ...defaultStore,
    ...data,
    users: data.users || [],
    institutes: data.institutes || [],
    students: data.students || [],
    courses: data.courses || [],
    batches: data.batches || [],
    fees: data.fees || [],
    attendance: data.attendance || [],
    tests: data.tests || [],
    notifications: data.notifications || [],
    materials: data.materials || [],
    auditLogs: data.auditLogs || [],
  };
}

function formatDateValue(value) {
  if (!value) return null;
  if (typeof value === "string") {
    return value.includes("T") ? value : value;
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value);
}

function formatDateTimeValue(value) {
  if (!value) return null;
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

function toMySqlDateTime(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 19).replace("T", " ");
  }

  const normalized = String(value);
  return normalized.includes("T")
    ? normalized.slice(0, 19).replace("T", " ")
    : normalized.slice(0, 19);
}

function mapUser(row) {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role,
  };
}

function mapInstitute(row) {
  return {
    id: Number(row.id),
    name: row.name,
    city: row.city,
    manager: row.manager,
    contact: row.contact,
    status: row.status,
  };
}

function mapCourse(row) {
  return {
    id: Number(row.id),
    institute_id: row.institute_id === null ? null : Number(row.institute_id),
    title: row.title,
    fees: Number(row.fees || 0),
    category: row.category,
    duration: row.duration,
    mentor: row.mentor,
    mode: row.mode,
  };
}

function mapBatch(row) {
  return {
    id: Number(row.id),
    institute_id: row.institute_id === null ? null : Number(row.institute_id),
    course_id: row.course_id === null ? null : Number(row.course_id),
    name: row.name,
    schedule: row.schedule,
    room: row.room,
    capacity: Number(row.capacity || 0),
    status: row.status,
  };
}

function mapStudent(row) {
  return {
    id: Number(row.id),
    user_id: row.user_id === null ? null : Number(row.user_id),
    institute_id: row.institute_id === null ? null : Number(row.institute_id),
    batch_id: row.batch_id === null ? null : Number(row.batch_id),
    course_id: row.course_id === null ? null : Number(row.course_id),
    name: row.name,
    email: row.email,
    phone: row.phone,
    guardian_name: row.guardian_name,
    city: row.city,
    attendance: Number(row.attendance || 0),
    marks: Number(row.marks || 0),
    progress: Number(row.progress || 0),
    joined_on: formatDateValue(row.joined_on),
  };
}

function mapFee(row) {
  return {
    id: Number(row.id),
    student_id: Number(row.student_id),
    amount: Number(row.amount || 0),
    status: row.status,
    due_date: formatDateValue(row.due_date),
    paid_on: formatDateValue(row.paid_on),
    installment: row.installment,
  };
}

function mapAttendance(row) {
  return {
    id: Number(row.id),
    student_id: Number(row.student_id),
    date: formatDateValue(row.date),
    status: row.status,
    subject: row.subject,
  };
}

function mapTest(row) {
  return {
    id: Number(row.id),
    course_id: Number(row.course_id),
    title: row.title,
    date: formatDateValue(row.date),
    max_marks: Number(row.max_marks || 0),
    average_score: Number(row.average_score || 0),
    status: row.status,
  };
}

function mapNotification(row) {
  return {
    id: Number(row.id),
    title: row.title,
    message: row.message,
    audience: row.audience,
    priority: row.priority,
    created_at: formatDateTimeValue(row.created_at),
  };
}

function mapAuditLog(row) {
  return {
    id: Number(row.id),
    actorId: row.actor_id === null ? null : Number(row.actor_id),
    actorRole: row.actor_role,
    actorName: row.actor_name,
    action: row.action,
    entity: row.entity,
    entityId: row.entity_id === null ? null : Number(row.entity_id),
    details: row.details,
    created_at: formatDateTimeValue(row.created_at),
  };
}

async function readLocalSeed() {
  try {
    const raw = await fs.readFile(storePath, "utf-8");
    return normalizeStore(JSON.parse(raw));
  } catch {
    return normalizeStore();
  }
}

async function runSchema(connection) {
  const schemaSql = await fs.readFile(schemaPath, "utf-8");
  const statements = schemaSql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await connection.query(statement);
  }
}

async function insertMany(connection, table, columns, rows) {
  if (!rows.length) return;

  const placeholders = rows
    .map(() => `(${columns.map(() => "?").join(", ")})`)
    .join(", ");
  const values = rows.flatMap((row) => columns.map((column) => row[column]));

  await connection.query(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders}`,
    values
  );
}

async function replaceAllData(connection, data) {
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");

  const deleteOrder = [
    "audit_logs",
    "notifications",
    "attendance",
    "fees",
    "students",
    "tests",
    "batches",
    "courses",
    "users",
    "institutes",
  ];

  for (const table of deleteOrder) {
    await connection.query(`DELETE FROM ${table}`);
  }

  await insertMany(
    connection,
    "institutes",
    ["id", "name", "city", "manager", "contact", "status"],
    data.institutes.map((item) => ({
      id: item.id,
      name: item.name,
      city: item.city,
      manager: item.manager || null,
      contact: item.contact || null,
      status: item.status || "Active",
    }))
  );

  await insertMany(
    connection,
    "users",
    ["id", "name", "email", "password", "role"],
    data.users.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      password: item.password,
      role: item.role,
    }))
  );

  await insertMany(
    connection,
    "courses",
    ["id", "institute_id", "title", "fees", "category", "duration", "mentor", "mode"],
    data.courses.map((item) => ({
      id: item.id,
      institute_id: item.institute_id ?? null,
      title: item.title,
      fees: Number(item.fees || 0),
      category: item.category || null,
      duration: item.duration || null,
      mentor: item.mentor || null,
      mode: item.mode || null,
    }))
  );

  await insertMany(
    connection,
    "batches",
    ["id", "institute_id", "course_id", "name", "schedule", "room", "capacity", "status"],
    data.batches.map((item) => ({
      id: item.id,
      institute_id: item.institute_id ?? null,
      course_id: item.course_id ?? null,
      name: item.name,
      schedule: item.schedule || null,
      room: item.room || null,
      capacity: Number(item.capacity || 0),
      status: item.status || "Active",
    }))
  );

  await insertMany(
    connection,
    "students",
    [
      "id",
      "user_id",
      "institute_id",
      "batch_id",
      "course_id",
      "name",
      "email",
      "phone",
      "guardian_name",
      "city",
      "attendance",
      "marks",
      "progress",
      "joined_on",
    ],
    data.students.map((item) => ({
      id: item.id,
      user_id: item.user_id ?? null,
      institute_id: item.institute_id ?? null,
      batch_id: item.batch_id ?? null,
      course_id: item.course_id ?? null,
      name: item.name,
      email: item.email,
      phone: item.phone || null,
      guardian_name: item.guardian_name || null,
      city: item.city || null,
      attendance: Number(item.attendance || 0),
      marks: Number(item.marks || 0),
      progress: Number(item.progress || 0),
      joined_on: item.joined_on || null,
    }))
  );

  await insertMany(
    connection,
    "fees",
    ["id", "student_id", "amount", "status", "due_date", "paid_on", "installment"],
    data.fees.map((item) => ({
      id: item.id,
      student_id: item.student_id,
      amount: Number(item.amount || 0),
      status: item.status || "pending",
      due_date: item.due_date || null,
      paid_on: item.paid_on || null,
      installment: item.installment || null,
    }))
  );

  await insertMany(
    connection,
    "attendance",
    ["id", "student_id", "date", "status", "subject"],
    data.attendance.map((item) => ({
      id: item.id,
      student_id: item.student_id,
      date: item.date,
      status: item.status,
      subject: item.subject || null,
    }))
  );

  await insertMany(
    connection,
    "tests",
    ["id", "course_id", "title", "date", "max_marks", "average_score", "status"],
    data.tests.map((item) => ({
      id: item.id,
      course_id: item.course_id,
      title: item.title,
      date: item.date,
      max_marks: Number(item.max_marks || 0),
      average_score: Number(item.average_score || 0),
      status: item.status || "Scheduled",
    }))
  );

  await insertMany(
    connection,
    "notifications",
    ["id", "title", "message", "audience", "priority", "created_at"],
    data.notifications.map((item) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      audience: item.audience || "all",
      priority: item.priority || "medium",
      created_at: toMySqlDateTime(item.created_at || new Date()),
    }))
  );

  await insertMany(
    connection,
    "audit_logs",
    [
      "id",
      "actor_id",
      "actor_role",
      "actor_name",
      "action",
      "entity",
      "entity_id",
      "details",
      "created_at",
    ],
    (data.auditLogs || []).map((item) => ({
      id: item.id,
      actor_id: item.actorId ?? null,
      actor_role: item.actorRole || "system",
      actor_name: item.actorName || "System",
      action: item.action || "update",
      entity: item.entity || "system",
      entity_id: item.entityId ?? null,
      details: item.details || "",
      created_at: toMySqlDateTime(item.created_at || new Date()),
    }))
  );

  await connection.query("SET FOREIGN_KEY_CHECKS = 1");
}

async function ensureDatabaseReady() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    if (!isDatabaseConfigured()) {
      throw new Error(
        "Database is not configured. Set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME before running the backend."
      );
    }

    const connection = await promiseDB.getConnection();

    try {
      await runSchema(connection);

      const [rows] = await connection.query("SELECT COUNT(*) AS total FROM users");
      const totalUsers = Number(rows[0]?.total || 0);

      if (!totalUsers) {
        const seed = await readLocalSeed();

        if (
          seed.users.length ||
          seed.institutes.length ||
          seed.students.length ||
          seed.courses.length ||
          seed.batches.length ||
          seed.fees.length ||
          seed.attendance.length ||
          seed.tests.length ||
          seed.notifications.length ||
          seed.auditLogs.length
        ) {
          await connection.beginTransaction();
          try {
            await replaceAllData(connection, seed);
            await connection.commit();
          } catch (error) {
            await connection.rollback();
            throw error;
          }
        }
      }
    } finally {
      connection.release();
    }
  })();

  try {
    await initPromise;
  } catch (error) {
    initPromise = null;
    throw error;
  }
}

export async function readStore() {
  await ensureDatabaseReady();

  const [
    [users],
    [institutes],
    [students],
    [courses],
    [batches],
    [fees],
    [attendance],
    [tests],
    [notifications],
    [auditLogs],
  ] = await Promise.all([
    promiseDB.query("SELECT * FROM users ORDER BY id"),
    promiseDB.query("SELECT * FROM institutes ORDER BY id"),
    promiseDB.query("SELECT * FROM students ORDER BY id"),
    promiseDB.query("SELECT * FROM courses ORDER BY id"),
    promiseDB.query("SELECT * FROM batches ORDER BY id"),
    promiseDB.query("SELECT * FROM fees ORDER BY id"),
    promiseDB.query("SELECT * FROM attendance ORDER BY date DESC, id DESC"),
    promiseDB.query("SELECT * FROM tests ORDER BY date DESC, id DESC"),
    promiseDB.query("SELECT * FROM notifications ORDER BY created_at DESC, id DESC"),
    promiseDB.query("SELECT * FROM audit_logs ORDER BY created_at DESC, id DESC LIMIT 200"),
  ]);

  return normalizeStore({
    users: users.map(mapUser),
    institutes: institutes.map(mapInstitute),
    students: students.map(mapStudent),
    courses: courses.map(mapCourse),
    batches: batches.map(mapBatch),
    fees: fees.map(mapFee),
    attendance: attendance.map(mapAttendance),
    tests: tests.map(mapTest),
    notifications: notifications.map(mapNotification),
    auditLogs: auditLogs.map(mapAuditLog),
    materials: [],
  });
}

export async function writeStore(data) {
  await ensureDatabaseReady();
  const normalized = normalizeStore(data);
  const connection = await promiseDB.getConnection();

  try {
    await connection.beginTransaction();
    await replaceAllData(connection, normalized);
    await connection.commit();
    return normalized;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export function getNextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
}
