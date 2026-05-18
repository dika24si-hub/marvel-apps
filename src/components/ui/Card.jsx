export default function Card({
  title,
  subtitle,
  action,
  padded = true,
  bordered = true,
  className = "",
  children,
}) {
  const showHeader = title || subtitle || action;

  return (
    <section
      className={`ui-card ${padded ? "padded" : ""} ${bordered ? "bordered" : ""} ${className}`}
    >
      {showHeader && (
        <header className="ui-card-head">
          <div>
            {title && <h3 className="ui-card-title">{title}</h3>}
            {subtitle && <p className="ui-card-sub">{subtitle}</p>}
          </div>
          {action && <div className="ui-card-action">{action}</div>}
        </header>
      )}
      <div className="ui-card-body">{children}</div>
    </section>
  );
}
