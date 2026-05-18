export default function StatCard({
  icon,
  color = "primary",
  label,
  value,
  delta,
  trend,
  className = "",
}) {
  return (
    <div className={`ui-stat-card ${className}`}>
      <span
        className={`ui-stat-icon ${color}`}
        style={{ width: 42, height: 42 }}
      >
        {icon}
      </span>

      <div className="ui-stat-meta">
        <p>{label}</p>
        <h3>{value}</h3>
        {delta && (
          <span className={`ui-stat-delta ${trend === "down" ? "down" : "up"}`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
