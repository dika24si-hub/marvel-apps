import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function buildRange(current, total, siblings = 1) {
  const range = [];
  const left = Math.max(2, current - siblings);
  const right = Math.min(total - 1, current + siblings);

  range.push(1);
  if (left > 2) range.push("…");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("…");
  if (total > 1) range.push(total);

  return range;
}

export default function Pagination({
  page = 1,
  totalPages = 1,
  onChange,
  siblings = 1,
  className = "",
}) {
  if (totalPages <= 1) return null;
  const items = buildRange(page, totalPages, siblings);

  return (
    <nav className={`ui-pagination ${className}`} aria-label="Pagination">
      <button
        type="button"
        className="ui-page-btn"
        onClick={() => onChange?.(page - 1)}
        disabled={page <= 1}
        aria-label="Previous"
      >
        <FaChevronLeft />
      </button>

      {items.map((it, i) =>
        it === "…" ? (
          <span key={`e-${i}`} className="ui-page-ellipsis">…</span>
        ) : (
          <button
            key={it}
            type="button"
            className={`ui-page-btn ${page === it ? "active" : ""}`}
            onClick={() => onChange?.(it)}
          >
            {it}
          </button>
        )
      )}

      <button
        type="button"
        className="ui-page-btn"
        onClick={() => onChange?.(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next"
      >
        <FaChevronRight />
      </button>
    </nav>
  );
}
