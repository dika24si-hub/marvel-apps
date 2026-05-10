import { useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaPaw,
  FaDog,
  FaCat,
} from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";
import { formatDate } from "../i18n/format";

// Keperluan dibuat key supaya bisa di-translate
const DATA = [
  { no: 1, hewan: "Milo",  jenis: "Kucing", pemilik: "Budi Santoso",  dokter: "Dr. Dika Pratama",  tanggal: "12 Mei 2026", jam: "09:00", keperluanKey: "vaksinRabies",   ruang: "R-101", status: "Terjadwal"   },
  { no: 2, hewan: "Rocky", jenis: "Anjing", pemilik: "Andi Wijaya",   dokter: "Dr. Felix Hartanto", tanggal: "12 Mei 2026", jam: "10:30", keperluanKey: "kontrolOperasi", ruang: "R-102", status: "Berlangsung" },
  { no: 3, hewan: "Luna",  jenis: "Kucing", pemilik: "Sari Indah",    dokter: "Dr. Kiran Nugraha",  tanggal: "11 Mei 2026", jam: "13:00", keperluanKey: "vaksinTricat",   ruang: "R-103", status: "Selesai"     },
  { no: 4, hewan: "Bruno", jenis: "Anjing", pemilik: "Rizky Pratama", dokter: "Dr. Clara Wijayanti",tanggal: "13 Mei 2026", jam: "08:30", keperluanKey: "grooming",       ruang: "R-105", status: "Terjadwal"   },
  { no: 5, hewan: "Coco",  jenis: "Kucing", pemilik: "Dewi Lestari",  dokter: "Dr. Dika Pratama",   tanggal: "10 Mei 2026", jam: "15:00", keperluanKey: "checkupRutin",   ruang: "R-101", status: "Dibatalkan"  },
];

const KEPERLUAN_LABEL = {
  id: {
    vaksinRabies: "Vaksin Rabies",
    kontrolOperasi: "Kontrol Pasca Operasi",
    vaksinTricat: "Vaksin Tricat",
    grooming: "Grooming",
    checkupRutin: "Checkup Rutin",
  },
  en: {
    vaksinRabies: "Rabies Vaccine",
    kontrolOperasi: "Post-Op Checkup",
    vaksinTricat: "Tricat Vaccine",
    grooming: "Grooming",
    checkupRutin: "Routine Checkup",
  },
};

const STATUS_COLOR = {
  Terjadwal: "info",
  Berlangsung: "warning",
  Selesai: "success",
  Dibatalkan: "danger",
};

function PetIcon({ jenis }) {
  if (jenis === "Anjing") return <FaDog />;
  if (jenis === "Kucing") return <FaCat />;
  return <FaPaw />;
}

export default function Jadwal() {
  const { t, lang } = useLang();
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("Semua");

  const keperluanLabel = (key) => KEPERLUAN_LABEL[lang]?.[key] ?? key;

  const filtered = useMemo(() => {
    const q = keyword.toLowerCase();
    return DATA.filter((d) => {
      const matchKey =
        d.hewan.toLowerCase().includes(q) ||
        d.pemilik.toLowerCase().includes(q) ||
        d.dokter.toLowerCase().includes(q) ||
        keperluanLabel(d.keperluanKey).toLowerCase().includes(q);
      const matchFilter = filter === "Semua" || d.status === filter;
      return matchKey && matchFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, filter, lang]);

  const stats = useMemo(
    () => ({
      total: DATA.length,
      terjadwal: DATA.filter((d) => d.status === "Terjadwal").length,
      berlangsung: DATA.filter((d) => d.status === "Berlangsung").length,
      selesai: DATA.filter((d) => d.status === "Selesai").length,
    }),
    []
  );

  const filterKeys = ["Semua", "Terjadwal", "Berlangsung", "Selesai", "Dibatalkan"];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t("jadwal.title")}</h1>
          <p>{t("jadwal.breadcrumb")}</p>
        </div>
        <button className="add-button">
          <FaPlus /> {t("jadwal.addBtn")}
        </button>
      </div>

      <div className="mini-stats">
        <div className="mini-stat">
          <div className="mini-stat-icon primary"><FaCalendarAlt /></div>
          <div><p>{t("jadwal.totalJadwal")}</p><h3>{stats.total}</h3></div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon info"><FaClock /></div>
          <div><p>{t("jadwal.terjadwal")}</p><h3>{stats.terjadwal}</h3></div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon warning"><FaClock /></div>
          <div><p>{t("jadwal.berlangsung")}</p><h3>{stats.berlangsung}</h3></div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon success"><FaCheckCircle /></div>
          <div><p>{t("jadwal.selesai")}</p><h3>{stats.selesai}</h3></div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <FaSearch />
          <input
            type="text"
            placeholder={t("jadwal.searchPlaceholder")}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="filter-chips">
          <FaFilter className="filter-icon" />
          {filterKeys.map((f) => (
            <button
              key={f}
              className={`chip ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "Semua" ? t("common.all") : t(`status.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <div className="card-header">
          <h3>{t("jadwal.daftarJadwal")}</h3>
          <span>
            {t("common.showing")} {filtered.length} {t("common.data")}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="pretty-table">
            <thead>
              <tr>
                <th>{t("table.no")}</th>
                <th>{t("table.hewan")}</th>
                <th>{t("table.pemilik")}</th>
                <th>{t("table.dokter")}</th>
                <th>{t("table.tanggalJam")}</th>
                <th>{t("table.keperluan")}</th>
                <th>{t("table.ruang")}</th>
                <th>{t("table.status")}</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                    {t("common.noMatch")}
                  </td>
                </tr>
              )}

              {filtered.map((item) => (
                <tr key={item.no}>
                  <td className="muted">#{String(item.no).padStart(2, "0")}</td>

                  <td>
                    <div className="pet-cell">
                      <div className={`pet-thumb ${item.jenis === "Anjing" ? "orange" : "blue"}`}>
                        <PetIcon jenis={item.jenis} />
                      </div>
                      <div>
                        <b>{item.hewan}</b>
                        <small>{t(`jenis.${item.jenis}`)}</small>
                      </div>
                    </div>
                  </td>

                  <td>{item.pemilik}</td>
                  <td>{item.dokter}</td>

                  <td>
                    <div className="date-cell">
                      <FaCalendarAlt />
                      <div>
                        <b>{formatDate(item.tanggal, lang)}</b>
                        <small>{item.jam} {t("common.tz")}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="spec-tag">{keperluanLabel(item.keperluanKey)}</span>
                  </td>

                  <td>
                    <span className="room-tag">{item.ruang}</span>
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
    </div>
  );
}
