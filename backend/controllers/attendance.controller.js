import { createAuditEntry } from "../lib/audit.js";
import { getNextId, readStore, writeStore } from "../lib/store.js";

export const getAttendance = async (req, res) => {
  try {
    const store = await readStore();
    const rows = store.attendance.map((entry) => ({
      ...entry,
      student_name:
        store.students.find((student) => student.id === entry.student_id)?.name || "Student",
    }));
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addAttendance = async (req, res) => {
  const { student_id, date, status, subject } = req.body;

  try {
    if (!student_id || !date || !status?.trim()) {
      return res.status(400).json({ error: "Student, date, and status are required" });
    }

    const store = await readStore();
    const entry = {
      id: getNextId(store.attendance),
      student_id: Number(student_id),
      date,
      status: status.trim(),
      subject: subject?.trim() || "General Session",
    };
    store.attendance.push(entry);
    createAuditEntry(store, {
      actor: req.user,
      action: "create",
      entity: "attendance",
      entityId: entry.id,
      details: `Marked ${entry.status} for student ${entry.student_id}`,
    });
    await writeStore(store);
    res.status(201).json({ message: "Attendance recorded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
