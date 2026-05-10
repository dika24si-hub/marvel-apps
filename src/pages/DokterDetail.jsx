import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUserMd,
  FaEnvelope,
  FaPhoneAlt,
  FaGraduationCap,
  FaStethoscope,
  FaCalendarAlt,
  FaStar,
  FaBriefcaseMedical,
  FaCheckCircle,
  FaUsers,
  FaAward,
  FaPrint,
} from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";
import { formatDate } from "../i18n/format";

const DATA_DOKTER = {
  1: {
    id: 1,
    nama: "Dr. Dika Pratama",
    spesialisKey: "bedah",
    pendidikan: "Universitas Gadjah Mada",
    pengalaman: 8,
    rating: 4.9,
    totalPasien: 124,
    totalOperasi: 56,
    status: "Aktif",
    email: "dika@vetcare.id",
    telepon: "0812-0000-1111",
    alamat: "Jakarta Selatan",
    bioKey: "dika",
    sertifikasi: ["sertBedah", "sertAdvSurg", "sertEmergency"],
    jadwal: [
      { hariKey: "Senin", jam: "08:00 - 14:00", status: "Tersedia" },
      { hariKey: "Selasa", jam: "08:00 - 14:00", status: "Tersedia" },
      { hariKey: "Rabu", jam: "13:00 - 20:00", status: "Tersedia" },
      { hariKey: "Kamis", jam: "-", status: "Libur" },
      { hariKey: "Jumat", jam: "08:00 - 14:00", status: "Tersedia" },
    ],
    pasien: [
      { nama: "Milo",  jenis: "Kucing", tindakanKey: "vaksinRabies",  tanggal: "10 Apr 2026" },
      { nama: "Rocky", jenis: "Anjing", tindakanKey: "vaksinDhpp",    tanggal: "20 Apr 2026" },
      { nama: "Coco",  jenis: "Kucing", tindakanKey: "checkupRutin",  tanggal: "02 Mei 2026" },
    ],
  },
  2: {
    id: 2,
    nama: "Dr. Clara Wijayanti",
    spesialisKey: "grooming",
    pendidikan: "Institut Pertanian Bogor",
    pengalaman: 5,
    rating: 4.7,
    totalPasien: 86,
    totalOperasi: 12,
    status: "Aktif",
    email: "clara@vetcare.id",
    telepon: "0813-2222-3333",
    alamat: "Bogor",
    bioKey: "clara",
    sertifikasi: ["sertGroomer", "sertFeline"],
    jadwal: [
      { hariKey: "Senin",  jam: "13:00 - 20:00", status: "Tersedia" },
      { hariKey: "Kamis",  jam: "08:00 - 14:00", status: "Tersedia" },
      { hariKey: "Sabtu",  jam: "09:00 - 16:00", status: "Tersedia" },
    ],
    pasien: [
      { nama: "Milo",  jenis: "Kucing", tindakanKey: "grooming", tanggal: "02 Mar 2026" },
      { nama: "Bruno", jenis: "Anjing", tindakanKey: "grooming", tanggal: "28 Apr 2026" },
    ],
  },
  3: {
    id: 3,
    nama: "Dr. Felix Hartanto",
    spesialisKey: "bedahTrauma",
    pendidikan: "Universitas Airlangga",
    pengalaman: 10,
    rating: 5.0,
    totalPasien: 210,
    totalOperasi: 98,
    status: "Aktif",
    email: "felix@vetcare.id",
    telepon: "0814-5555-6666",
    alamat: "Surabaya",
    bioKey: "felix",
    sertifikasi: ["sertBoard", "sertTrauma"],
    jadwal: [
      { hariKey: "Selasa", jam: "13:00 - 20:00", status: "Tersedia" },
      { hariKey: "Rabu",   jam: "08:00 - 14:00", status: "Tersedia" },
      { hariKey: "Jumat",  jam: "13:00 - 20:00", status: "Tersedia" },
    ],
    pasien: [
      { nama: "Rocky", jenis: "Anjing", tindakanKey: "operasiRingan", tanggal: "05 Mei 2026" },
    ],
  },
};

