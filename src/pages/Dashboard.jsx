import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaArrowRight,
  FaPaw,
  FaSyringe,
  FaCalendarPlus,
  FaUserMd,
  FaProcedures,
  FaHeartbeat,
  FaSlidersH,
  FaSortAmountDown,
  FaEllipsisH,
  FaCog,
  FaDog,
  FaCat,
  FaStethoscope,
  FaUsers,
  FaCalendarCheck,
  FaCheckCircle,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useLang } from "../i18n/LanguageContext";
import {
  Tooltip as ScTooltip,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/shadcn";
import { getAdminStats } from "../lib/services";
import { supabase } from "../lib/supabase";

const STATUS_LABEL = {
  PENDING: { label: "Menunggu", pill: "pending" },
  CONFIRMED: { label: "Dikonfirmasi", pill: "pending" },
  COMPLETED: { label: "Selesai", pill: "success" },
  CANCELLED: { label: "Dibatalkan", pill: "pending" },
  NO_SHOW: { label: "Tidak Hadir", pill: "pending" },
};

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";

export default function Dashboard() {
  const { t } = useLang();
  const [stats, setStats] = useState(null);

  const loadStats = () => {
    getAdminStats()
      .then(setStats)
      .catch((err) => console.error("Gagal memuat statistik:", err.message));
  };

  useEffect(() => {
    loadStats();

    const channel = supabase
      .channel("admin-dashboard-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => loadStats())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => loadStats())
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, () => loadStats())
      .subscribe();

    const handleFocus = () => loadStats();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, []);

  // Grouping appointments ke 7 hari terakhir secara dinamis
  const weeklyChartData = useMemo(() => {
    if (!stats || !stats.appointments) return [];
    const arr = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      const dateKey = d.toDateString();

      const dayAppts = stats.appointments.filter((a) => {
        return new Date(a.scheduled_at).toDateString() === dateKey;
      });

      const visit = dayAppts.filter((a) => a.status === "PENDING" || a.status === "CONFIRMED").length;
      const treat = dayAppts.filter((a) => a.status === "COMPLETED").length;

      arr.push({
        d: dateStr,
        visit: visit,
        treat: -treat,
      });
    }
    return arr;
  }, [stats]);

  // Grouping appointments hari ini ke jam kerja (08:00 - 17:00) secara dinamis
  const dailyChartData = useMemo(() => {
    if (!stats || !stats.appointments) return [];
    const arr = [];
    const todayKey = new Date().toDateString();
    
    for (let hour = 8; hour <= 17; hour++) {
      const label = `${String(hour).padStart(2, "0")}:00`;
      
      const hourAppts = stats.appointments.filter((a) => {
        const scheduled = new Date(a.scheduled_at);
        return scheduled.toDateString() === todayKey && scheduled.getHours() === hour;
      });

      const visit = hourAppts.filter((a) => a.status === "PENDING" || a.status === "CONFIRMED").length;
      const treat = hourAppts.filter((a) => a.status === "COMPLETED").length;

      arr.push({
        d: label,
        visit: visit,
        treat: -treat,
      });
    }
    return arr;
  }, [stats]);

  // Aktivitas terbaru = 5 appointment terakhir dibuat.
  const recentAppts = useMemo(() => {
    if (!stats) return [];
    return [...stats.appointments]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [stats]);

  // Helper render bar chart (dipakai di kedua tab Mingguan & Harian)
  const renderChart = (data) => (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} stackOffset="sign">
        <CartesianGrid vertical={false} stroke="#eef1ea" />
        <XAxis
          dataKey="d"
          stroke="#aab2ac"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          interval={data.length > 12 ? 2 : 0}
        />
        <YAxis stroke="#aab2ac" tickLine={false} axisLine={false} fontSize={11} />
        <Tooltip
          cursor={{ fill: "rgba(22, 199, 132, 0.06)" }}
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #e5e9e2",
            fontSize: 12,
          }}
          formatter={(v, key) => [
            `${Math.abs(v)}`,
            key === "visit" ? t("dashboard.visit") : t("dashboard.treatment"),
          ]}
        />
        <Bar dataKey="visit" stackId="cf" fill="#0e2d24" radius={[3, 3, 0, 0]} />
        <Bar dataKey="treat" stackId="cf" fill="#16c784" radius={[0, 0, 3, 3]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const activities = [];
  void activities;

  return (
    <div>
      {/* HERO – Total pendapatan klinik */}
      <div className="balance-hero">
        <div className="balance-row">
          <div className="balance-info">
            <p>{t("dashboard.heroLabel")}</p>
            <h2>
              {stats?.totalAppointments ?? 0} Janji Temu
              <span className="delta">
                <FaArrowUp /> {stats?.byStatus?.COMPLETED ?? 0} selesai
              </span>
            </h2>
          </div>

          <div className="balance-actions">
            <ScTooltip content="Daftarkan pasien hewan baru" side="bottom">
              <button className="bh-btn primary">
                <FaPlus /> {t("dashboard.addPatient")}
              </button>
            </ScTooltip>
            <ScTooltip content="Catat vaksinasi hewan" side="bottom">
              <button className="bh-btn">
                <FaSyringe /> {t("dashboard.addVaccine")}
              </button>
            </ScTooltip>
            <ScTooltip content="Buat jadwal periksa" side="bottom">
              <button className="bh-btn">
                <FaCalendarPlus /> {t("dashboard.addAppointment")}
              </button>
            </ScTooltip>
            <ScTooltip content="Menu lainnya" side="left">
              <button className="bh-btn icon" aria-label="More">
                <FaEllipsisH />
              </button>
            </ScTooltip>
          </div>
        </div>
      </div>

      {/* CHART + KPI */}
      <div className="cashflow-row">
        <div className="flow-card">
          {/* 🟢 Shadcn Tabs — ganti view Mingguan / Harian */}
          <Tabs defaultValue="weekly">
            <div className="card-head">
              <h3>
                <FaHeartbeat /> {t("dashboard.visitChart")}
              </h3>

              <div style={{ display: "flex", gap: 10 }}>
                <TabsList>
                  <TabsTrigger value="weekly">{t("common.weekly")}</TabsTrigger>
                  <TabsTrigger value="daily">{t("common.daily")}</TabsTrigger>
                </TabsList>
                <button className="manage-btn">
                  <FaCog /> {t("common.manage")}
                </button>
              </div>
            </div>

            <TabsContent value="weekly">{renderChart(weeklyChartData)}</TabsContent>
            <TabsContent value="daily">{renderChart(dailyChartData)}</TabsContent>
          </Tabs>
        </div>

        <div className="kpi-stack">
          <div className="kpi-card">
            <div className="kpi-icon green">
              <FaUsers />
            </div>
            <div className="label">Total Member</div>
            <div className="value">
              {stats?.totalMembers ?? "—"}
              <ScTooltip content={`${stats?.newMembersThisMonth ?? 0} member baru bulan ini`} side="top">
                <span className="delta-up" style={{ marginLeft: 8 }}>
                  <FaArrowUp /> +{stats?.newMembersThisMonth ?? 0}
                </span>
              </ScTooltip>
            </div>
            <small style={{ color: "#7a857f", fontSize: 11.5, marginTop: 4 }}>
              member terdaftar
            </small>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon red">
              <FaCalendarCheck />
            </div>
            <div className="label">Total Janji Temu</div>
            <div className="value">
              {stats?.totalAppointments ?? "—"}
              <ScTooltip content={`${stats?.byStatus?.PENDING ?? 0} menunggu konfirmasi`} side="top">
                <span className="delta-up" style={{ marginLeft: 8 }}>
                  <FaCalendarCheck /> {stats?.byStatus?.PENDING ?? 0}
                </span>
              </ScTooltip>
            </div>
            <small style={{ color: "#7a857f", fontSize: 11.5, marginTop: 4 }}>
              semua waktu
            </small>
          </div>
        </div>
      </div>

      {/* 3 CARDS – stat klinik (data nyata) */}
      <div className="account-grid">
        <div className="account-card">
          <div className="account-head">
            <div className="title">
              <FaUserMd /> Dokter Aktif
            </div>
            <small>Total {stats?.totalDoctors ?? 0}</small>
          </div>
          <div className="account-value">
            {stats?.activeDoctors ?? "—"}
            <span className="delta-up">
              <FaCheckCircle />
            </span>
          </div>
          <div className="account-prev">dari {stats?.totalDoctors ?? 0} dokter terdaftar</div>
        </div>

        <div className="account-card">
          <div className="account-head">
            <div className="title">
              <FaPaw /> Hewan Terdaftar
            </div>
            <small>Total pasien</small>
          </div>
          <div className="account-value">
            {stats?.totalPets ?? "—"}
          </div>
          <div className="account-prev">hewan dari semua member</div>
        </div>

        <div className="account-card">
          <div className="account-head">
            <div className="title">
              <FaProcedures /> Janji Selesai
            </div>
            <small>Status COMPLETED</small>
          </div>
          <div className="account-value">
            {stats?.byStatus?.COMPLETED ?? "—"}
            <span className="delta-up">
              <FaArrowUp />
            </span>
          </div>
          <div className="account-prev">
            {stats?.byStatus?.CANCELLED ?? 0} dibatalkan
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY + CARD */}
      <div className="activity-row">
        <div className="activity-card">
          <div className="card-head">
            <h3>
              <FaHeartbeat /> {t("dashboard.activity")}
            </h3>

            <div className="activity-tools">
              <button className="tool-btn">
                <FaSlidersH /> {t("common.filter")}
              </button>
              <button className="tool-btn">
                <FaSortAmountDown /> {t("common.sort")}
              </button>
              <button className="tool-btn" aria-label="More">
                <FaEllipsisH />
              </button>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Pasien</th>
                <th>Keperluan</th>
                <th>Status</th>
                <th>Dokter</th>
              </tr>
            </thead>
            <tbody>
              {recentAppts.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
                    Belum ada aktivitas janji temu.
                  </td>
                </tr>
              ) : (
                recentAppts.map((a) => {
                  const st = STATUS_LABEL[a.status] ?? { label: a.status, pill: "pending" };
                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="act-type">
                          <div className="act-icon in"><FaPaw /></div>
                          <div>
                            <span className="name">{a.pet_name || "Hewan"}</span>
                            <span className="sub">{fmtTime(a.created_at)}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <b style={{ fontSize: 13 }}>{a.complaint || "Pemeriksaan"}</b>
                          <small style={{ display: "block", color: "#7a857f", fontSize: 11 }}>
                            {fmtTime(a.scheduled_at)}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className={`pill ${st.pill}`}>{st.label}</span>
                      </td>
                      <td>
                        <div>
                          <b style={{ fontSize: 13 }}>{a.doctor_name || "-"}</b>
                          <small style={{ display: "block", color: "#7a857f", fontSize: 11 }}>
                            Dokter Hewan
                          </small>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="card-preview-card">
          <div className="card-head">
            <h3>{t("dashboard.myCard")}</h3>
            <button className="see-all">
              {t("common.seeAll")} <FaArrowRight />
            </button>
          </div>

          <div className="virtual-card">
            <div className="vc-brand">VetCare</div>
            <div className="vc-num">CLN • 2026 • 2104</div>
            <div className="vc-amount">Dr. Dika Pratama</div>
            <small style={{ display: "block", marginTop: 6, opacity: 0.85, fontSize: 11.5 }}>
              {t("dashboard.memberSince")} 2018 · {t("dashboard.memberId")}: VC-001
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
