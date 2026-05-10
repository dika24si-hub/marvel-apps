import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaw,
  FaDog,
  FaCat,
  FaUser,
  FaBirthdayCake,
  FaVenusMars,
  FaWeight,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaNotesMedical,
  FaHeartbeat,
  FaSyringe,
  FaStethoscope,
  FaClipboardList,
  FaPrint,
} from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";
import { formatDate } from "../i18n/format";

const DATA_HEWAN = {
  1: {
    id: 1,
    nama: "Milo",
    jenis: "Kucing",
    ras: "Persia",
    umur: 2,
    kelamin: "Jantan",
    berat: "4.2 kg",
    warnaKey: "whiteGray",
    mikrochip: "ID-HW001",
    status: "Sehat",
    pemilik: "Budi Santoso",
    telepon: "0812-3456-7890",
    email: "budi.santoso@mail.com",
    alamat: "Jl. Melati No. 12, Jakarta Selatan",
    totalKunjungan: 12,
    totalVaksin: 4,
    terakhirPeriksa: "10 Apr 2026",
    riwayat: [
      { tanggal: "10 Apr 2026", tindakanKey: "vaksinRabies",  dokter: "Dr. Dika Pratama",   kategori: "Vaksin",      catatanKey: "reaksiBaik" },
      { tanggal: "02 Mar 2026", tindakanKey: "grooming",      dokter: "Dr. Clara Wijayanti", kategori: "Perawatan",  catatanKey: "mandiKuku"  },
      { tanggal: "15 Feb 2026", tindakanKey: "cekKesehatan",  dokter: "Dr. Dika Pratama",   kategori: "Konsultasi",  catatanKey: "prima"      },
    ],
  },
  2: {
    id: 2,
    nama: "Rocky",
    jenis: "Anjing",
    ras: "Golden Retriever",
    umur: 3,
    kelamin: "Jantan",
    berat: "28.5 kg",
    warnaKey: "goldenBrown",
    mikrochip: "ID-HW002",
    status: "Perawatan",
    pemilik: "Andi Wijaya",
    telepon: "0812-1111-2222",
    email: "andi.wijaya@mail.com",
    alamat: "Jl. Kenanga No. 5, Bandung",
    totalKunjungan: 18,
    totalVaksin: 6,
    terakhirPeriksa: "05 Mei 2026",
    riwayat: [
      { tanggal: "05 Mei 2026", tindakanKey: "fiksasi",      dokter: "Dr. Felix Hartanto", kategori: "Operasi", catatanKey: "pemulihan2Minggu" },
      { tanggal: "20 Apr 2026", tindakanKey: "vaksinDhpp",   dokter: "Dr. Dika Pratama",   kategori: "Vaksin",  catatanKey: "injeksiLancar"    },
    ],
  },
  3: {
    id: 3,
    nama: "Luna",
    jenis: "Kucing",
    ras: "Anggora",
    umur: 1,
    kelamin: "Betina",
    berat: "3.0 kg",
    warnaKey: "gray",
    mikrochip: "ID-HW003",
    status: "Vaksin",
    pemilik: "Sari Indah",
    telepon: "0813-9999-8888",
    email: "sari.indah@mail.com",
    alamat: "Jl. Anggrek No. 22, Surabaya",
    totalKunjungan: 5,
    totalVaksin: 2,
    terakhirPeriksa: "01 Mei 2026",
    riwayat: [
      { tanggal: "01 Mei 2026", tindakanKey: "vaksinTricat", dokter: "Dr. Kiran Nugraha", kategori: "Vaksin", catatanKey: "vaksinPertama" },
    ],
  },
};

