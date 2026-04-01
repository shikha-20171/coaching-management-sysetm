import { createAuditEntry } from "../lib/audit.js";
import { getNextId, readStore, writeStore } from "../lib/store.js";

export const getTests = async (req, res) => {
  try {
    const store = await readStore();
    const rows = store.tests.map((test) => ({
      ...test,
      course_name: store.courses.find((course) => course.id === test.course_id)?.title || "Course",
    }));
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addTest = async (req, res) => {
  const { title, course_id, date, max_marks, average_score, status } = req.body;

  try {
    if (!title?.trim() || !course_id || !date) {
      return res.status(400).json({ error: "Title, course, and date are required" });
    }

    const store = await readStore();
    const test = {
      id: getNextId(store.tests),
      title: title.trim(),
      course_id: Number(course_id),
      date,
      max_marks: Number(max_marks ?? 100),
      average_score: Number(average_score ?? 0),
      status: status?.trim() || "Scheduled",
    };
    store.tests.push(test);
    createAuditEntry(store, {
      actor: req.user,
      action: "create",
      entity: "test",
      entityId: test.id,
      details: `Created test ${test.title}`,
    });
    await writeStore(store);
    res.status(201).json({ message: "Test created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
