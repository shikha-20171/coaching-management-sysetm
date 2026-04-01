import { createAuditEntry } from "../lib/audit.js";
import { getNextId, readStore, writeStore } from "../lib/store.js";

export const getBatches = async (req, res) => {
  try {
    const store = await readStore();
    const rows = store.batches.map((batch) => {
      const course = store.courses.find((item) => item.id === batch.course_id);
      const institute = store.institutes.find((item) => item.id === batch.institute_id);
      return {
        ...batch,
        course_name: course?.title || null,
        institute_name: institute?.name || "Main Campus",
      };
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addBatch = async (req, res) => {
  const { name, course_id, institute_id, schedule, room, capacity, status } = req.body;

  try {
    if (!name?.trim()) {
      return res.status(400).json({ error: "Batch name is required" });
    }

    const store = await readStore();
    const batch = {
      id: getNextId(store.batches),
      name: name.trim(),
      course_id: course_id ? Number(course_id) : null,
      institute_id: institute_id ? Number(institute_id) : store.institutes[0]?.id || null,
      schedule: schedule?.trim() || "Mon-Wed-Fri, 5:00 PM",
      room: room?.trim() || "Room A",
      capacity: Number(capacity ?? 30),
      status: status?.trim() || "Active",
    };
    store.batches.push(batch);
    createAuditEntry(store, {
      actor: req.user,
      action: "create",
      entity: "batch",
      entityId: batch.id,
      details: `Added batch ${batch.name}`,
    });
    await writeStore(store);

    res.json({ message: "Batch added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
