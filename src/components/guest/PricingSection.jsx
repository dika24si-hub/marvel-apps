import React from "react";
import { FaStethoscope, FaSyringe, FaCut, FaAmbulance } from "react-icons/fa";

const packages = [
  {
    icon: <FaStethoscope />,
    name: "Basic Checkup",
    price: "Rp75rb",
    desc: "Pemeriksaan kesehatan umum, cek berat badan, dan konsultasi dokter.",
  },
  {
    icon: <FaSyringe />,
    name: "Vaksinasi",
    price: "Rp150rb",
    desc: "Vaksin lengkap sesuai jadwal dengan pengingat otomatis berikutnya.",
  },
  {
    icon: <FaCut />,
    name: "Grooming",
    price: "Rp120rb",
    desc: "Mandi, potong kuku, perawatan bulu, dan pembersihan telinga.",
  },
  {
    icon: <FaAmbulance />,
    name: "Emergency Care",
    price: "24 Jam",
    desc: "Penanganan darurat cepat untuk kondisi kritis kapan saja.",
  },
];

const PricingSection = () => {
  return (
    <section id="harga" className="section packages">
      <div className="guest-container">
        <div className="section-head">
          <h2>Paket Layanan & Promo</h2>
          <p>
            Pilih layanan yang sesuai dengan kebutuhan peliharaan Anda dengan
            harga terjangkau dan transparan.
          </p>
        </div>

        <div className="package-grid">
          {packages.map((p) => (
            <div key={p.name} className="package-card">
              <div className="pk-icon">{p.icon}</div>
              <h3>{p.name}</h3>
              <div className="pk-price">{p.price}</div>
              <p>{p.desc}</p>
              <a href="#kontak" className="btn btn-primary btn-sm">
                Pilih Paket
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
