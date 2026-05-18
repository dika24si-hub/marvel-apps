function getInitials(name = "") {
  const parts = name.replace(/^Dr\.\s*/i, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function Avatar({
  src,
  name = "",
  size = 40,
  theme = "purple",
  rounded = "lg",
  alt,
  className = "",
}) {
  const radius = rounded === "full" ? "50%" : "12px";
  const style = { width: size, height: size, borderRadius: radius };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`ui-avatar ${className}`}
        style={{ ...style, objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      className={`ui-avatar fallback ${theme} ${className}`}
      style={style}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
