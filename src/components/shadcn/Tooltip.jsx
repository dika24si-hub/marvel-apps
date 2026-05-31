import { useState, useRef, useId } from "react";

/**
 * Tooltip — bergaya shadcn/ui.
 * Muncul saat hover / focus, dengan animasi fade + arrow.
 *
 * Props:
 * - content: teks / node tooltip
 * - side: "top" | "bottom" | "left" | "right" (default "top")
 * - children: elemen pemicu
 */
export default function Tooltip({ content, side = "top", children, className = "" }) {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const id = useId();

  const show = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 120);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <span
      className={`sc-tooltip ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      data-shadcn="Tooltip"
    >
      {children}
      <span
        role="tooltip"
        id={id}
        className={`sc-tooltip-content ${side} ${open ? "open" : ""}`}
      >
        {content}
        <span className={`sc-tooltip-arrow ${side}`} />
      </span>
    </span>
  );
}
