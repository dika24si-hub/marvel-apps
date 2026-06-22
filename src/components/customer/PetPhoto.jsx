// src/components/customer/PetPhoto.jsx
// Foto hewan dengan fallback emoji 🐾 bila URL kosong / gagal dimuat.
import { useState } from "react";

export default function PetPhoto({ photo, name = "", className = "" }) {
  const [broken, setBroken] = useState(false);

  if (!photo || broken) {
    return <div className={`${className} ph`} aria-label={name}>🐾</div>;
  }
  return (
    <img
      className={className}
      src={photo}
      alt={name}
      onError={() => setBroken(true)}
    />
  );
}