const LABELS = {
  id: {
    spesialis: {
      bedah: "Bedah Hewan",
      grooming: "Perawatan & Grooming",
      bedahTrauma: "Bedah & Trauma",
    },
    pendidikanExt: "",
    bio: {
      dika: "Dokter hewan berpengalaman di bidang bedah dengan fokus pada prosedur minimal invasif untuk anjing dan kucing. Memiliki sertifikasi internasional dalam veterinary surgery.",
      clara: "Spesialis perawatan rutin dan grooming hewan peliharaan eksotis, berpengalaman menangani ratusan kasus grooming kucing ras panjang.",
      felix: "Dokter bedah senior yang menangani kasus trauma dan operasi mayor pada hewan besar maupun kecil.",
    },
    cert: {
      sertBedah: "Sertifikasi Bedah Hewan – PDHI 2020",
      sertAdvSurg: "Advanced Veterinary Surgery – Singapore 2022",
      sertEmergency: "Pet Emergency Response Certified 2023",
      sertGroomer: "Certified Pet Groomer – IPB 2021",
      sertFeline: "Feline Care Specialist 2022",
      sertBoard: "Board Certified Surgeon – WSAVA 2018",
      sertTrauma: "Emergency Trauma Specialist 2020",
    },
    tindakan: {
      vaksinRabies: "Vaksin Rabies",
      vaksinDhpp: "Vaksin DHPP",
      checkupRutin: "Checkup Rutin",
      grooming: "Grooming",
      operasiRingan: "Operasi Ringan",
    },
  },
  en: {
    spesialis: {
      bedah: "Veterinary Surgery",
      grooming: "Grooming & Wellness",
      bedahTrauma: "Surgery & Trauma",
    },
    pendidikanExt: "",
    bio: {
      dika: "Experienced veterinarian specializing in minimally invasive surgery for dogs and cats, with international certifications in veterinary surgery.",
      clara: "Specialist in routine care and exotic pet grooming, with years of experience handling long-haired cat grooming cases.",
      felix: "Senior surgeon handling trauma and major surgeries in both large and small animals.",
    },
    cert: {
      sertBedah: "Veterinary Surgery Certification – PDHI 2020",
      sertAdvSurg: "Advanced Veterinary Surgery – Singapore 2022",
      sertEmergency: "Pet Emergency Response Certified 2023",
      sertGroomer: "Certified Pet Groomer – IPB 2021",
      sertFeline: "Feline Care Specialist 2022",
      sertBoard: "Board Certified Surgeon – WSAVA 2018",
      sertTrauma: "Emergency Trauma Specialist 2020",
    },
    tindakan: {
      vaksinRabies: "Rabies Vaccine",
      vaksinDhpp: "DHPP Vaccine",
      checkupRutin: "Routine Checkup",
      grooming: "Grooming",
      operasiRingan: "Minor Surgery",
    },
  },
};

const AVATAR_THEMES = ["purple", "teal", "orange", "blue", "pink"];

