export default function StatsCard({ title, value, icon, color, progress }) {
  return (
    <div className="stats-card">
      <div className="stats-top">
        <div>
          <p>{title}</p>
          <h2>{value}</h2>
        </div>

        <div className="stats-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
      </div>

      <div className="progress-line">
        <div
          className="progress-fill"
          style={{ width: progress, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
}