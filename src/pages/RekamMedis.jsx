import { useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaNotesMedical,
  FaSyringe,
  FaStethoscope,
  FaProcedures,
  FaFilePdf,
} from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";
import { formatDate } from "../i18n/format";

const DATA = [
  { no: 1, kode: "RM-00421", hewan: "Milo",  jenis: "Kucing", pemilik: "Budi Santoso",  dokter: "Dr. Dika Pratama",   tanggal: "10 Mei 2026", diagnosaKey: "demamRingan",   kategori: "Konsultasi", tindakanKey: "antipiretik",   obat: "Paracetamol vet"     },
  { no: 2, kode: "RM-00422", hewan: "Rocky", jenis: "Anjing", pemilik: "Andi Wijaya",   dokter: "Dr. Felix Hartanto", tanggal: "05 Mei 2026", diagnosaKey: "patahTulang",   kategori: "Operasi",    tindakanKey: "fiksasi",       obat: "Antibiotik + analgesik" },
  { no: 3, kode: "RM-00423", hewan: "Luna",  jenis: "Kucing", pemilik: "Sari Indah",    dokter: "Dr. Kiran Nugraha",  tanggal: "01 Mei 2026", diagnosaKey: "vaksinRutin",   kategori: "Vaksin",     tindakanKey: "vaksinTricat",  obat: "Tricat vaccine"      },
  { no: 4, kode: "RM-00424", hewan: "Bruno", jenis: "Anjing", pemilik: "Rizky Pratama", dokter: "Dr. Clara Wijayanti",tanggal: "28 Apr 2026", diagnosaKey: "infeksiKulit",  kategori: "Konsultasi", tindakanKey: "salepTopikal",  obat: "Salep antijamur"     },
  { no: 5, kode: "RM-00425", hewan: "Coco",  jenis: "Kucing", pemilik: "Dewi Lestari",  dokter: "Dr. Dika Pratama",   tanggal: "02 Mei 2026", diagnosaKey: "checkupRutin",  kategori: "Konsultasi", tindakanKey: "pemeriksaanUmum", obat: "-"                 },
];

const DIAGNOSA = {
  id: {
    demamRingan: "Demam Ringan",
    patahTulang: "Patah Tulang Minor",
    vaksinRutin: "Vaksinasi Rutin",
    infeksiKulit: "Infeksi Kulit",
    checkupRutin: "Checkup Rutin",
  },
  en: {
    demamRingan: "Mild Fever",
    patahTulang: "Minor Fracture",
    vaksinRutin: "Routine Vaccination",
    infeksiKulit: "Skin Infection",
    checkupRutin: "Routine Checkup",
  },
};

const TINDAKAN = {
  id: {
    antipiretik: "Pemberian antipiretik",
    fiksasi: "Operasi fiksasi ringan",
    vaksinTricat: "Vaksin Tricat",
    salepTopikal: "Pemberian salep topikal",
    pemeriksaanUmum: "Pemeriksaan umum",
  },
  en: {
    antipiretik: "Antipyretic administration",
    fiksasi: "Minor fixation surgery",
    vaksinTricat: "Tricat vaccination",
    salepTopikal: "Topical ointment",
    pemeriksaanUmum: "General examination",
  },
};

const KATEGORI_ICON = {
  Konsultasi: <FaStethoscope />,
  Vaksin: <FaSyringe />,
  Operasi: <FaProcedures />,
};

const KATEGORI_COLOR = {
  Konsultasi: "info",
  Vaksin: "success",
  Operasi: "warning",
};

export default function RekamMedis() {
  const { t, lang } = useLang();
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("Semua");

  const diagLabel = (key) => DIAGNOSA[lang]?.[key] ?? key;
  const tindakanLabel = (key) => TINDAKAN[lang]?.[key] ?? key;

  const filtered = useMemo(() => {
    const q = keyword.toLowerCase();
    return DATA.filter((d) => {
      const matchKey =
        d.hewan.toLowerCase().includes(q) ||
        d.pemilik.toLowerCase().includes(q) ||
        d.dokter.toLowerCase().includes(q) ||
        diagLabel(d.diagnosaKey).toLowerCase().includes(q) ||
        d.kode.toLowerCase().includes(q);
      const matchFilter = filter === "Semua" || d.kategori === filter;
      return matchKey && matchFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, filter, lang]);

  const stats = useMemo(
    () => ({
      total: DATA.length,
      konsultasi: DATA.filter((d) => d.kategori === "Konsultasi").length,
      vaksin: DATA.filter((d) => d.kategori === "Vaksin").length,
      operasi: DATA.filter((d) => d.kategori === "Operasi").length,
    }),
    []
  );

  const filterKeys = ["Semua", "Konsultasi", "Vaksin", "Operasi"];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t("rekamMedis.title")}</h1>
          <p>{t("rekamMedis.breadcrumb")}</p>
        </div>
        <button className="add-button">
          <FaPlus /> {t("rekamMedis.addBtn")}
        </button>
      </div>

      <div className="mini-stats">
        <div className="mini-stat">
          <div className="mini-stat-icon primary"><FaNotesMedical /></div>
          <div><p>{t("rekamMedis.totalRekam")}</p><h3>{stats.total}</h3></div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon info"><FaStethoscope /></div>
          <div><p>{t("rekamMedis.konsultasi")}</p><h3>{stats.konsultasi}</h3></div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon success"><FaSyringe /></div>
          <div><p>{t("rekamMedis.vaksinasi")}</p><h3>{stats.vaksin}</h3></div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon warning"><FaProcedures /></div>
          <div><p>{t("rekamMedis.operasi")}</p><h3>{stats.operasi}</h3></div>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-search">
          <FaSearch />
          <input
            type="text"
            placeholder={t("rekamMedis.searchPlaceholder")}
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
              {f === "Semua" ? t("common.all") : t(`kategori.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <div className="card-header">
          <h3>{t("rekamMedis.riwayat")}</h3>
          <span>
            {t("common.showing")} {filtered.length} {t("common.data")}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="pretty-table">
            <thead>
              <tr>
                <th>{t("table.kode")}</th>
                <th>{t("table.hewan")}</th>
                <th>{t("table.pemilik")}</th>
                <th>{t("table.dokter")}</th>
                <th>{t("table.tanggal")}</th>
                <th>{t("table.diagnosa")}</th>
                <th>{t("table.kategori")}</th>
                <th>{t("table.tindakanObat")}</th>
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
                    <span className="code-tag">{item.kode}</span>
                  </td>

                  <td>
                    <b>{item.hewan}</b>
                    <small className="block muted">{t(`jenis.${item.jenis}`)}</small>
                  </td>

                  <td>{item.pemilik}</td>
                  <td>{item.dokter}</td>
                  <td className="muted">{formatDate(item.tanggal, lang)}</td>

                  <td>
                    <b>{diagLabel(item.diagnosaKey)}</b>
                  </td>

                  <td>
                    <span className={`status-pill ${KATEGORI_COLOR[item.kategori]}`}>
                      {KATEGORI_ICON[item.kategori]} {t(`kategori.${item.kategori}`)}
                    </span>
                  </td>

                  <td>
                    <b style={{ fontSize: 12 }}>{tindakanLabel(item.tindakanKey)}</b>
                    <small className="block muted">{t("common.obat")}: {item.obat}</small>
                  </td>

                  <td style={{ textAlign: "right" }}>
                    <button className="detail-btn">
                      <FaFilePdf /> {t("common.pdf")}
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