function initials(fullName) {
  const parts = fullName.replace("Dr. ", "").split(" ");
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export default function DokterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const dokter = DATA_DOKTER[id];

  const specLabel = (k) => LABELS[lang]?.spesialis?.[k] ?? k;
  const bioLabel = (k) => LABELS[lang]?.bio?.[k] ?? k;
  const certLabel = (k) => LABELS[lang]?.cert?.[k] ?? k;
  const tindLabel = (k) => LABELS[lang]?.tindakan?.[k] ?? k;
  const expLabel = (n) => (lang === "en" ? `${n} years` : `${n} Tahun`);

  if (!dokter) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>{t("dokterDetail.notFoundTitle")}</h1>
            <p>
              {t("common.home")} / {t("dokter.title")} / {t("common.detail")}
            </p>
          </div>
          <button className="add-button" onClick={() => navigate("/dokter")}>
            <FaArrowLeft /> {t("common.back")}
          </button>
        </div>
        <div className="table-card">
          <p style={{ color: "#64748b" }}>
            {t("dokterDetail.notFoundDesc")} <b>{id}</b> {t("dokterDetail.notFoundDesc2")}
          </p>
        </div>
      </div>
    );
  }

  const theme = AVATAR_THEMES[(Number(id) - 1) % AVATAR_THEMES.length];
  const activeDays = dokter.jadwal.filter((j) => j.status === "Tersedia").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t("dokterDetail.title")}</h1>
          <p>
            {t("dokterDetail.breadcrumb")} / {dokter.nama}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-ghost" onClick={() => window.print()}>
            <FaPrint /> {t("common.print")}
          </button>
          <Link to="/dokter" className="add-button">
            <FaArrowLeft /> {t("common.back")}
          </Link>
        </div>
      </div>

      {/* HERO */}
      <div className="detail-hero hero-doctor">
        <div className="hero-bg-pattern" />

        <div className="hero-content">
          <div className={`hero-doctor-avatar ${theme}`}>
            {initials(dokter.nama)}
          </div>

          <div className="hero-text">
            <span className="status-pill success">
              <FaCheckCircle /> {t(`status.${dokter.status}`)}
            </span>

            <h2>{dokter.nama}</h2>
            <p className="hero-meta">
              <FaStethoscope /> {specLabel(dokter.spesialisKey)}
            </p>

            <div className="hero-chips">
              <span className="chip-ghost">
                <FaStar style={{ color: "#fde68a" }} /> {dokter.rating} / 5.0
              </span>
              <span className="chip-ghost">
                <FaGraduationCap /> {dokter.pendidikan}
              </span>
              <span className="chip-ghost">
                <FaBriefcaseMedical /> {expLabel(dokter.pengalaman)}
              </span>
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <p>{t("dokterDetail.totalPasien")}</p>
            <h3>{dokter.totalPasien}</h3>
          </div>
          <div className="hero-stat">
            <p>{t("dokterDetail.operasiSukses")}</p>
            <h3>{dokter.totalOperasi}</h3>
          </div>
          <div className="hero-stat">
            <p>{t("dokterDetail.rating")}</p>
            <h3>{dokter.rating} ⭐</h3>
          </div>
        </div>
      </div>

      <div className="detail-grid-pro">
        <div className="stack">
          <div className="detail-card">
            <h3 className="section-title">
              <FaUserMd /> {t("dokterDetail.tentang")}
            </h3>
            <p className="bio-text">{bioLabel(dokter.bioKey)}</p>
          </div>

          <div className="detail-card">
            <h3 className="section-title">
              <FaEnvelope /> {t("dokterDetail.kontak")}
            </h3>

            <ul className="info-list">
              <li>
                <span><FaEnvelope /> {t("dokterDetail.email")}</span>
                <b>{dokter.email}</b>
              </li>
              <li>
                <span><FaPhoneAlt /> {t("dokterDetail.telepon")}</span>
                <b>{dokter.telepon}</b>
              </li>
              <li>
                <span>{t("dokterDetail.lokasi")}</span>
                <b>{dokter.alamat}</b>
              </li>
            </ul>
          </div>

          <div className="detail-card">
            <h3 className="section-title">
              <FaAward /> {t("dokterDetail.sertifikasi")}
            </h3>

            <ul className="cert-list">
              {dokter.sertifikasi.map((c, i) => (
                <li key={i}>
                  <FaCheckCircle /> {certLabel(c)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="stack">
          <div className="detail-card">
            <div className="card-header">
              <h3 className="section-title" style={{ margin: 0, border: 0, padding: 0 }}>
                <FaCalendarAlt /> {t("dokterDetail.jadwalPraktik")}
              </h3>
              <span>
                {activeDays} {t("common.day")}
              </span>
            </div>

            <div className="schedule-grid">
              {dokter.jadwal.map((j, i) => (
                <div
                  key={i}
                  className={`schedule-item ${j.status === "Libur" ? "off" : "on"}`}
                >
                  <b>{t(`dow.${j.hariKey}`)}</b>
                  <small>{j.jam}</small>
                  <span className={`status-pill ${j.status === "Libur" ? "danger" : "success"}`}>
                    <span className="dot" /> {t(`status.${j.status}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-card">
            <div className="card-header">
              <h3 className="section-title" style={{ margin: 0, border: 0, padding: 0 }}>
                <FaUsers /> {t("dokterDetail.pasienDitangani")}
              </h3>
              <span>
                {dokter.pasien.length} {t("common.latest")}
              </span>
            </div>

            <table className="pretty-table">
              <thead>
                <tr>
                  <th>{t("table.hewan")}</th>
                  <th>{t("table.jenis")}</th>
                  <th>{t("table.tindakan")}</th>
                  <th>{t("table.tanggal")}</th>
                </tr>
              </thead>
              <tbody>
                {dokter.pasien.map((p, i) => (
                  <tr key={i}>
                    <td><b>{p.nama}</b></td>
                    <td className="muted">{t(`jenis.${p.jenis}`)}</td>
                    <td>
                      <span className="spec-tag">{tindLabel(p.tindakanKey)}</span>
                    </td>
                    <td className="muted">{formatDate(p.tanggal, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
