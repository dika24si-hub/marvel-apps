import React from "react";
import { FaStar, FaBriefcase } from "react-icons/fa";

const doctors = [
  {
    nama: "drh. Sinta Permata",
    spesialis: "Dokter Hewan Umum",
    pengalaman: "8 tahun pengalaman",
    rating: 4.9,
    foto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
  },
  {
    nama: "drh. Budi Hartono",
    spesialis: "Spesialis Bedah Hewan",
    pengalaman: "12 tahun pengalaman",
    rating: 4.8,
    foto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
  },
  {
    nama: "drh. Rina Wijaya",
    spesialis: "Spesialis Kulit & Gigi",
    pengalaman: "6 tahun pengalaman",
    rating: 5.0,
    foto: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80",
  },
];

const DoctorsSection = () => {
  return (
    <section id="dokter" className="section doctors">
      <div className="guest-container">
        <div className="section-head">
          <h2>Tim Dokter Hewan Kami</h2>
          <p>
            Ditangani oleh dokter hewan berpengalaman dan bersertifikat yang
            siap memberikan perawatan terbaik untuk peliharaan Anda.
          </p>
        </div>

        <div className="doctors-grid">
          {doctors.map((d) => (
            <div key={d.nama} className="doctor-card">
              <div className="doctor-photo">
                <img src={d.foto} alt={d.nama} />
                <span className="doctor-rating">
                  <FaStar /> {d.rating}
                </span>
              </div>
              <div className="doctor-info">
                <h3>{d.nama}</h3>
                <span className="doctor-spec">{d.spesialis}</span>
                <p className="doctor-exp">
                  <FaBriefcase /> {d.pengalaman}
                </p>
                <a href="#kontak" className="btn btn-outline btn-sm">
                  Buat Janji
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;
