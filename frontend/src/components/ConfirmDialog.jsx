export default function ConfirmDialog({
  open,
  title = "Confirm action",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog-card">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="dialog-actions">
          <button className="ghost-button" onClick={onCancel} type="button">
            {cancelLabel}
          </button>
          <button className="primary-button" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
