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

// Statistik kunjungan harian (visit & treatment)
const visitData = [
  { d: "18 Apr", visit: 14, treat: -8 },
  { d: "19", visit: 22, treat: -10 },
  { d: "20", visit: 18, treat: -16 },
  { d: "21", visit: 25, treat: -9 },
  { d: "22", visit: 28, treat: -14 },
  { d: "23", visit: 20, treat: -11 },
  { d: "24", visit: 16, treat: -7 },
  { d: "25 Apr", visit: 30, treat: -10 },
  { d: "26", visit: 24, treat: -12 },
  { d: "27", visit: 26, treat: -15 },
  { d: "28", visit: 18, treat: -13 },
  { d: "29", visit: 14, treat: -8 },
  { d: "30", visit: 22, treat: -9 },
  { d: "1 Mei", visit: 28, treat: -14 },
  { d: "2", visit: 21, treat: -10 },
  { d: "3", visit: 17, treat: -8 },
  { d: "4", visit: 15, treat: -9 },
  { d: "5", visit: 26, treat: -11 },
  { d: "9 Mei", visit: 19, treat: -7 },
];

export default function Dashboard() {
  const { t } = useLang();

  const activities = [
    {
      id: 1,
      type: "in",
      icon: <FaCat />,
      name: "Milo",
      sub: t("activities.sub.milo"),
      service: t("activities.vaksin"),
      serviceSub: "08:30 WIB",
      status: t("activities.selesai"),
      pillVariant: "success",
      doctor: "Dr. Dika",
      doctorSub: t("sidebar.role"),
    },
    {
      id: 2,
      type: "out",
      icon: <FaDog />,
      name: "Rocky",
      sub: t("activities.sub.rocky"),
      service: t("activities.operasi"),
      serviceSub: "10:00 WIB",
      status: t("activities.proses"),
      pillVariant: "pending",
      doctor: "Dr. Felix",
      doctorSub: t("sidebar.role"),
    },
    {
      id: 3,
      type: "in",
      icon: <FaCat />,
      name: "Luna",
      sub: t("activities.sub.luna"),
      service: t("activities.checkup"),
      serviceSub: "13:15 WIB",
      status: t("activities.selesai"),
      pillVariant: "success",
      doctor: "Dr. Kiran",
      doctorSub: t("sidebar.role"),
    },
  ];

  return (
    <div>
      {/* HERO – Total pendapatan klinik */}
      <div className="balance-hero">
        <div className="balance-row">
          <div className="balance-info">
            <p>{t("dashboard.heroLabel")}</p>
            <h2>
              Rp 320.845.200
              <span className="delta">
                <FaArrowUp /> 15.8%
              </span>
            </h2>
          </div>

          <div className="balance-actions">
            <button className="bh-btn primary">
              <FaPlus /> {t("dashboard.addPatient")}
            </button>
            <button className="bh-btn">
              <FaSyringe /> {t("dashboard.addVaccine")}
            </button>
            <button className="bh-btn">
              <FaCalendarPlus /> {t("dashboard.addAppointment")}
            </button>
            <button className="bh-btn icon" aria-label="More">
              <FaEllipsisH />
            </button>
          </div>
        </div>
      </div>

      {/* CHART + KPI */}
      <div className="cashflow-row">
        <div className="flow-card">
          <div className="card-head">
            <h3>
              <FaHeartbeat /> {t("dashboard.visitChart")}
            </h3>

            <div style={{ display: "flex", gap: 10 }}>
              <div className="tab-group">
                <button className="active">{t("common.weekly")}</button>
                <button>{t("common.daily")}</button>
              </div>
              <button className="manage-btn">
                <FaCog /> {t("common.manage")}
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={visitData} stackOffset="sign">
              <CartesianGrid vertical={false} stroke="#eef1ea" />
              <XAxis
                dataKey="d"
                stroke="#aab2ac"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                interval={2}
              />
              <YAxis
                stroke="#aab2ac"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
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
        </div>

        <div className="kpi-stack">
          <div className="kpi-card">
            <div className="kpi-icon green">
              <FaPaw />
            </div>
            <div className="label">{t("dashboard.kpiPasien")}</div>
            <div className="value">
              218
              <span className="delta-up" style={{ marginLeft: 8 }}>
                <FaArrowUp /> 45.0%
              </span>
            </div>
            <small style={{ color: "#7a857f", fontSize: 11.5, marginTop: 4 }}>
              {t("dashboard.kpiPasienHelp")}
            </small>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon red">
              <FaSyringe />
            </div>
            <div className="label">{t("dashboard.kpiVaksin")}</div>
            <div className="value">
              74
              <span className="delta-down" style={{ marginLeft: 8 }}>
                <FaArrowDown /> 12.5%
              </span>
            </div>
            <small style={{ color: "#7a857f", fontSize: 11.5, marginTop: 4 }}>
              {t("dashboard.kpiVaksinHelp")}
            </small>
          </div>
        </div>
      </div>

      {/* 3 CARDS – stat klinik */}
      <div className="account-grid">
        <div className="account-card">
          <div className="account-head">
            <div className="title">
              <FaPaw /> {t("dashboard.cardPasienAktif")}
            </div>
            <small>{t("common.last30")}</small>
          </div>
          <div className="account-value">
            148
            <span className="delta-up">
              <FaArrowUp /> 16.0%
            </span>
          </div>
          <div className="account-prev">{t("common.vsLastPeriod")}: 128</div>
        </div>

        <div className="account-card">
          <div className="account-head">
            <div className="title">
              <FaProcedures /> {t("dashboard.cardOperasi")}
            </div>
            <small>{t("common.last30")}</small>
          </div>
          <div className="account-value">
            36
            <span className="delta-down">
              <FaArrowDown /> 8.2%
            </span>
          </div>
          <div className="account-prev">{t("common.vsLastPeriod")}: 39</div>
        </div>

        <div className="account-card">
          <div className="account-head">
            <div className="title">
              <FaSyringe /> {t("dashboard.cardVaksinLengkap")}
            </div>
            <small>{t("common.last30")}</small>
          </div>
          <div className="account-value">
            92
            <span className="delta-up">
              <FaArrowUp /> 35.2%
            </span>
          </div>
          <div className="account-prev">{t("common.vsLastPeriod")}: 68</div>
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
                <th>{t("dashboard.tableType")}</th>
                <th>{t("dashboard.tableLayanan")}</th>
                <th>{t("dashboard.tableStatus")}</th>
                <th>{t("dashboard.tableDokter")}</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="act-type">
                      <div className={`act-icon ${a.type}`}>{a.icon}</div>
                      <div>
                        <span className="name">{a.name}</span>
                        <span className="sub">{a.sub}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <b style={{ fontSize: 13 }}>{a.service}</b>
                      <small style={{ display: "block", color: "#7a857f", fontSize: 11 }}>
                        {a.serviceSub}
                      </small>
                    </div>
                  </td>
                  <td>
                    <span className={`pill ${a.pillVariant}`}>{a.status}</span>
                  </td>
                  <td>
                    <div>
                      <b style={{ fontSize: 13 }}>{a.doctor}</b>
                      <small style={{ display: "block", color: "#7a857f", fontSize: 11 }}>
                        {a.doctorSub}
                      </small>
                    </div>
                  </td>
                </tr>
              ))}
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
