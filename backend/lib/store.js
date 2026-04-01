import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storePath = path.join(__dirname, "../data/store.json");

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

function normalizeStore(data) {
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

async function ensureStore() {
  try {
    await fs.access(storePath);
  } catch {
    await fs.mkdir(path.dirname(storePath), { recursive: true });
    await fs.writeFile(storePath, JSON.stringify(defaultStore, null, 2));
  }
}

export async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(storePath, "utf-8");
  return normalizeStore(JSON.parse(raw));
}

export async function writeStore(data) {
  await ensureStore();
  await fs.writeFile(storePath, JSON.stringify(data, null, 2));
  return data;
}

export function getNextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
}
