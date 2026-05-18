import { forwardRef } from "react";
const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    leftIcon,
    rightIcon,
    block = true,
    className = "",
    ...rest
  },
  ref
) {
  return (
    <label className={`ui-field ${block ? "block" : ""} ${error ? "has-error" : ""} ${className}`}>
      {label && <span className="ui-field-label">{label}</span>}
      <span className="ui-input-wrap">
        {leftIcon && <span className="ui-input-icon left">{leftIcon}</span>}
        <input ref={ref} className="ui-input" {...rest} />
        {rightIcon && <span className="ui-input-icon right">{rightIcon}</span>}
      </span>
      {error ? (
        <small className="ui-field-error">{error}</small>
      ) : (
        hint && <small className="ui-field-hint">{hint}</small>
      )}
    </label>
  );
});

export default Input;
