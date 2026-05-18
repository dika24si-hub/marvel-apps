const SIZE_MAP = {
  sm: 720,
  md: 960,
  lg: 1280,
  full: "100%",
};

export default function Container({ size = "lg", className = "", children }) {
  const max = SIZE_MAP[size] ?? SIZE_MAP.lg;
  return (
    <div
      className={`ui-container ${className}`}
      style={{ maxWidth: max, width: "100%", margin: "0 auto" }}
    >
      {children}
    </div>
  );
}
