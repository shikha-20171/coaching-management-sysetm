import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "../config/loadEnv.js";
import { promiseDB } from "../config/db.js";

const jwtSecret = process.env.JWT_SECRET || "development-secret-key";

async function logAuthEvent(req, { eventType, user }) {
  try {
    await promiseDB.query(
      `INSERT INTO auth_events
        (event_type, user_id, user_name, email, role, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        eventType,
        user?.id || null,
        user?.name || null,
        user?.email || "",
        user?.role || null,
        req.ip || null,
        req.get("user-agent") || null,
      ]
    );
  } catch (error) {
    console.error("Auth event log error:", error.message);
  }
}

async function createAuditLog(connection, { actor, action, entity, entityId, details }) {
  await connection.query(
    `INSERT INTO audit_logs
      (actor_id, actor_role, actor_name, action, entity, entity_id, details)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      actor?.id || null,
      actor?.role || "system",
      actor?.name || "System",
      action,
      entity,
      entityId ?? null,
      details || "",
    ]
  );
}

async function getDefaultStudentRefs(connection) {
  const [[institutes], [batches], [courses]] = await Promise.all([
    connection.query("SELECT id FROM institutes ORDER BY id ASC LIMIT 1"),
    connection.query("SELECT id FROM batches ORDER BY id ASC LIMIT 1"),
    connection.query("SELECT id FROM courses ORDER BY id ASC LIMIT 1"),
  ]);

  return {
    instituteId: institutes[0]?.id || null,
    batchId: batches[0]?.id || null,
    courseId: courses[0]?.id || null,
  };
}

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name?.trim() || !email?.trim() || !password || !role?.trim()) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = role.trim().toLowerCase();

  if (!["student", "staff", "admin"].includes(normalizedRole)) {
    return res.status(400).json({ message: "Invalid role selected" });
  }

  const connection = await promiseDB.getConnection();

  try {
    await connection.beginTransaction();

    const [existingUsers] = await connection.query(
      "SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1",
      [normalizedEmail]
    );

    if (existingUsers.length) {
      await connection.rollback();
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [insertResult] = await connection.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [normalizedName, normalizedEmail, hashedPassword, normalizedRole]
    );

    const user = {
      id: Number(insertResult.insertId),
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
    };

    if (normalizedRole === "student") {
      const defaults = await getDefaultStudentRefs(connection);
      await connection.query(
        `INSERT INTO students
          (user_id, institute_id, batch_id, course_id, name, email, phone, guardian_name, city, attendance, marks, progress, joined_on)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          defaults.instituteId,
          defaults.batchId,
          defaults.courseId,
          normalizedName,
          normalizedEmail,
          "",
          "",
          "",
          82,
          64,
          58,
          new Date().toISOString().slice(0, 10),
        ]
      );
    }

    await createAuditLog(connection, {
      actor: user,
      action: "create",
      entity: "user",
      entityId: user.id,
      details: `Registered new ${normalizedRole} account`,
    });

    await connection.commit();
    await logAuthEvent(req, { eventType: "register", user });

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Registration error:", error);
    return res.status(500).json({ message: error.message || "Registration failed" });
  } finally {
    connection.release();
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [users] = await promiseDB.query(
      "SELECT id, name, email, password, role FROM users WHERE LOWER(email) = ? LIMIT 1",
      [email.trim().toLowerCase()]
    );

    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, {
      expiresIn: "7d",
    });

    await logAuthEvent(req, { eventType: "login", user });

    const { password: _password, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: error.message || "Login failed" });
  }
};

export const getAuthEvents = async (_req, res) => {
  try {
    const [rows] = await promiseDB.query(
      `SELECT id, event_type, user_id, user_name, email, role, ip_address, user_agent, created_at
       FROM auth_events
       ORDER BY created_at DESC, id DESC
       LIMIT 50`
    );

    return res.json(rows);
  } catch (error) {
    console.error("Fetch auth events error:", error);
    return res.status(500).json({ message: error.message || "Unable to fetch auth events" });
  }
};

export const getAuthDemoData = async (_req, res) => {
  try {
    const [[users], [authEvents]] = await Promise.all([
      promiseDB.query(
        `SELECT id, name, email, password, role
         FROM users
         ORDER BY id DESC
         LIMIT 10`
      ),
      promiseDB.query(
        `SELECT id, event_type, user_id, user_name, email, role, ip_address, created_at
         FROM auth_events
         ORDER BY id DESC
         LIMIT 20`
      ),
    ]);

    return res.json({ users, authEvents });
  } catch (error) {
    console.error("Fetch auth demo data error:", error);
    return res.status(500).json({ message: error.message || "Unable to fetch auth demo data" });
  }
};
