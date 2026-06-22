import React from "react";

const photos = [
  { src: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80", cls: "wide", alt: "Ruang klinik hewan" },
  { src: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=600&q=80", cls: "tall", alt: "Kucing peliharaan" },
  { src: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=600&q=80", cls: "", alt: "Kelinci peliharaan" },
  { src: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80", cls: "", alt: "Burung peliharaan" },
  { src: "https://images.unsplash.com/photo-1559190394-df5a28aab5c5?auto=format&fit=crop&w=600&q=80", cls: "wide", alt: "Fasilitas klinik" },
  { src: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=600&q=80", cls: "", alt: "Hamster peliharaan" },
];

const GallerySection = () => {
  return (
    <section className="section gallery">
      <div className="guest-container">
        <div className="section-head">
          <h2>Galeri Klinik</h2>
          <p>
            Lihat suasana klinik, proses pemeriksaan, dan fasilitas lengkap yang
            kami sediakan untuk kenyamanan peliharaan Anda.
          </p>
        </div>

        <div className="gallery-grid">
          {photos.map((p, i) => (
            <div key={i} className={`gallery-item ${p.cls}`}>
              <img src={p.src} alt={p.alt} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
