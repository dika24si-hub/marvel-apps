export default function Tag({ icon, color = "default", children, className = "" }) {
  return (
    <span className={`ui-tag ${color} ${className}`}>
      {icon && <span className="ui-tag-icon">{icon}</span>}
      {children}
    </span>
  );
}
