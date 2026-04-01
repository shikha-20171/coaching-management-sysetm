import bcrypt from "bcryptjs";
import { createAuditEntry } from "../lib/audit.js";
import { readStore, writeStore } from "../lib/store.js";

function getStudentProfile(store, userId) {
  return store.students.find((item) => Number(item.user_id) === Number(userId));
}

export const getMyWorkspace = async (req, res) => {
  try {
    const store = await readStore();
    const user = store.users.find((item) => item.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const student = user.role === "student" ? getStudentProfile(store, user.id) : null;
    const studentFees = student
      ? store.fees.filter((fee) => fee.student_id === student.id)
      : [];

    const receipts = studentFees
      .filter((fee) => fee.status === "paid")
      .map((fee) => ({
        id: fee.id,
        title: `${fee.installment || "Installment"} receipt`,
        amount: fee.amount,
        paid_on: fee.paid_on,
      }));

    const seededMaterials = (store.materials || []).length
      ? store.materials
      : [
          {
            id: 1,
            title: "Algebra Sprint Notes",
            audience: "student",
            type: "PDF",
            course_id: student?.course_id || 1,
            description: "High-frequency revision notes for fast weekly review.",
          },
          {
            id: 2,
            title: "Mentor Delivery Checklist",
            audience: "staff",
            type: "Guide",
            course_id: null,
            description: "Class execution and doubt-resolution checklist for faculty.",
          },
          {
            id: 3,
            title: "Operations Excellence Playbook",
            audience: "admin",
            type: "Guide",
            course_id: null,
            description: "A compact branch-ops checklist for revenue, attendance, and alerts.",
          },
        ];

    const materials = seededMaterials.filter((item) => {
      if (item.audience === "all" || item.audience === user.role) {
        return true;
      }

      return student ? item.course_id === student.course_id : false;
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile: student
        ? {
            phone: student.phone,
            guardian_name: student.guardian_name,
            city: student.city,
          }
        : null,
      materials,
      receipts,
      auditTrail:
        user.role === "admin"
          ? (store.auditLogs || []).slice(0, 10)
          : (store.auditLogs || []).filter((item) => item.actorId === user.id).slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const store = await readStore();
    const user = store.users.find((item) => item.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { name, phone, guardian_name, city } = req.body;

    if (name?.trim()) {
      user.name = name.trim();
    }

    if (user.role === "student") {
      const student = getStudentProfile(store, user.id);

      if (student) {
        student.name = user.name;
        student.phone = phone?.trim() || student.phone;
        student.guardian_name = guardian_name?.trim() || student.guardian_name;
        student.city = city?.trim() || student.city;
      }
    }

    createAuditEntry(store, {
      actor: user,
      action: "update",
      entity: "profile",
      entityId: user.id,
      details: "Updated personal profile fields",
    });

    await writeStore(store);

    res.json({
      message: "Profile updated successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Current password and a new 6+ character password are required" });
    }

    const store = await readStore();
    const user = store.users.find((item) => item.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    createAuditEntry(store, {
      actor: user,
      action: "update",
      entity: "password",
      entityId: user.id,
      details: "Changed account password",
    });

    await writeStore(store);
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
