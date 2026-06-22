import React from "react";
import {
  FaUserPlus,
  FaDog,
  FaCalendarAlt,
  FaStethoscope,
  FaFileMedicalAlt,
} from "react-icons/fa";

const steps = [
  { icon: <FaUserPlus />, title: "Daftar Akun", desc: "Buat akun gratis hanya dalam beberapa menit." },
  { icon: <FaDog />, title: "Tambah Data Hewan", desc: "Lengkapi profil peliharaan Anda." },
  { icon: <FaCalendarAlt />, title: "Booking Jadwal", desc: "Pilih dokter dan waktu pemeriksaan." },
  { icon: <FaStethoscope />, title: "Pemeriksaan", desc: "Datang ke klinik atau konsultasi online." },
  { icon: <FaFileMedicalAlt />, title: "Lihat Rekam Medis", desc: "Akses hasil & riwayat kesehatan." },
];

const HowItWorksSection = () => {
  return (
    <section className="section howto">
      <div className="guest-container">
        <div className="section-head">
          <h2>Cara Kerja</h2>
          <p>
            Mulai merawat hewan peliharaan Anda hanya dalam 5 langkah mudah
            bersama VetCare.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={s.title} className="step-card">
              <div className="step-num">{i + 1}</div>
              <div className="st-icon">{s.icon}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
