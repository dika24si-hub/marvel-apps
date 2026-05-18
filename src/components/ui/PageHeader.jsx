export default function PageHeader({
  title,
  subtitle,
  actions,
  className = "",
}) {
  return (
    <header className={`ui-page-header ${className}`}>
      <div className="ui-page-text">
        {title && <h1>{title}</h1>}
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="ui-page-actions">{actions}</div>}
    </header>
  );
}
