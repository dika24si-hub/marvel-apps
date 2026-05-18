export default function FilterChips({
  options = [],
  value,
  onChange,
  label,
  className = "",
}) {
  return (
    <div className={`ui-filter-chips ${className}`}>
      {label && <span className="ui-filter-label">{label}</span>}
      <div className="ui-filter-list">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={`ui-chip ${value === opt.key ? "active" : ""}`}
            onClick={() => onChange?.(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
