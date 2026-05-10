import { useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaFileInvoice,
} from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";
import { formatDate, formatCurrency } from "../i18n/format";

const DATA = [
  { no: 1, invoice: "INV-20260510-001", hewan: "Milo",  pemilik: "Budi Santoso",  layananKey: "vaksinRabies", tanggal: "10 Mei 2026", metodeKey: "transferBca", total: 250000,  status: "Lunas"      },
  { no: 2, invoice: "INV-20260505-002", hewan: "Rocky", pemilik: "Andi Wijaya",   layananKey: "operasiRingan",tanggal: "05 Mei 2026", metodeKey: "qris",        total: 1750000, status: "Lunas"      },
  { no: 3, invoice: "INV-20260501-003", hewan: "Luna",  pemilik: "Sari Indah",    layananKey: "vaksinTricat", tanggal: "01 Mei 2026", metodeKey: "tunai",       total: 180000,  status: "Lunas"      },
  { no: 4, invoice: "INV-20260428-004", hewan: "Bruno", pemilik: "Rizky Pratama", layananKey: "konsulKulit",  tanggal: "28 Apr 2026", metodeKey: "belumBayar",  total: 150000,  status: "Pending"    },
  { no: 5, invoice: "INV-20260502-005", hewan: "Coco",  pemilik: "Dewi Lestari",  layananKey: "checkupRutin", tanggal: "02 Mei 2026", metodeKey: "none",        total: 120000,  status: "Dibatalkan" },
];

const LAYANAN = {
  id: {
    vaksinRabies: "Vaksin Rabies",
    operasiRingan: "Operasi Ringan",
    vaksinTricat: "Vaksin Tricat",
    konsulKulit: "Konsultasi Kulit",
    checkupRutin: "Checkup Rutin",
  },
  en: {
    vaksinRabies: "Rabies Vaccine",
    operasiRingan: "Minor Surgery",
    vaksinTricat: "Tricat Vaccine",
    konsulKulit: "Skin Consultation",
    checkupRutin: "Routine Checkup",
  },
};

const METODE = {
  id: {
    transferBca: "Transfer BCA",
    qris: "QRIS",
    tunai: "Tunai",
    belumBayar: "Belum Bayar",
    none: "-",
  },
  en: {
    transferBca: "BCA Transfer",
    qris: "QRIS",
    tunai: "Cash",
    belumBayar: "Unpaid",
    none: "-",
  },
};

const STATUS_COLOR = {
  Lunas: "success",
  Pending: "warning",
  Dibatalkan: "danger",
};

const STATUS_ICON = {
  Lunas: <FaCheckCircle />,
  Pending: <FaClock />,
  Dibatalkan: <FaTimesCircle />,
};

export default function Pembayaran() {
  const { t, lang } = useLang();
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("Semua");

  const layananLabel = (key) => LAYANAN[lang]?.[key] ?? key;
  const metodeLabel = (key) => METODE[lang]?.[key] ?? key;

  const filtered = useMemo(() => {
    const q = keyword.toLowerCase();
    return DATA.filter((d) => {
      const matchKey =
        d.hewan.toLowerCase().includes(q) ||
        d.pemilik.toLowerCase().includes(q) ||
        d.invoice.toLowerCase().includes(q) ||
        layananLabel(d.layananKey).toLowerCase().includes(q);
      const matchFilter = filter === "Semua" || d.status === filter;
      return matchKey && matchFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, filter, lang]);

  const stats = useMemo(() => {
    const lunas = DATA.filter((d) => d.status === "Lunas");
    const pending = DATA.filter((d) => d.status === "Pending");
    return {
      totalPemasukan: lunas.reduce((a, b) => a + b.total, 0),
      totalPending: pending.reduce((a, b) => a + b.total, 0),
      jumlahLunas: lunas.length,
      jumlahPending: pending.length,
    };
  }, []);

  const filterKeys = ["Semua", "Lunas", "Pending", "Dibatalkan"];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t("pembayaran.title")}</h1>
          <p>{t("pembayaran.breadcrumb")}</p>
        </div>
        <button className="add-button">
          <FaPlus /> {t("pembayaran.addBtn")}
        </button>
      </div>

      <div className="mini-stats">
        <div className="mini-stat">
          <div className="mini-stat-icon success"><FaMoneyBillWave /></div>
          <div>
            <p>{t("pembayaran.totalPemasukan")}</p>
            <h3>{formatCurrency(stats.totalPemasukan, lang)}</h3>
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon warning"><FaClock /></div>
          <div>
            <p>{t("pembayaran.totalPending")}</p>
            <h3>{formatCurrency(stats.totalPending, lang)}</h3>
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon primary"><FaCheckCircle /></div>
          <div>
            <p>{t("pembayaran.transaksiLunas")}</p>
            <h3>{stats.jumlahLunas}</h3>
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon info"><FaFileInvoice /></div>
          <div>
            <p>{t("pembayaran.menungguBayar")}</p>
            <h3>{stats.jumlahPending}</h3>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <FaSearch />
          <input
            type="text"
            placeholder={t("pembayaran.searchPlaceholder")}
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
          <h3>{t("pembayaran.riwayat")}</h3>
          <span>
            {t("common.showing")} {filtered.length} {t("common.data")}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="pretty-table">
            <thead>
              <tr>
                <th>{t("table.invoice")}</th>
                <th>{t("table.hewan")}</th>
                <th>{t("table.pemilik")}</th>
                <th>{t("table.layanan")}</th>
                <th>{t("table.tanggal")}</th>
                <th>{t("table.metode")}</th>
                <th style={{ textAlign: "right" }}>{t("table.total")}</th>
                <th>{t("table.status")}</th>
                <th style={{ textAlign: "right" }}>{t("table.berkas")}</th>
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
                  <td>
                    <span className="code-tag">{item.invoice}</span>
                  </td>

                  <td><b>{item.hewan}</b></td>
                  <td>{item.pemilik}</td>

                  <td>
                    <span className="spec-tag">{layananLabel(item.layananKey)}</span>
                  </td>

                  <td className="muted">{formatDate(item.tanggal, lang)}</td>
                  <td>{metodeLabel(item.metodeKey)}</td>

                  <td style={{ textAlign: "right" }}>
                    <b className="amount">{formatCurrency(item.total, lang)}</b>
                  </td>

                  <td>
                    <span className={`status-pill ${STATUS_COLOR[item.status]}`}>
                      {STATUS_ICON[item.status]} {t(`status.${item.status}`)}
                    </span>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <button className="detail-btn">
                      <FaFileInvoice /> {t("common.invoice")}
                    </button>
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
