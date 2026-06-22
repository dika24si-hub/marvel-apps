import React from "react";
import { FaStar } from "react-icons/fa";

const reviews = [
  {
    quote: "VetCare sangat membantu!",
    text: "Antarmuka intuitif dan fitur lengkapnya membuat pengelolaan rekam medis jadi rapi dan cepat. Operasional klinik kami jauh lebih efisien.",
    name: "drh. Sinta Permata",
    role: "Direktur Klinik Hewan Sehat",
    img: "https://i.pravatar.cc/120?img=47",
  },
  {
    quote: "Sangat mudah!",
    text: "Penjadwalan otomatis mengurangi antrian dan jadwal kosong. Tim kami kini bisa fokus penuh merawat pasien hewan.",
    name: "drh. Budi Hartono",
    role: "Pemilik PetCare Bandung",
    img: "https://i.pravatar.cc/120?img=12",
  },
  {
    quote: "Hemat waktu!",
    text: "Inventaris obat dan laporan keuangan dalam satu tempat. Operasional harian klinik jadi jauh lebih ringkas.",
    name: "drh. Rina Wijaya",
    role: "Manajer AnimalCare Surabaya",
    img: "https://i.pravatar.cc/120?img=32",
  },
  {
    quote: "Sangat puas!",
    text: "Dashboard analitik membantu kami memahami performa klinik dengan jelas dan mengambil keputusan yang tepat.",
    name: "drh. Andi Saputra",
    role: "Direktur VetGuard Jakarta",
    img: "https://i.pravatar.cc/120?img=15",
  },
];

const TestimonialSection = () => {
  return (
    <section className="section testimonials">
      <div className="guest-container">
        <div className="section-head">
          <h2>
            Baca ulasan dari{" "}
            <span className="text-accent">klien yang puas.</span>
          </h2>
          <p>
            Dapatkan wawasan dari umpan balik klien kami dan pelajari bagaimana
            produk serta layanan kami berdampak positif bagi klinik mereka.
          </p>
        </div>

        <div className="testi-grid">
          {reviews.map((r) => (
            <div key={r.name} className="testi-card">
              <img className="testi-photo" src={r.img} alt={r.name} />
              <div className="testi-body">
                <div className="quote">"{r.quote}"</div>
                <p>{r.text}</p>
                <div className="testi-stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <div className="testi-author">
                  <strong>{r.name}</strong>
                  <span>{r.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
