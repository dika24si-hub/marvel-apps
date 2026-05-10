import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEye,
  FaSearch,
  FaFilter,
  FaUserMd,
  FaStar,
  FaStethoscope,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";

// Spesialis pakai key (di-translate saat render)
const DATA = [
  { no: 1, nama: "Dr. Dika Pratama",    spesialisKey: "bedah",       pendidikan: "Universitas Gadjah Mada",    pengalaman: 8,  rating: 4.9, jadwalKey: "senJum", status: "Aktif", pasien: 124 },
  { no: 2, nama: "Dr. Clara Wijayanti", spesialisKey: "grooming",    pendidikan: "Institut Pertanian Bogor",   pengalaman: 5,  rating: 4.7, jadwalKey: "senKamSab", status: "Aktif", pasien: 86 },
  { no: 3, nama: "Dr. Felix Hartanto",  spesialisKey: "bedahTrauma", pendidikan: "Universitas Airlangga",      pengalaman: 10, rating: 5.0, jadwalKey: "selJum", status: "Aktif", pasien: 210 },
  { no: 4, nama: "Dr. Kiran Nugraha",   spesialisKey: "vaksin",      pendidikan: "Universitas Brawijaya",      pengalaman: 6,  rating: 4.8, jadwalKey: "rabMin", status: "Aktif", pasien: 97 },
  { no: 5, nama: "Dr. Joseph Lim",      spesialisKey: "internal",    pendidikan: "Universitas Indonesia",      pengalaman: 12, rating: 4.9, jadwalKey: "senKam", status: "Cuti",  pasien: 180 },
];

// Label spesialis per bahasa
const SPECIALIST = {
  id: {
    bedah: "Bedah Hewan",
    grooming: "Perawatan & Grooming",
    bedahTrauma: "Bedah & Trauma",
    vaksin: "Vaksinasi & Imunologi",
    internal: "Internal Medicine",
  },
  en: {
    bedah: "Veterinary Surgery",
    grooming: "Grooming & Wellness",
    bedahTrauma: "Surgery & Trauma",
    vaksin: "Vaccination & Immunology",
    internal: "Internal Medicine",
  },
};

const SCHEDULE_LABEL = {
  id: {
    senJum: "Senin - Jumat",
    senKamSab: "Senin, Kamis, Sabtu",
    selJum: "Selasa - Jumat",
    rabMin: "Rabu - Minggu",
    senKam: "Senin - Kamis",
  },
  en: {
    senJum: "Mon - Fri",
    senKamSab: "Mon, Thu, Sat",
    selJum: "Tue - Fri",
    rabMin: "Wed - Sun",
    senKam: "Mon - Thu",
  },
};

const STATUS_COLOR = {
  Aktif: "success",
  Cuti: "warning",
  Nonaktif: "danger",
};

const AVATAR_THEMES = ["purple", "teal", "orange", "blue", "pink"];

function initials(fullName) {
  const parts = fullName.replace("Dr. ", "").split(" ");
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export default function Dokter() {
  const { t, lang } = useLang();
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("Semua");

  const specLabel = (key) => SPECIALIST[lang]?.[key] ?? key;
  const scheduleLabel = (key) => SCHEDULE_LABEL[lang]?.[key] ?? key;
  const expLabel = (n) => (lang === "en" ? `${n} years` : `${n} Tahun`);

  const spesialisList = useMemo(() => {
    const uniq = Array.from(new Set(DATA.map((d) => d.spesialisKey)));
    return ["Semua", ...uniq];
  }, []);

  const filtered = useMemo(() => {
    const q = keyword.toLowerCase();
    return DATA.filter((d) => {
      const matchKey =
        d.nama.toLowerCase().includes(q) ||
        specLabel(d.spesialisKey).toLowerCase().includes(q) ||
        d.pendidikan.toLowerCase().includes(q);
      const matchFilter = filter === "Semua" || d.spesialisKey === filter;
      return matchKey && matchFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, filter, lang]);

  const stats = useMemo(
    () => ({
      total: DATA.length,
      aktif: DATA.filter((d) => d.status === "Aktif").length,
      cuti: DATA.filter((d) => d.status === "Cuti").length,
      avgRating: (DATA.reduce((a, b) => a + b.rating, 0) / DATA.length).toFixed(1),
    }),
    []
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t("dokter.title")}</h1>
          <p>{t("dokter.breadcrumb")}</p>
        </div>

        <button className="add-button">
          <FaPlus /> {t("dokter.addBtn")}
        </button>
      </div>

      <div className="mini-stats">
        <div className="mini-stat">
          <div className="mini-stat-icon primary"><FaUserMd /></div>
          <div><p>{t("dokter.totalDokter")}</p><h3>{stats.total}</h3></div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon success"><FaCheckCircle /></div>
          <div><p>{t("dokter.sedangAktif")}</p><h3>{stats.aktif}</h3></div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon warning"><FaClock /></div>
          <div><p>{t("dokter.sedangCuti")}</p><h3>{stats.cuti}</h3></div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon info"><FaStar /></div>
          <div><p>{t("dokter.avgRating")}</p><h3>{stats.avgRating}</h3></div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <FaSearch />
          <input
            type="text"
            placeholder={t("dokter.searchPlaceholder")}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="filter-chips">
          <FaFilter className="filter-icon" />
          {spesialisList.map((f) => (
            <button
              key={f}
              className={`chip ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "Semua" ? t("common.all") : specLabel(f)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <div className="card-header">
          <h3>{t("dokter.daftarDokter")}</h3>
          <span>
            {t("common.showing")} {filtered.length} {t("common.data")}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="pretty-table">
            <thead>
              <tr>
                <th>{t("table.no")}</th>
                <th>{t("table.dokter")}</th>
                <th>{t("table.spesialis")}</th>
                <th>{t("table.pendidikan")}</th>
                <th>{t("table.pengalaman")}</th>
                <th>{t("table.rating")}</th>
                <th>{t("table.jadwal")}</th>
                <th>{t("table.status")}</th>
                <th style={{ textAlign: "right" }}>{t("table.aksi")}</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                    {t("common.noMatch")}
                  </td>
                </tr>
              )}

              {filtered.map((item, idx) => (
                <tr key={item.no}>
                  <td className="muted">#{String(item.no).padStart(2, "0")}</td>

                  <td>
                    <div className="pet-cell">
                      <div className={`doctor-thumb ${AVATAR_THEMES[idx % AVATAR_THEMES.length]}`}>
                        {initials(item.nama)}
                      </div>
                      <div>
                        <b>{item.nama}</b>
                        <small>ID-DR{String(item.no).padStart(3, "0")}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="spec-tag">
                      <FaStethoscope /> {specLabel(item.spesialisKey)}
                    </span>
                  </td>

                  <td className="muted">{item.pendidikan}</td>
                  <td>{expLabel(item.pengalaman)}</td>

                  <td>
                    <span className="rating">
                      <FaStar /> {item.rating}
                    </span>
                  </td>

                  <td className="muted">{scheduleLabel(item.jadwalKey)}</td>

                  <td>
                    <span className={`status-pill ${STATUS_COLOR[item.status]}`}>
                      <span className="dot" /> {t(`status.${item.status}`)}
                    </span>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <Link to={`/dokter/${item.no}`} className="detail-btn">
                      <FaEye /> {t("common.detail")}
                    </Link>
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
