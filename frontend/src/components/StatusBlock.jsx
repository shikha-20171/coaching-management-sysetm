export function LoadingBlock({ label = "Loading..." }) {
  return (
    <div className="status-block">
      <div className="status-block__shimmer" />
      <div className="status-block__spinner" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyBlock({ title = "Nothing here yet", description = "Add some data to get started." }) {
  return (
    <div className="status-block status-block--empty">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}