// Label lokal untuk field yang sifatnya deskriptif
const LABELS = {
  id: {
    warna: {
      whiteGray: "Putih - Abu",
      goldenBrown: "Coklat Keemasan",
      gray: "Abu-abu",
    },
    tindakan: {
      vaksinRabies: "Vaksin Rabies",
      grooming: "Grooming",
      cekKesehatan: "Cek Kesehatan Umum",
      fiksasi: "Operasi Fiksasi Minor",
      vaksinDhpp: "Vaksin DHPP",
      vaksinTricat: "Vaksin Tricat",
    },
    catatan: {
      reaksiBaik: "Reaksi baik, tidak ada efek samping.",
      mandiKuku: "Dimandikan + potong kuku.",
      prima: "Kondisi prima, berat stabil.",
      pemulihan2Minggu: "Pemulihan dipantau 2 minggu.",
      injeksiLancar: "Injeksi tanpa kendala.",
      vaksinPertama: "Vaksinasi pertama.",
    },
  },
  en: {
    warna: {
      whiteGray: "White - Gray",
      goldenBrown: "Golden Brown",
      gray: "Gray",
    },
    tindakan: {
      vaksinRabies: "Rabies Vaccine",
      grooming: "Grooming",
      cekKesehatan: "General Health Check",
      fiksasi: "Minor Fixation Surgery",
      vaksinDhpp: "DHPP Vaccine",
      vaksinTricat: "Tricat Vaccine",
    },
    catatan: {
      reaksiBaik: "Good response, no side effects.",
      mandiKuku: "Bath + nail trim.",
      prima: "Excellent condition, weight stable.",
      pemulihan2Minggu: "Recovery monitored for 2 weeks.",
      injeksiLancar: "Injection done smoothly.",
      vaksinPertama: "First vaccination.",
    },
  },
};

const STATUS_COLOR = {
  Sehat: "success",
  Perawatan: "warning",
  Vaksin: "info",
};

const KATEGORI_ICON = {
  Vaksin: <FaSyringe />,
  Konsultasi: <FaStethoscope />,
  Operasi: <FaClipboardList />,
  Perawatan: <FaHeartbeat />,
};

const KATEGORI_COLOR = {
  Vaksin: "success",
  Konsultasi: "info",
  Operasi: "warning",
  Perawatan: "primary",
};

function PetIcon({ jenis, size }) {
  const style = size ? { fontSize: size } : {};
  if (jenis === "Anjing") return <FaDog style={style} />;
  if (jenis === "Kucing") return <FaCat style={style} />;
  return <FaPaw style={style} />;
}

