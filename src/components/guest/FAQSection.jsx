import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const faqs = [
  {
    q: "Bagaimana cara mendaftar akun?",
    a: "Klik tombol Daftar di pojok kanan atas, isi data diri Anda, lalu verifikasi email. Akun langsung aktif dan gratis.",
  },
  {
    q: "Bagaimana cara booking jadwal pemeriksaan?",
    a: "Setelah login, masuk ke menu Jadwal, pilih dokter dan waktu yang tersedia, lalu konfirmasi. Anda akan menerima pengingat otomatis.",
  },
  {
    q: "Metode pembayaran apa saja yang tersedia?",
    a: "Kami menerima transfer bank, e-wallet, dan kartu kredit/debit. Seluruh tagihan dapat dipantau di menu Pembayaran.",
  },
  {
    q: "Apakah data hewan dan rekam medis saya aman?",
    a: "Sangat aman. Seluruh data dienkripsi dan hanya dapat diakses oleh Anda serta dokter yang menangani peliharaan Anda.",
  },
];

const FAQSection = () => {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section faq">
      <div className="guest-container">
        <div className="section-head">
          <h2>Pertanyaan yang Sering Diajukan</h2>
          <p>
            Temukan jawaban atas pertanyaan umum seputar layanan VetCare.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((f, i) => (
            <div key={i} className={`faq-item ${open === i ? "open" : ""}`}>
              <button
                className="faq-q"
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                {f.q}
                <FaChevronDown />
              </button>
              <div className="faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
