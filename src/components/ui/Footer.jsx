export default function Footer({ left, right, className = "" }) {
  return (
    <footer className={`ui-footer ${className}`}>
      <div className="ui-footer-left">{left ?? "© 2026 VetCare Inc."}</div>
      {right && <div className="ui-footer-right">{right}</div>}
    </footer>
  );
}
