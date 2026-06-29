// src/pages/Analytics.jsx
// =====================================================================
// CRM ANALYTICS & LAPORAN — ADMIN (PRD 9.6)
//   - CLV rata-rata, total pendapatan, retensi
//   - Tren pendapatan & akuisisi member (6 bln)
//   - Segmentasi RFM, top member by CLV
// Data nyata via getCrmAnalytics().
// =====================================================================
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import {
  FaMoneyBillWave, FaUserFriends, FaRedo, FaCrown,
} from "react-icons/fa";
import { PageHeader, StatCard, Card, EmptyState } from "../components/ui";
import { getCrmAnalytics } from "../lib/services";
import "./doctor/doctor.css";

const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
const rupiahShort = (n) => {
  if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp${(n / 1_000).toFixed(0)}rb`;
  return `Rp${n}`;
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCrmAnalytics()
      .then(setData)
      .catch((e) => console.error("Gagal memuat analytics:", e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div><PageHeader title="CRM Analytics & Laporan" subtitle="Memuat data..." /></div>;
  }

  const segActive = data.segments.filter((s) => s.value > 0);

  return (
    <div>
      <PageHeader title="CRM Analytics & Laporan" subtitle="Insight bisnis dari data pelanggan klinik." />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaMoneyBillWave />} color="success" label="Total Pendapatan" value={rupiah(data.totalRevenue)} />
        <StatCard icon={<FaCrown />} color="primary" label="Rata-rata CLV" value={rupiah(Math.round(data.avgClv))} />
        <StatCard icon={<FaUserFriends />} color="info" label="Total Member" value={data.totalMembers} />
        <StatCard icon={<FaRedo />} color="warning" label="Retention Rate" value={`${data.retentionRate}%`} />
      </div>

      <div className="doc-dash-grid">
        <Card title="Tren Pendapatan" subtitle="6 bulan terakhir">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.monthly}>
              <defs>
                <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={rupiahShort} />
              <Tooltip formatter={(v) => rupiah(v)} contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={3} fill="url(#revArea)" name="Pendapatan" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Segmentasi Pelanggan (RFM)" subtitle="Distribusi segmen member">
          {segActive.length === 0 ? (
            <EmptyState title="Belum ada data segmen" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={segActive} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} label>
                  {segActive.map((s) => <Cell key={s.key} fill={s.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="doc-dash-grid">
        <Card title="Akuisisi Member" subtitle="Member baru per bulan">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.acquisition}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="count" fill="#a78bfa" radius={[6, 6, 0, 0]} name="Member Baru" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top Member (CLV)" subtitle="Pelanggan paling bernilai">
          {data.topMembers.length === 0 ? (
            <EmptyState icon={<FaCrown />} title="Belum ada data" />
          ) : (
            <div className="doc-diag-list">
              {data.topMembers.map((m, i) => {
                const max = data.topMembers[0].total || 1;
                return (
                  <div key={m.id} className="doc-diag-row">
                    <span className="doc-diag-rank">#{i + 1}</span>
                    <div className="doc-diag-info">
                      <div className="doc-diag-name">{m.name} <small style={{ color: "#94a3b8" }}>• {m.visits}x kunjungan</small></div>
                      <div className="doc-diag-bar"><div style={{ width: `${(m.total / max) * 100}%` }} /></div>
                    </div>
                    <span className="doc-diag-count">{rupiahShort(m.total)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
