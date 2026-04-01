import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "../config/loadEnv.js";
import { createAuditEntry } from "../lib/audit.js";
import { getNextId, readStore, writeStore } from "../lib/store.js";

const jwtSecret = process.env.JWT_SECRET || "development-secret-key";

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedName = name?.trim();
    const normalizedRole = role?.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password || !normalizedRole) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["student", "staff", "admin"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const store = await readStore();
    const existingUser = store.users.find(
      (user) => user.email.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: getNextId(store.users),
      name: normalizedName,
      email: normalizedEmail,
      password: hashed,
      role: normalizedRole,
    };

    store.users.push(user);

    if (normalizedRole === "student") {
      store.students.push({
        id: getNextId(store.students),
        user_id: user.id,
        name: normalizedName,
        email: normalizedEmail,
        phone: "",
        institute_id: store.institutes[0]?.id || null,
        batch_id: store.batches[0]?.id || null,
        course_id: store.courses[0]?.id || null,
        guardian_name: "",
        city: "",
        attendance: 82,
        marks: 64,
        progress: 58,
        joined_on: new Date().toISOString().slice(0, 10),
      });
    }

    createAuditEntry(store, {
      actor: user,
      action: "create",
      entity: "user",
      entityId: user.id,
      details: `Registered new ${normalizedRole} account`,
    });

    await writeStore(store);
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: error.message || "Registration failed" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const store = await readStore();
    const user = store.users.find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase()
    );

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

    const { password: _password, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: error.message || "Login failed" });
  }
};
