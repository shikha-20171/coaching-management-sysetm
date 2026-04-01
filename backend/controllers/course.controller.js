import { createAuditEntry } from "../lib/audit.js";
import { getNextId, readStore, writeStore } from "../lib/store.js";

export const getCourses = async (req, res) => {
  try {
    const store = await readStore();
    const rows = store.courses.map((course) => ({
      ...course,
      institute_name:
        store.institutes.find((item) => item.id === course.institute_id)?.name || "Main Campus",
    }));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addCourse = async (req, res) => {
  const { title, fees, category, duration, mentor, mode, institute_id } = req.body;

  try {
    if (!title?.trim() || fees === undefined || fees === null) {
      return res.status(400).json({ error: "Title and fees are required" });
    }

    const store = await readStore();
    const course = {
      id: getNextId(store.courses),
      title: title.trim(),
      fees: Number(fees),
      institute_id: institute_id ? Number(institute_id) : store.institutes[0]?.id || null,
      category: category?.trim() || "Foundation",
      duration: duration?.trim() || "6 months",
      mentor: mentor?.trim() || "Faculty Team",
      mode: mode?.trim() || "Hybrid",
    };
    store.courses.push(course);
    createAuditEntry(store, {
      actor: req.user,
      action: "create",
      entity: "course",
      entityId: course.id,
      details: `Added course ${course.title}`,
    });
    await writeStore(store);

    res.json({ message: "Course added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
