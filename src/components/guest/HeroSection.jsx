import React from "react";
import { Link } from "react-router-dom";
import { FaPaw } from "react-icons/fa";

const HeroSection = () => {
  return (
    <header id="home" className="hero">
      <div className="guest-container hero-inner">
        <div className="hero-text">
          <span className="hero-badge">
            <FaPaw /> Platform Klinik Hewan Digital 🐾
          </span>
          <h1>
            Rawat hewan kesayangan lebih{" "}
            <span className="text-accent">mudah & terpercaya</span>
          </h1>
          <p>
            Kelola data hewan, jadwal pemeriksaan, rekam medis, hingga
            pembayaran dalam satu platform. Daftarkan peliharaan Anda dan
            dapatkan layanan dokter hewan profesional kapan saja.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Daftar Sekarang
            </Link>
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
          </div>

          <div className="hero-social">
            <div className="avatars">
              <span className="avatar" style={{ backgroundImage: "url(https://i.pravatar.cc/80?img=12)" }} />
              <span className="avatar" style={{ backgroundImage: "url(https://i.pravatar.cc/80?img=32)" }} />
              <span className="avatar" style={{ backgroundImage: "url(https://i.pravatar.cc/80?img=45)" }} />
            </div>
            <div className="hero-social-text">
              <strong>+12rb lebih</strong>
              <span>Hewan peliharaan terdaftar</span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=700&q=80"
              alt="Anjing dan kucing peliharaan"
            />
            <div className="hero-float-card">
              <span className="label">Pasien sehat hari ini</span>
              <strong>248 ekor</strong>
              <div className="hero-float-bar" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
