// src/pages/customer/PetDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaCalendarPlus, FaTrash, FaCalendarCheck,
  FaSyringe, FaHeartbeat, FaWeight, FaBirthdayCake, FaNotesMedical,
} from "react-icons/fa";

import { Card, Button, EmptyState } from "../../components/ui";
import PetPhoto from "../../components/customer/PetPhoto";
import { useCustomerData } from "../../context/CustomerDataContext";
import "./customer.css";

const HEALTH = {
  healthy:  { label: "Sehat",            cls: "ok" },
  recovery: { label: "Kontrol Lanjutan", cls: "warn" },
  sick:     { label: "Perlu Perhatian",  cls: "bad" },
};
const VAC = {
  lengkap: { label: "Vaksin Lengkap", cls: "ok" },
  parsial: { label: "Vaksin Parsial", cls: "warn" },
  belum:   { label: "Belum Vaksin",   cls: "bad" },
};

const fmt = (iso) =>
  new Date(iso).toLocaleString("id-ID", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPet, removePet, appointments } = useCustomerData();

  const pet = getPet(id);

  if (!pet) {
    return (
      <div>
        <button className="pd-back" onClick={() => navigate("/customer/daftar-hewan")}>
          <FaArrowLeft /> Kembali
        </button>
        <Card>
          <EmptyState title="Hewan tidak ditemukan"
            description="Data mungkin sudah dihapus." />
        </Card>
      </div>
    );
  }

  const h = HEALTH[pet.healthStatus] ?? HEALTH.healthy;
  const v = VAC[pet.vaccineStatus] ?? VAC.belum;
  const petAppts = appointments
    .filter((a) => a.petId === pet.id && a.status !== "cancelled")
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const handleDelete = () => {
    if (window.confirm(`Hapus data "${pet.name}"? Tindakan ini permanen.`)) {
      removePet(pet.id);
      navigate("/customer/daftar-hewan");
    }
  };

  return (
    <div>
      <button className="pd-back" onClick={() => navigate("/customer/daftar-hewan")}>
        <FaArrowLeft /> Kembali ke daftar hewan
      </button>

      {/* Hero */}
      <div className="pd-hero">
        <PetPhoto photo={pet.photo} name={pet.name} className="pd-photo" />
        <div className="pd-hero-body">
          <h1 className="pd-name">{pet.name}</h1>
          <p className="pd-breed">{pet.species} • {pet.breed}</p>
          <div className="pd-badges">
            <span className={`dh-tag ${h.cls}`}>{h.label}</span>
            <span className={`dh-tag ${v.cls}`}>{v.label}</span>
          </div>
          <div className="pd-actions">
            <Button variant="primary" leftIcon={<FaCalendarPlus />}
              onClick={() => navigate("/customer/jadwal")}>
              Booking Pemeriksaan
            </Button>
            <Button variant="danger" leftIcon={<FaTrash />} onClick={handleDelete}>
              Hapus
            </Button>
          </div>
        </div>
      </div>

      {/* Info ringkas */}
      <div className="pd-stats">
        <Info icon={<FaBirthdayCake />} label="Usia" value={pet.ageText} />
        <Info icon={<FaWeight />} label="Berat" value={pet.weightKg ? `${pet.weightKg} kg` : "-"} />
        <Info icon={<FaHeartbeat />} label="Kesehatan" value={h.label} />
        <Info icon={<FaSyringe />} label="Vaksin" value={v.label} />
      </div>

      <div className="pd-grid">
        {/* Catatan / keluhan */}
        <Card title="Catatan Kesehatan">
          {pet.complaint ? (
            <p className="pd-note">{pet.complaint}</p>
          ) : (
            <p className="pd-note muted">Belum ada catatan khusus untuk {pet.name}.</p>
          )}
        </Card>

        {/* Jadwal terkait */}
        <Card
          title="Jadwal Pemeriksaan"
          subtitle={`${petAppts.length} jadwal aktif`}
          action={
            <Button size="sm" variant="ghost" leftIcon={<FaCalendarPlus />}
              onClick={() => navigate("/customer/jadwal")}>
              Booking
            </Button>
          }
        >
          {petAppts.length === 0 ? (
            <EmptyState icon={<FaCalendarCheck />} title="Belum ada jadwal"
              description={`Booking pemeriksaan untuk ${pet.name}.`} />
          ) : (
            <div className="pd-appts">
              {petAppts.map((a) => (
                <div key={a.id} className="pd-appt">
                  <span className="pd-appt-ic"><FaNotesMedical /></span>
                  <div>
                    <div className="pd-appt-title">{a.reason}</div>
                    <div className="pd-appt-sub">{a.doctorName} • {fmt(a.dateTime)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="pd-info">
      <span className="pd-info-ic">{icon}</span>
      <div>
        <div className="pd-info-val">{value}</div>
        <div className="pd-info-label">{label}</div>
      </div>
    </div>
  );
}
