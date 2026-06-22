import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaPaw, FaBars, FaTimes } from "react-icons/fa";

const GuestNavbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Beranda", to: "#home" },
    { label: "Fitur", to: "#fitur" },
    { label: "Tentang Kami", to: "#tentang" },
    { label: "FAQ", to: "#faq" },
  ];

  return (
    <nav className="guest-navbar">
      <div className="guest-container nav-inner">
        <a href="#home" className="nav-logo">
          <FaPaw className="nav-logo-icon" />
          <span>VetCare</span>
        </a>

        <ul className={`nav-links ${open ? "open" : ""}`}>
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.to} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <Link to="/login" className="btn btn-primary btn-sm">
            Login
          </Link>
        </div>

        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default GuestNavbar;
