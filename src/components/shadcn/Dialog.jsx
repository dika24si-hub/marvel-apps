import { useEffect, useCallback } from "react";
import { FaTimes } from "react-icons/fa";

/**
 * Dialog — bergaya shadcn/ui.
 * Overlay + panel center, animasi fade/zoom, close via ESC / overlay / tombol X.
 *
 * Props:
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 * - title, description
 * - footer: ReactNode
 * - size: "sm" | "md" | "lg"
 * - children: body
 */
const SIZE = { sm: 400, md: 512, lg: 720 };

export default function Dialog({
  open,
  onOpenChange,
  title,
  description,
  footer,
  size = "md",
  children,
  className = "",
}) {
  const close = useCallback(() => onOpenChange?.(false), [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="sc-dialog-overlay" onClick={close} data-shadcn="Dialog">
      <div
        className={`sc-dialog ${className}`}
        style={{ maxWidth: SIZE[size] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "sc-dialog-title" : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="sc-dialog-close"
          onClick={close}
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {(title || description) && (
          <div className="sc-dialog-head">
            {title && (
              <h3 id="sc-dialog-title" className="sc-dialog-title">
                {title}
              </h3>
            )}
            {description && <p className="sc-dialog-desc">{description}</p>}
          </div>
        )}

        <div className="sc-dialog-body">{children}</div>

        {footer && <div className="sc-dialog-foot">{footer}</div>}
      </div>
    </div>
  );
}
