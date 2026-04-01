import { createAuditEntry } from "../lib/audit.js";
import { getNextId, readStore, writeStore } from "../lib/store.js";

export const getInstitutes = async (req, res) => {
  try {
    const store = await readStore();
    const data = store.institutes.map((institute) => ({
      ...institute,
      studentCount: store.students.filter((student) => student.institute_id === institute.id).length,
      batchCount: store.batches.filter((batch) => batch.institute_id === institute.id).length,
    }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addInstitute = async (req, res) => {
  const { name, city, manager, contact, status } = req.body;

  try {
    if (!name?.trim() || !city?.trim()) {
      return res.status(400).json({ error: "Institute name and city are required" });
    }

    const store = await readStore();
    const institute = {
      id: getNextId(store.institutes),
      name: name.trim(),
      city: city.trim(),
      manager: manager?.trim() || "Operations Team",
      contact: contact?.trim() || "",
      status: status?.trim() || "Active",
    };

    store.institutes.push(institute);
    createAuditEntry(store, {
      actor: req.user,
      action: "create",
      entity: "institute",
      entityId: institute.id,
      details: `Added institute ${institute.name}`,
    });
    await writeStore(store);
    res.status(201).json({ message: "Institute added successfully", institute });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
