import React from "react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="cta">
      <div className="guest-container">
        <div className="cta-inner">
          <h2>
            Siap memberikan perawatan terbaik untuk{" "}
            <span className="text-accent">peliharaan Anda?</span>
          </h2>
          <p>
            Bergabunglah dengan ribuan pemilik hewan yang telah mempercayakan
            kesehatan peliharaannya kepada VetCare. Daftar gratis hari ini!
          </p>
          <div className="hero-buttons" style={{ justifyContent: "center" }}>
            <Link to="/register" className="btn btn-primary">
              Daftar Sekarang
            </Link>
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
