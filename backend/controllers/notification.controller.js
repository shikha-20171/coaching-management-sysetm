import { createAuditEntry } from "../lib/audit.js";
import { getNextId, readStore, writeStore } from "../lib/store.js";

export const getNotifications = async (req, res) => {
  try {
    const store = await readStore();
    const { role } = req.query;
    const notifications = role
      ? store.notifications.filter(
          (item) => item.audience === "all" || item.audience === role
        )
      : store.notifications;
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addNotification = async (req, res) => {
  const { title, message, audience, priority } = req.body;

  try {
    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const store = await readStore();
    const notification = {
      id: getNextId(store.notifications),
      title: title.trim(),
      message: message.trim(),
      audience: audience?.trim() || "all",
      priority: priority?.trim() || "medium",
      created_at: new Date().toISOString(),
    };
    store.notifications.unshift(notification);
    createAuditEntry(store, {
      actor: req.user,
      action: "create",
      entity: "notification",
      entityId: notification.id,
      details: `Sent ${notification.priority} notification to ${notification.audience}`,
    });
    await writeStore(store);
    res.status(201).json({ message: "Notification sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
