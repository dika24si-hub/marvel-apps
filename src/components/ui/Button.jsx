export default function Button({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  block = false,
  type = "button",
  className = "",
  disabled,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`ui-btn ${variant} ${size} ${block ? "block" : ""} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="ui-btn-spinner" aria-hidden />
      ) : (
        leftIcon && <span className="ui-btn-icon">{leftIcon}</span>
      )}
      {children && <span className="ui-btn-label">{children}</span>}
      {rightIcon && !loading && <span className="ui-btn-icon">{rightIcon}</span>}
    </button>
  );
}
