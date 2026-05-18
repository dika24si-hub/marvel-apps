import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";
const SIZE = { sm: 380, md: 520, lg: 720 };

export default function Modal({
  open,
  onClose,
  title,
  footer,
  size = "md",
  children,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ui-modal-backdrop" onClick={onClose}>
      <div
        className="ui-modal"
        style={{ maxWidth: SIZE[size] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {(title || onClose) && (
          <div className="ui-modal-head">
            {title && <h3>{title}</h3>}
            {onClose && (
              <button type="button" className="ui-modal-close" onClick={onClose} aria-label="Close">
                <FaTimes />
              </button>
            )}
          </div>
        )}
        <div className="ui-modal-body">{children}</div>
        {footer && <div className="ui-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
