import { createAuditEntry } from "../lib/audit.js";
import { getNextId, readStore, writeStore } from "../lib/store.js";

// GET all fees
export const getFees = async (req, res) => {
  try {
    const store = await readStore();
    const rows = store.fees.map((fee) => {
      const student = store.students.find((item) => item.id === fee.student_id);
      return {
        ...fee,
        student_name: student?.name || null,
      };
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD fee
export const addFee = async (req, res) => {
  const { student_id, amount, due_date, installment } = req.body;

  try {
    if (!student_id || amount === undefined || amount === null) {
      return res.status(400).json({ error: "Student and amount are required" });
    }

    const store = await readStore();
    const fee = {
      id: getNextId(store.fees),
      student_id: Number(student_id),
      amount: Number(amount),
      due_date: due_date || null,
      installment: installment?.trim() || "Monthly",
      status: "pending",
    };
    store.fees.push(fee);
    createAuditEntry(store, {
      actor: req.user,
      action: "create",
      entity: "fee",
      entityId: fee.id,
      details: `Added ${fee.installment} fee of Rs ${fee.amount}`,
    });
    await writeStore(store);

    res.json({ message: "Fee added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markFeePaid = async (req, res) => {
  const feeId = Number(req.params.id);

  try {
    const store = await readStore();
    const fee = store.fees.find((item) => item.id === feeId);

    if (!fee) {
      return res.status(404).json({ error: "Fee record not found" });
    }

    fee.status = "paid";
    fee.paid_on = new Date().toISOString().slice(0, 10);

    createAuditEntry(store, {
      actor: req.user,
      action: "update",
      entity: "fee",
      entityId: fee.id,
      details: `Marked fee as paid on ${fee.paid_on}`,
    });

    await writeStore(store);
    res.json({ message: "Fee marked as paid", fee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
