// src/pages/doctor/DoctorLaporan.jsx
// =====================================================================
// LAPORAN & STATISTIK DOKTER (PRD 8.6)
//   - Total pasien ditangani, tren kunjungan, distribusi status
//   - Diagnosis terbanyak
// Data nyata dari Supabase via getDoctorReport().
// =====================================================================
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts";
import { FaCalendarCheck, FaNotesMedical, FaCheckCircle, FaChartLine } from "react-icons/fa";
import { PageHeader, StatCard, Card, EmptyState } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { getDoctorReport } from "../../lib/services";
import "./doctor.css";

const STATUS_LABEL = {
  PENDING: "Menunggu", CONFIRMED: "Dikonfirmasi", COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan", NO_SHOW: "Tidak Hadir",
};

export default function DoctorLaporan() {
  const { profile } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    getDoctorReport(profile.id)
      .then(setReport)
      .catch((e) => console.error("Gagal memuat laporan:", e.message))
      .finally(() => setLoading(false));
  }, [profile?.id]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Laporan & Statistik" subtitle="Memuat data..." />
      </div>
    );
  }

  const statusData = Object.entries(report.byStatus || {}).map(([k, v]) => ({
    name: STATUS_LABEL[k] || k,
    value: v,
  }));
  const completed = report.byStatus?.COMPLETED || 0;

  return (
    <div>
      <PageHeader title="Laporan & Statistik" subtitle="Ringkasan kinerja praktik Anda." />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaCalendarCheck />} color="primary" label="Total Janji Temu" value={report.totalAppointments} />
        <StatCard icon={<FaCheckCircle />} color="success" label="Pemeriksaan Selesai" value={completed} />
        <StatCard icon={<FaNotesMedical />} color="info" label="Rekam Medis" value={report.totalRecords} />
        <StatCard icon={<FaChartLine />} color="warning" label="Diagnosis Unik" value={report.topDiagnoses.length} />
      </div>

      <div className="doc-dash-grid">
        <Card title="Tren Kunjungan" subtitle="6 bulan terakhir">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={report.monthly}>
              <defs>
                <linearGradient id="docArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={3} fill="url(#docArea)" name="Kunjungan" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Distribusi Status" subtitle="Janji temu per status">
          {statusData.length === 0 ? (
            <EmptyState title="Belum ada data" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Jumlah" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card title="Diagnosis Terbanyak" subtitle="Top 5 diagnosis" className="doc-mt">
        {report.topDiagnoses.length === 0 ? (
          <EmptyState icon={<FaNotesMedical />} title="Belum ada data diagnosis" />
        ) : (
          <div className="doc-diag-list">
            {report.topDiagnoses.map((d, i) => {
              const max = report.topDiagnoses[0].count || 1;
              return (
                <div key={d.name} className="doc-diag-row">
                  <span className="doc-diag-rank">#{i + 1}</span>
                  <div className="doc-diag-info">
                    <div className="doc-diag-name">{d.name}</div>
                    <div className="doc-diag-bar">
                      <div style={{ width: `${(d.count / max) * 100}%` }} />
                    </div>
                  </div>
                  <span className="doc-diag-count">{d.count}x</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
