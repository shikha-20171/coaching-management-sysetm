import { createAuditEntry } from "../lib/audit.js";
import { getNextId, readStore, writeStore } from "../lib/store.js";

function attachStudentMeta(student, store) {
  const institute = store.institutes.find((item) => item.id === student.institute_id);
  const batch = store.batches.find((item) => item.id === student.batch_id);
  const course =
    store.courses.find((item) => item.id === student.course_id) ||
    store.courses.find((item) => item.id === batch?.course_id);
  const feeRecords = store.fees.filter((fee) => fee.student_id === student.id);
  const totalPaid = feeRecords
    .filter((fee) => fee.status === "paid")
    .reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
  const totalPending = feeRecords
    .filter((fee) => fee.status !== "paid")
    .reduce((sum, fee) => sum + Number(fee.amount || 0), 0);

  return {
    ...student,
    institute_name: institute?.name || "Main Campus",
    batch_name: batch?.name || "Not assigned",
    course_name: course?.title || "Not assigned",
    total_paid: totalPaid,
    total_pending: totalPending,
    performance_level:
      student.marks >= 85 ? "Top Performer" : student.marks >= 65 ? "On Track" : "Needs Support",
  };
}

export const getStudents = async (req, res) => {
  try {
    const store = await readStore();
    res.json(store.students.map((student) => attachStudentMeta(student, store)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addStudent = async (req, res) => {
  const {
    name,
    email,
    phone,
    institute_id,
    batch_id,
    course_id,
    guardian_name,
    city,
    attendance,
    marks,
    progress,
  } = req.body;

  try {
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const store = await readStore();
    const normalizedEmail = email.trim().toLowerCase();
    const alreadyExists = store.students.some(
      (student) => student.email.toLowerCase() === normalizedEmail
    );

    if (alreadyExists) {
      return res.status(409).json({ error: "Student email already exists" });
    }

    const student = {
      id: getNextId(store.students),
      user_id: null,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || "",
      institute_id: institute_id ? Number(institute_id) : store.institutes[0]?.id || null,
      batch_id: batch_id ? Number(batch_id) : null,
      course_id: course_id ? Number(course_id) : null,
      guardian_name: guardian_name?.trim() || "",
      city: city?.trim() || "",
      attendance: Number(attendance ?? 88),
      marks: Number(marks ?? 72),
      progress: Number(progress ?? 68),
      joined_on: new Date().toISOString().slice(0, 10),
    };

    store.students.push(student);
    createAuditEntry(store, {
      actor: req.user,
      action: "create",
      entity: "student",
      entityId: student.id,
      details: `Added student ${student.name}`,
    });
    await writeStore(store);

    res.status(201).json({
      message: "Student added successfully",
      student: attachStudentMeta(student, store),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteStudent = async (req, res) => {
  const studentId = Number(req.params.id);

  try {
    const store = await readStore();
    const originalCount = store.students.length;
    store.students = store.students.filter((student) => student.id !== studentId);
    store.fees = store.fees.filter((fee) => fee.student_id !== studentId);
    store.attendance = store.attendance.filter((item) => item.student_id !== studentId);

    if (store.students.length === originalCount) {
      return res.status(404).json({ error: "Student not found" });
    }

    createAuditEntry(store, {
      actor: req.user,
      action: "delete",
      entity: "student",
      entityId: studentId,
      details: "Removed student and linked fee/attendance records",
    });

    await writeStore(store);
    res.json({ message: "Student removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
