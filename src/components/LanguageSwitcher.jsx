import { useEffect, useRef, useState } from "react";
import { FaGlobe, FaCheck, FaChevronDown } from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";

const OPTIONS = [
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩", short: "ID" },
  { code: "en", label: "English", flag: "🇬🇧", short: "EN" },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const active = OPTIONS.find((o) => o.code === lang) ?? OPTIONS[0];

  // Close on outside click
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
        <span className="flag">{active.flag}</span>
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
                <span className="flag">{opt.flag}</span>
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