export default function HewanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const hewan = DATA_HEWAN[id];

  const ageLabel = (n) => (lang === "en" ? `${n} year${n > 1 ? "s" : ""}` : `${n} Tahun`);
  const tind = (k) => LABELS[lang]?.tindakan?.[k] ?? k;
  const cat = (k) => LABELS[lang]?.catatan?.[k] ?? k;
  const warna = (k) => LABELS[lang]?.warna?.[k] ?? k;

  if (!hewan) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>{t("hewanDetail.notFoundTitle")}</h1>
            <p>
              {t("common.home")} / {t("hewan.title")} / {t("common.detail")}
            </p>
          </div>
          <button className="add-button" onClick={() => navigate("/hewan")}>
            <FaArrowLeft /> {t("common.back")}
          </button>
        </div>
        <div className="table-card">
          <p style={{ color: "#64748b" }}>
            {t("hewanDetail.notFoundDesc")} <b>{id}</b> {t("hewanDetail.notFoundDesc2")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>{t("hewanDetail.title")}</h1>
          <p>
            {t("hewanDetail.breadcrumb")} / {hewan.nama}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-ghost" onClick={() => window.print()}>
            <FaPrint /> {t("common.print")}
          </button>
          <Link to="/hewan" className="add-button">
            <FaArrowLeft /> {t("common.back")}
          </Link>
        </div>
      </div>

      {/* HERO BANNER */}
      <div className={`detail-hero ${hewan.jenis === "Anjing" ? "hero-orange" : "hero-blue"}`}>
        <div className="hero-bg-pattern" />

        <div className="hero-content">
          <div className="hero-avatar">
            <PetIcon jenis={hewan.jenis} size={54} />
          </div>

          <div className="hero-text">
            <span className={`status-pill ${STATUS_COLOR[hewan.status]}`}>
              <span className="dot" /> {t(`status.${hewan.status}`)}
            </span>

            <h2>{hewan.nama}</h2>
            <p className="hero-meta">
              {t(`jenis.${hewan.jenis}`)} • {hewan.ras} • {t(`kelamin.${hewan.kelamin}`)} • {ageLabel(hewan.umur)}
            </p>

            <div className="hero-chips">
              <span className="chip-ghost"><FaWeight /> {hewan.berat}</span>
              <span className="chip-ghost"><FaPaw /> {warna(hewan.warnaKey)}</span>
              <span className="chip-ghost">ID: {hewan.mikrochip}</span>
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <p>{t("hewanDetail.totalKunjungan")}</p>
            <h3>{hewan.totalKunjungan}</h3>
          </div>
          <div className="hero-stat">
            <p>{t("hewanDetail.vaksinasi")}</p>
            <h3>{hewan.totalVaksin}</h3>
          </div>
          <div className="hero-stat">
            <p>{t("hewanDetail.terakhirPeriksa")}</p>
            <h3>{formatDate(hewan.terakhirPeriksa, lang)}</h3>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="detail-grid-pro">
        <div className="stack">
          <div className="detail-card">
            <h3 className="section-title">
              <FaPaw /> {t("hewanDetail.biodata")}
            </h3>

            <ul className="info-list">
              <li><span>{t("hewanDetail.jenis")}</span><b>{t(`jenis.${hewan.jenis}`)}</b></li>
              <li><span>{t("hewanDetail.ras")}</span><b>{hewan.ras}</b></li>
              <li><span><FaBirthdayCake /> {t("hewanDetail.umur")}</span><b>{ageLabel(hewan.umur)}</b></li>
              <li><span><FaVenusMars /> {t("hewanDetail.kelamin")}</span><b>{t(`kelamin.${hewan.kelamin}`)}</b></li>
              <li><span><FaWeight /> {t("hewanDetail.berat")}</span><b>{hewan.berat}</b></li>
              <li><span>{t("hewanDetail.warna")}</span><b>{warna(hewan.warnaKey)}</b></li>
            </ul>
          </div>

          <div className="detail-card">
            <h3 className="section-title">
              <FaUser /> {t("hewanDetail.pemilik")}
            </h3>

            <div className="owner-block">
              <div className="owner-avatar">
                {hewan.pemilik.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <div>
                <b>{hewan.pemilik}</b>
                <small>{t("common.mainOwner")}</small>
              </div>
            </div>

            <ul className="info-list">
              <li><span><FaPhoneAlt /> {t("hewanDetail.telepon")}</span><b>{hewan.telepon}</b></li>
              <li><span>{t("hewanDetail.email")}</span><b>{hewan.email}</b></li>
              <li>
                <span><FaMapMarkerAlt /> {t("hewanDetail.alamat")}</span>
                <b style={{ textAlign: "right", maxWidth: "60%" }}>{hewan.alamat}</b>
              </li>
            </ul>
          </div>
        </div>

        <div className="detail-card">
          <div className="card-header">
            <h3 className="section-title" style={{ margin: 0, border: 0, padding: 0 }}>
              <FaNotesMedical /> {t("hewanDetail.riwayat")}
            </h3>
            <span>
              {hewan.riwayat.length} {t("common.visits")}
            </span>
          </div>

          <ul className="timeline">
            {hewan.riwayat.map((item, i) => (
              <li key={i}>
                <div className={`timeline-dot ${KATEGORI_COLOR[item.kategori]}`}>
                  {KATEGORI_ICON[item.kategori]}
                </div>

                <div className="timeline-body">
                  <div className="timeline-head">
                    <b>{tind(item.tindakanKey)}</b>
                    <small>{formatDate(item.tanggal, lang)}</small>
                  </div>

                  <div className="timeline-meta">
                    <span className="spec-tag">
                      <FaStethoscope /> {item.dokter}
                    </span>
                    <span className={`status-pill ${KATEGORI_COLOR[item.kategori] === "primary" ? "info" : KATEGORI_COLOR[item.kategori]}`}>
                      {t(`kategori.${item.kategori}`)}
                    </span>
                  </div>

                  <p className="timeline-note">{cat(item.catatanKey)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
