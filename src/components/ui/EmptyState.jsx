import { FaInbox } from "react-icons/fa";
export default function EmptyState({
  icon = <FaInbox />,
  title = "Tidak ada data",
  description,
  action,
  className = "",
}) {
  return (
    <div className={`ui-empty ${className}`}>
      <div className="ui-empty-icon">{icon}</div>
      <h4>{title}</h4>
      {description && <p>{description}</p>}
      {action && <div className="ui-empty-action">{action}</div>}
    </div>
  );
}
