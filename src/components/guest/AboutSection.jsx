import React from "react";
import { FaEye, FaBullseye } from "react-icons/fa";

const AboutSection = () => {
  return (
    <section id="tentang" className="section about">
      <div className="guest-container about-inner">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=700&q=80"
            alt="Klinik hewan VetCare"
          />
        </div>

        <div className="about-text">
          <h2>Tentang VetCare</h2>
          <p>
            VetCare adalah platform manajemen klinik hewan digital yang
            menghubungkan pemilik peliharaan dengan dokter hewan profesional.
            Kami berkomitmen menghadirkan layanan kesehatan hewan yang mudah,
            cepat, dan terpercaya untuk seluruh keluarga dan sahabat berbulu
            Anda.
          </p>

          <div className="vm-card">
            <div className="vm-icon"><FaEye /></div>
            <div>
              <h4>Visi</h4>
              <p>
                Menjadi platform layanan kesehatan hewan nomor satu yang
                terpercaya di Indonesia.
              </p>
            </div>
          </div>

          <div className="vm-card">
            <div className="vm-icon"><FaBullseye /></div>
            <div>
              <h4>Misi</h4>
              <p>
                Mempermudah akses layanan dokter hewan, menjaga rekam medis
                digital yang aman, dan meningkatkan kualitas perawatan hewan
                peliharaan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
