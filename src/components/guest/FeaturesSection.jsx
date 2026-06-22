import React from "react";
import {
  FaDog,
  FaCalendarCheck,
  FaNotesMedical,
  FaCreditCard,
  FaSyringe,
  FaComments,
} from "react-icons/fa";

const features = [
  {
    icon: <FaDog />,
    title: "Data Hewan",
    desc: "Simpan profil lengkap setiap peliharaan: jenis, ras, usia, hingga riwayat kesehatan.",
  },
  {
    icon: <FaCalendarCheck />,
    title: "Jadwal Pemeriksaan",
    desc: "Booking janji temu dengan dokter hewan secara online tanpa perlu antre.",
  },
  {
    icon: <FaNotesMedical />,
    title: "Rekam Medis",
    desc: "Akses riwayat diagnosis, resep, dan tindakan medis kapan saja secara digital.",
  },
  {
    icon: <FaCreditCard />,
    title: "Pembayaran",
    desc: "Bayar layanan klinik dengan mudah dan pantau seluruh tagihan dalam satu tempat.",
  },
  {
    icon: <FaSyringe />,
    title: "Reminder Vaksin",
    desc: "Dapatkan pengingat otomatis jadwal vaksinasi agar peliharaan selalu terlindungi.",
  },
  {
    icon: <FaComments />,
    title: "Konsultasi Dokter",
    desc: "Konsultasikan kondisi hewan langsung dengan dokter profesional kami.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="fitur" className="section features">
      <div className="guest-container">
        <div className="section-head">
          <h2>Fitur Utama VetCare</h2>
          <p>
            Semua yang Anda butuhkan untuk merawat hewan peliharaan tersedia
            dalam satu platform yang mudah digunakan.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-box">
              <div className="fb-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
