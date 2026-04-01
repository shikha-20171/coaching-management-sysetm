import { getNextId } from "./store.js";

export function createAuditEntry(store, { actor, action, entity, entityId, details }) {
  const entry = {
    id: getNextId(store.auditLogs || []),
    actorId: actor?.id || null,
    actorRole: actor?.role || "system",
    actorName: actor?.name || "System",
    action,
    entity,
    entityId: entityId ?? null,
    details: details || "",
    created_at: new Date().toISOString(),
  };

  store.auditLogs = [entry, ...(store.auditLogs || [])].slice(0, 200);
  return entry;
}
