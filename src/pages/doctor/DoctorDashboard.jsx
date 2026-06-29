// src/pages/doctor/DoctorDashboard.jsx
// =====================================================================
// DASHBOARD DOKTER (PRD 8.1)
//   - Ringkasan hari ini, jadwal harian, pasien, KPI
// Data nyata dari Supabase via getDoctorStats().
// =====================================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarDay, FaHourglassHalf, FaCheckCircle, FaPaw,
  FaNotesMedical, FaClock, FaArrowRight,
} from "react-icons/fa";
import { PageHeader, StatCard, Card, Badge, EmptyState } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { getDoctorStats } from "../../lib/services";
import "./doctor.css";

const STATUS_META = {
  PENDING:   { label: "Menunggu",    variant: "warning" },
  CONFIRMED: { label: "Dikonfirmasi", variant: "info" },
  COMPLETED: { label: "Selesai",     variant: "success" },
  CANCELLED: { label: "Dibatalkan",  variant: "danger" },
  NO_SHOW:   { label: "Tidak Hadir", variant: "danger" },
};
const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "";
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }) : "-";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorStats()
      .then(setStats)
      .catch((e) => console.error("Gagal memuat dashboard dokter:", e.message))
      .finally(() => setLoading(false));
  }, []);

  const firstName = (profile?.full_name || "Dokter").replace(/^drh\.?\s*/i, "").split(" ")[0];

  const todayList = (stats?.appointments || [])
    .filter((a) => {
      if (!a.scheduled_at) return false;
      const d = new Date(a.scheduled_at);
      const n = new Date();
      return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
    })
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  const upcoming = (stats?.appointments || [])
    .filter((a) => a.status === "CONFIRMED" || a.status === "PENDING")
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`Selamat datang, drh. ${firstName}`}
        subtitle={`Ringkasan praktik Anda • ${fmtDate(new Date().toISOString())}`}
      />

      {loading ? (
        <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat data...</p>
      ) : (
        <>
          <div className="mini-stats" style={{ marginTop: 14 }}>
            <StatCard icon={<FaCalendarDay />}   color="primary" label="Jadwal Hari Ini" value={stats.todayCount} />
            <StatCard icon={<FaHourglassHalf />} color="warning" label="Menunggu Konfirmasi" value={stats.pending} />
            <StatCard icon={<FaPaw />}           color="info"    label="Total Pasien" value={stats.uniquePatients} />
            <StatCard icon={<FaNotesMedical />}  color="success" label="Rekam Medis" value={stats.totalRecords} />
          </div>

          <div className="doc-dash-grid">
            <Card
              title="Jadwal Hari Ini"
              subtitle={`${todayList.length} janji temu`}
              action={
                <button className="doc-link" onClick={() => navigate("/doctor/jadwal")}>
                  Lihat semua <FaArrowRight />
                </button>
              }
            >
              {todayList.length === 0 ? (
                <EmptyState icon={<FaCalendarDay />} title="Tidak ada jadwal hari ini" />
              ) : (
                <div className="doc-timeline">
                  {todayList.map((a) => {
                    const m = STATUS_META[a.status] ?? { label: a.status, variant: "info" };
                    return (
                      <div key={a.id} className="doc-tl-item">
                        <div className="doc-tl-time">
                          <FaClock /> {fmtTime(a.scheduled_at)}
                        </div>
                        <div className="doc-tl-body">
                          <b>{a.pet_name || "Pasien"}</b>
                          <small>{a.complaint || "Pemeriksaan"}</small>
                        </div>
                        <Badge variant={m.variant} dot>{m.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card title="Antrian Berikutnya" subtitle="Janji menunggu & terkonfirmasi">
              {upcoming.length === 0 ? (
                <EmptyState icon={<FaHourglassHalf />} title="Tidak ada antrian" />
              ) : (
                <div className="doc-next-list">
                  {upcoming.map((a) => {
                    const m = STATUS_META[a.status] ?? { label: a.status, variant: "info" };
                    return (
                      <div key={a.id} className="doc-next-item" onClick={() => navigate("/doctor/jadwal")}>
                        <div className="doc-next-ic"><FaPaw /></div>
                        <div className="doc-next-info">
                          <b>{a.pet_name || "Pasien"}</b>
                          <small>{fmtDate(a.scheduled_at)} • {fmtTime(a.scheduled_at)}</small>
                        </div>
                        <Badge variant={m.variant}>{m.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
