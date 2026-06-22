import React from "react";
import {
  FaPaw,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

const cols = [
  {
    title: "Navigasi",
    links: ["Beranda", "Fitur", "Tentang Kami", "FAQ"],
  },
  {
    title: "Layanan",
    links: ["Basic Checkup", "Vaksinasi", "Grooming", "Emergency Care"],
  },
  {
    title: "Perusahaan",
    links: ["Tim Dokter", "Galeri", "Karir", "Blog"],
  },
];

const GuestFooter = () => {
  return (
    <footer id="kontak" className="guest-footer">
      <div className="guest-container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#home" className="nav-logo">
              <FaPaw className="nav-logo-icon" />
              <span>VetCare</span>
            </a>
            <p>
              Platform manajemen klinik hewan digital untuk perawatan yang lebih
              mudah, cepat, dan terpercaya.
            </p>
            <ul className="footer-contact">
              <li><FaMapMarkerAlt /> Jl. Berdikari No. 24, Umban Sari, Kec. Rumbai, Kota Pekanbaru, Riau 28266</li>
              <li><FaEnvelope /> dika24si@mahasiswa.pcr.ac.id</li>
              <li><FaPhoneAlt /> 0812-6197-1655</li>
            </ul>
            <div className="footer-socials">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title} className="footer-col">
              <h4>{c.title}</h4>
              <ul>
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© 2026 VetCare. Semua hak dilindungi.</span>
          <div className="links">
            <a href="#">Syarat Layanan</a>
            <a href="#">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GuestFooter;
