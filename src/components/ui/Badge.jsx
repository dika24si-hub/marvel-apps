export default function Badge({
  children,
  variant = "neutral",
  dot = false,
  icon,
  className = "",
}) {
  return (
    <span className={`ui-badge ${variant} ${className}`}>
      {dot && <span className="ui-badge-dot" />}
      {icon && <span className="ui-badge-icon">{icon}</span>}
      {children}
    </span>
  );
}
