import React from "react";
import {
  FaShieldAlt,
  FaMousePointer,
  FaClock,
  FaLaptopMedical,
  FaUserMd,
} from "react-icons/fa";

const items = [
  { icon: <FaShieldAlt />, title: "Data Aman", desc: "Informasi peliharaan terenkripsi dan terlindungi." },
  { icon: <FaMousePointer />, title: "Mudah Digunakan", desc: "Antarmuka sederhana untuk semua kalangan." },
  { icon: <FaClock />, title: "Akses Kapan Saja", desc: "Layanan tersedia 24/7 dari mana pun." },
  { icon: <FaLaptopMedical />, title: "Rekam Medis Digital", desc: "Riwayat kesehatan tersimpan rapi & permanen." },
  { icon: <FaUserMd />, title: "Dokter Profesional", desc: "Ditangani tim dokter hewan bersertifikat." },
];

const AdvantagesSection = () => {
  return (
    <section className="advantages">
      <div className="guest-container">
        <div className="section-head">
          <h2>Keunggulan Sistem Kami</h2>
          <p>
            Alasan mengapa ribuan pemilik hewan mempercayakan perawatan
            peliharaannya kepada VetCare.
          </p>
        </div>

        <div className="adv-grid">
          {items.map((it) => (
            <div key={it.title} className="adv-card">
              <div className="adv-icon">{it.icon}</div>
              <h4>{it.title}</h4>
              <p>{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
