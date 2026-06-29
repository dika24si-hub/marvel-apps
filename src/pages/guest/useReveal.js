import { useEffect } from "react";

/**
 * useReveal — menambahkan class `.in` ke setiap elemen `.vc-reveal`
 * saat masuk viewport (animasi reveal-on-scroll tanpa library).
 */
export default function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".vc-reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}
