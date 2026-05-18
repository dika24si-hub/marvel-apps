import { useEffect, useRef, useState } from "react";
import { FaGlobe, FaCheck, FaChevronDown } from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";

const OPTIONS = [
  { code: "id", short: "ID", label: "Bahasa Indonesia" },
  { code: "en", short: "EN", label: "English" },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const active = OPTIONS.find((o) => o.code === lang) ?? OPTIONS[0];

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="lang-switcher" ref={ref}>
      <button
        type="button"
        className="lang-btn"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <FaGlobe />
        <span className="code">{active.short}</span>
        <FaChevronDown className={`caret ${open ? "open" : ""}`} />
      </button>

      {open && (
        <ul className="lang-dropdown" role="listbox">
          {OPTIONS.map((opt) => (
            <li key={opt.code}>
              <button
                type="button"
                className={`lang-item ${opt.code === lang ? "active" : ""}`}
                onClick={() => {
                  setLang(opt.code);
                  setOpen(false);
                }}
                role="option"
                aria-selected={opt.code === lang}
              >
                <span className="lang-code">{opt.short}</span>
                <span className="label">{opt.label}</span>
                {opt.code === lang && <FaCheck className="check" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
