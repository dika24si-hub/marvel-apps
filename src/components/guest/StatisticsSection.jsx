import React from "react";
import { FaPaw, FaUserMd, FaStethoscope, FaSmile } from "react-icons/fa";

const stats = [
  { icon: <FaPaw />, value: "12rb+", label: "Hewan Terdaftar", desc: "Peliharaan tercatat di sistem" },
  { icon: <FaUserMd />, value: "85+", label: "Dokter Hewan", desc: "Profesional & berpengalaman" },
  { icon: <FaStethoscope />, value: "240rb+", label: "Pemeriksaan", desc: "Konsultasi telah ditangani" },
  { icon: <FaSmile />, value: "98%", label: "Tingkat Kepuasan", desc: "Pelanggan merasa puas" },
];

const StatisticsSection = () => {
  return (
    <section className="stats">
      <div className="guest-container">
        <div className="section-head">
          <h2>Dipercaya ribuan pemilik hewan</h2>
          <p>
            Angka yang membuktikan komitmen kami dalam memberikan layanan
            kesehatan terbaik untuk hewan peliharaan Anda.
          </p>
        </div>

        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="num">{s.value}</div>
              <div className="label">{s.label}</div>
              <div className="desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
