import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEye,
  FaSearch,
  FaFilter,
  FaPaw,
  FaDog,
  FaCat,
  FaHeartbeat,
  FaSyringe,
  FaStethoscope,
} from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";
import { formatDate } from "../i18n/format";

const DATA = [
  { no: 1, nama: "Milo", jenis: "Kucing", ras: "Persia", umur: 2, kelamin: "Jantan", pemilik: "Budi Santoso", status: "Sehat", terakhir: "10 Apr 2026" },
  { no: 2, nama: "Rocky", jenis: "Anjing", ras: "Golden Retriever", umur: 3, kelamin: "Jantan", pemilik: "Andi Wijaya", status: "Perawatan", terakhir: "05 Mei 2026" },
  { no: 3, nama: "Luna", jenis: "Kucing", ras: "Anggora", umur: 1, kelamin: "Betina", pemilik: "Sari Indah", status: "Vaksin", terakhir: "01 Mei 2026" },
  { no: 4, nama: "Bruno", jenis: "Anjing", ras: "Bulldog", umur: 4, kelamin: "Jantan", pemilik: "Rizky Pratama", status: "Sehat", terakhir: "28 Apr 2026" },
  { no: 5, nama: "Coco", jenis: "Kucing", ras: "Maine Coon", umur: 2, kelamin: "Betina", pemilik: "Dewi Lestari", status: "Perawatan", terakhir: "02 Mei 2026" },
];

const STATUS_COLOR = {
  Sehat: "success",
  Perawatan: "warning",
  Vaksin: "info",
};

function PetIcon({ jenis }) {
  if (jenis === "Anjing") return <FaDog />;
  if (jenis === "Kucing") return <FaCat />;
  return <FaPaw />;
}

export default function Hewan() {
  const { t, lang } = useLang();
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("Semua");

  // Label umur yang ikut bahasa
  const formatAge = (n) => (lang === "en" ? `${n} year${n > 1 ? "s" : ""}` : `${n} Tahun`);

  const filtered = useMemo(() => {
    return DATA.filter((d) => {
      const q = keyword.toLowerCase();
      const matchKey =
        d.nama.toLowerCase().includes(q) ||
        d.pemilik.toLowerCase().includes(q) ||
        d.ras.toLowerCase().includes(q);
      const matchFilter = filter === "Semua" || d.jenis === filter;
      return matchKey && matchFilter;
    });
  }, [keyword, filter]);

  const stats = useMemo(
    () => ({
      total: DATA.length,
      sehat: DATA.filter((d) => d.status === "Sehat").length,
      perawatan: DATA.filter((d) => d.status === "Perawatan").length,
      vaksin: DATA.filter((d) => d.status === "Vaksin").length,
    }),
    []
  );

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>{t("hewan.title")}</h1>
          <p>{t("hewan.breadcrumb")}</p>
        </div>

        <button className="add-button">
          <FaPlus /> {t("hewan.addBtn")}
        </button>
      </div>

      {/* MINI STATS */}
      <div className="mini-stats">
        <div className="mini-stat">
          <div className="mini-stat-icon primary"><FaPaw /></div>
          <div><p>{t("hewan.totalHewan")}</p><h3>{stats.total}</h3></div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon success"><FaHeartbeat /></div>
          <div><p>{t("hewan.kondisiSehat")}</p><h3>{stats.sehat}</h3></div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon warning"><FaStethoscope /></div>
          <div><p>{t("hewan.perawatan")}</p><h3>{stats.perawatan}</h3></div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon info"><FaSyringe /></div>
          <div><p>{t("hewan.vaksinasi")}</p><h3>{stats.vaksin}</h3></div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="toolbar-search">
          <FaSearch />
          <input
            type="text"
            placeholder={t("hewan.searchPlaceholder")}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="filter-chips">
          <FaFilter className="filter-icon" />
          {[
            { key: "Semua", label: t("common.all") },
            { key: "Kucing", label: t("jenis.Kucing") },
            { key: "Anjing", label: t("jenis.Anjing") },
          ].map((f) => (
            <button
              key={f.key}
              className={`chip ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <div className="card-header">
          <h3>{t("hewan.daftarHewan")}</h3>
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
                <th>{t("table.jenisRas")}</th>
                <th>{t("table.umur")}</th>
                <th>{t("table.kelamin")}</th>
                <th>{t("table.pemilik")}</th>
                <th>{t("table.kunjunganTerakhir")}</th>
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

              {filtered.map((item) => (
                <tr key={item.no}>
                  <td className="muted">#{String(item.no).padStart(2, "0")}</td>

                  <td>
                    <div className="pet-cell">
                      <div className={`pet-thumb ${item.jenis === "Anjing" ? "orange" : "blue"}`}>
                        <PetIcon jenis={item.jenis} />
                      </div>
                      <div>
                        <b>{item.nama}</b>
                        <small>ID-HW{String(item.no).padStart(3, "0")}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <b>{t(`jenis.${item.jenis}`)}</b>
                    <small className="block muted">{item.ras}</small>
                  </td>

                  <td>{formatAge(item.umur)}</td>

                  <td>
                    <span className={`gender ${item.kelamin === "Jantan" ? "male" : "female"}`}>
                      {t(`kelamin.${item.kelamin}`)}
                    </span>
                  </td>

                  <td>{item.pemilik}</td>

                  <td className="muted">{formatDate(item.terakhir, lang)}</td>

                  <td>
                    <span className={`status-pill ${STATUS_COLOR[item.status]}`}>
                      <span className="dot" /> {t(`status.${item.status}`)}
                    </span>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <Link to={`/hewan/${item.no}`} className="detail-btn">
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
