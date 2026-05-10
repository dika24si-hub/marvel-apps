import {
  FaDog,
  FaUserMd,
  FaCalendarCheck,
  FaPaw,
  FaCat,
  FaMoneyBillWave,
  FaArrowUp,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import StatsCard from "../components/StatsCard";
import { useLang } from "../i18n/LanguageContext";
import { formatDate, formatCurrency } from "../i18n/format";

// Keep base data in ID – translate at render time
const baseSurvey = [
  { m: "Jan", visit: 20, treatment: 15 },
  { m: "Feb", visit: 48, treatment: 40 },
  { m: "Mar", visit: 35, treatment: 55 },
  { m: "Apr", visit: 22, treatment: 28 },
  { m: "Mei", visit: 45, treatment: 30 },
  { m: "Jun", visit: 60, treatment: 45 },
  { m: "Jul", visit: 32, treatment: 38 },
  { m: "Agu", visit: 20, treatment: 55 },
  { m: "Sep", visit: 18, treatment: 25 },
  { m: "Okt", visit: 31, treatment: 30 },
  { m: "Nov", visit: 24, treatment: 35 },
  { m: "Des", visit: 12, treatment: 42 },
];

const baseBar = [
  { d: "Sen", vaksin: 12, periksa: 20 },
  { d: "Sel", vaksin: 18, periksa: 28 },
  { d: "Rab", vaksin: 10, periksa: 25 },
  { d: "Kam", vaksin: 21, periksa: 32 },
  { d: "Jum", vaksin: 14, periksa: 22 },
  { d: "Sab", vaksin: 25, periksa: 35 },
];

const patients = [
  { no: 1, pet: "Milo",  jenis: "Kucing", owner: "Budi Santoso",  doctor: "Dr. Dika Pratama",   date: "10 Mei 2026", diagKey: "vaksinRabies",  room: "R-101", status: "Terjadwal"   },
  { no: 2, pet: "Rocky", jenis: "Anjing", owner: "Andi Wijaya",   doctor: "Dr. Felix Hartanto", date: "05 Mei 2026", diagKey: "operasiRingan", room: "R-102", status: "Berlangsung" },
  { no: 3, pet: "Luna",  jenis: "Kucing", owner: "Sari Indah",    doctor: "Dr. Kiran Nugraha",  date: "01 Mei 2026", diagKey: "vaksinTricat",  room: "R-103", status: "Selesai"     },
  { no: 4, pet: "Bruno", jenis: "Anjing", owner: "Rizky Pratama", doctor: "Dr. Clara Wijayanti",date: "28 Apr 2026", diagKey: "grooming",      room: "R-105", status: "Selesai"     },
  { no: 5, pet: "Coco",  jenis: "Kucing", owner: "Dewi Lestari",  doctor: "Dr. Dika Pratama",   date: "02 Mei 2026", diagKey: "checkupRutin",  room: "R-101", status: "Selesai"     },
];

const DIAG_LABEL = {
  id: {
    vaksinRabies: "Vaksin Rabies",
    operasiRingan: "Operasi Ringan",
    vaksinTricat: "Vaksin Tricat",
    grooming: "Grooming",
    checkupRutin: "Checkup Rutin",
  },
  en: {
    vaksinRabies: "Rabies Vaccine",
    operasiRingan: "Minor Surgery",
    vaksinTricat: "Tricat Vaccine",
    grooming: "Grooming",
    checkupRutin: "Routine Checkup",
  },
};

const todaySchedule = [
  { jam: "09:00", hewan: "Milo",  dokter: "Dr. Dika",  keperluanKey: "vaksin",   warna: "blue"   },
  { jam: "10:30", hewan: "Rocky", dokter: "Dr. Felix", keperluanKey: "kontrol",  warna: "orange" },
  { jam: "13:00", hewan: "Luna",  dokter: "Dr. Kiran", keperluanKey: "vaksin",   warna: "blue"   },
  { jam: "15:00", hewan: "Bruno", dokter: "Dr. Clara", keperluanKey: "grooming", warna: "orange" },
];

const TODAY_LABEL = {
  id: { vaksin: "Vaksin", kontrol: "Kontrol", grooming: "Grooming" },
  en: { vaksin: "Vaccine", kontrol: "Checkup", grooming: "Grooming" },
};

const STATUS_COLOR = {
  Terjadwal: "info",
  Berlangsung: "warning",
  Selesai: "success",
  Dibatalkan: "danger",
};

export default function Dashboard() {
  const { t, lang } = useLang();

  const surveyData = baseSurvey.map((d) => ({ ...d, month: t(`month.${d.m}`) }));
  const barData = baseBar.map((d) => ({ ...d, day: t(`dow.${d.d}`) }));
  const diagLabel = (k) => DIAG_LABEL[lang]?.[k] ?? k;
  const todayLabel = (k) => TODAY_LABEL[lang]?.[k] ?? k;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t("dashboard.title")}</h1>
          <p>{t("dashboard.breadcrumb")}</p>
        </div>
        <button className="add-button">{t("dashboard.addPatient")}</button>
      </div>

      <div className="stats-grid">
        <StatsCard title={t("dashboard.totalHewan")}    value="5" icon={<FaPaw />}           color="#6c63ff" progress="70%" />
        <StatsCard title={t("dashboard.jadwalPeriksa")} value="5" icon={<FaCalendarCheck />} color="#00c9a7" progress="75%" />
        <StatsCard title={t("dashboard.dokterHewan")}   value="5" icon={<FaUserMd />}        color="#ff9f43" progress="80%" />
        <StatsCard title={t("dashboard.pendapatan")}    value={formatCurrency(2180000, lang)} icon={<FaMoneyBillWave />} color="#ff6b6b" progress="65%" />
      </div>

      <div className="dashboard-grid">
        <div className="chart-card large">
          <div className="card-header">
            <h3>{t("dashboard.statistikKunjungan")}</h3>
            <span className="trend-up"><FaArrowUp /> 2026</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={surveyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="visit" name={t("dashboard.kunjungan")} stroke="#6c63ff" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="treatment" name={t("dashboard.perawatan")} stroke="#00c9a7" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <h3>{t("dashboard.perawatanMingguan")}</h3>
            <span className="trend-up"><FaArrowUp /> +20%</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="vaksin" name={t("dashboard.vaksin")} fill="#00c9a7" radius={[6, 6, 0, 0]} />
              <Bar dataKey="periksa" name={t("dashboard.periksa")} fill="#6c63ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-grid reverse">
        <div className="table-card">
          <div className="card-header">
            <h3>{t("dashboard.daftarPasien")}</h3>
            <span>{t("dashboard.dataTerakhir")}</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="pretty-table">
              <thead>
                <tr>
                  <th>{t("table.no")}</th>
                  <th>{t("table.hewan")}</th>
                  <th>{t("table.pemilik")}</th>
                  <th>{t("table.dokter")}</th>
                  <th>{t("table.tanggal")}</th>
                  <th>{t("table.diagnosis")}</th>
                  <th>{t("table.ruang")}</th>
                  <th>{t("table.status")}</th>
                </tr>
              </thead>

              <tbody>
                {patients.map((item) => (
                  <tr key={item.no}>
                    <td className="muted">#{String(item.no).padStart(2, "0")}</td>
                    <td>
                      <div className="pet-cell">
                        <div className={`pet-thumb ${item.jenis === "Anjing" ? "orange" : "blue"}`}>
                          {item.jenis === "Anjing" ? <FaDog /> : <FaCat />}
                        </div>
                        <div>
                          <b>{item.pet}</b>
                          <small>{t(`jenis.${item.jenis}`)}</small>
                        </div>
                      </div>
                    </td>
                    <td>{item.owner}</td>
                    <td>{item.doctor}</td>
                    <td className="muted">{formatDate(item.date, lang)}</td>
                    <td>
                      <span className="spec-tag">{diagLabel(item.diagKey)}</span>
                    </td>
                    <td>
                      <span className="room-tag">{item.room}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${STATUS_COLOR[item.status]}`}>
                        <span className="dot" /> {t(`status.${item.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <h3>{t("dashboard.jadwalHariIni")}</h3>
            <span>
              {todaySchedule.length} {t("dashboard.janji")}
            </span>
          </div>

          <ul className="today-list">
            {todaySchedule.map((item, i) => (
              <li key={i}>
                <div className="time-block">
                  <b>{item.jam}</b>
                  <small>{t("common.tz")}</small>
                </div>
                <div className={`today-thumb ${item.warna}`}>
                  {item.warna === "orange" ? <FaDog /> : <FaCat />}
                </div>
                <div className="today-info">
                  <b>{item.hewan}</b>
                  <small>
                    {item.dokter} • {todayLabel(item.keperluanKey)}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
