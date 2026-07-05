// src/pages/customer/PetDetail.jsx
// Tampilan detail hewan bergaya "collar": kartu profil kiri + panel tab kanan.
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaTimes, FaCalendarPlus, FaTrash, FaSyringe, FaNotesMedical,
  FaShieldAlt, FaUtensils, FaPaw, FaArrowLeft, FaCheckCircle,
} from "react-icons/fa";

import PetPhoto from "../../components/customer/PetPhoto";
import { useCustomerData } from "../../context/CustomerDataContext";
import { useAuth } from "../../context/AuthContext";
import { dummyMembership } from "../../data/dummyCustomer";
import { getMedicalRecordsByAnimal } from "../../lib/services";
import "./pet-detail.css";

const HEALTH = {
  healthy: { label: "Sehat", cls: "ok" },
  recovery: { label: "Kontrol Lanjutan", cls: "warn" },
  sick: { label: "Perlu Perhatian", cls: "bad" },
};
const VAC = {
  lengkap: { label: "Vaksin Lengkap", cls: "ok" },
  parsial: { label: "Vaksin Parsial", cls: "warn" },
  belum: { label: "Belum Vaksin", cls: "bad" },
};

const TABS = [
  { key: "summary", label: "Ringkasan" },
  { key: "medical", label: "Medis" },
  { key: "grooming", label: "Grooming" },
  { key: "diet", label: "Diet" },
];

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPet, removePet, appointments } = useCustomerData();
  const { profile } = useAuth();

  const [tab, setTab] = useState("summary");
  const [records, setRecords] = useState([]);

  const pet = getPet(id);

  // Ambil rekam medis nyata dari Supabase untuk hewan ini.
  useEffect(() => {
    let alive = true;
    if (id) {
      getMedicalRecordsByAnimal(id)
        .then((data) => { if (alive) setRecords(data); })
        .catch((err) => console.error("Gagal memuat rekam medis:", err.message));
    }
    return () => { alive = false; };
  }, [id]);

  if (!pet) {
    return (
      <div className="pdx-missing">
        <button className="pdx-back" onClick={() => navigate("/customer/daftar-hewan")}>
          <FaArrowLeft /> Kembali
        </button>
        <p>Hewan tidak ditemukan. Data mungkin sudah dihapus.</p>
      </div>
    );
  }

  const h = HEALTH[pet.healthStatus] ?? HEALTH.healthy;
  const v = VAC[pet.vaccineStatus] ?? VAC.belum;

  const petAppts = appointments
    .filter((a) => a.petId === pet.id && a.status !== "cancelled")
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const petRecords = records;
  const ownerName = profile?.full_name || "Pemilik";

  const handleDelete = () => {
    if (window.confirm(`Hapus data "${pet.name}"? Tindakan ini permanen.`)) {
      removePet(pet.id);
      navigate("/customer/daftar-hewan");
    }
  };

  // Jumlah catatan medis untuk badge tab
  const medicalCount = petRecords.length;

  return (
    <div className="pdx">
      {/* ============ KARTU PROFIL (KIRI) ============ */}
      <aside className="pdx-card">
        <div className="pdx-photo-wrap">
          <PetPhoto photo={pet.photo} name={pet.name} className="pdx-photo" />
          <button
            className="pdx-close"
            onClick={() => navigate("/customer/daftar-hewan")}
            aria-label="Tutup"
          >
            <FaTimes />
          </button>
          <div className="pdx-photo-overlay">
            <h1>{pet.name}</h1>
            <span>{pet.ageText}</span>
          </div>
        </div>

        <div className="pdx-tags">
          {pet.healthStatus === "sick" && <span className="pdx-tag warn">Perlu Perhatian</span>}
          <span className={`pdx-tag ${h.cls === "ok" ? "ok" : "warn"}`}>{h.label}</span>
          <span className={`pdx-tag ${v.cls === "ok" ? "ok" : "warn"}`}>{v.label}</span>
        </div>

        <ul className="pdx-info">
          <li><span>Jenis</span><b>{pet.species}</b></li>
          <li><span>Ras</span><b>{pet.breed}</b></li>
          <li><span>Jenis Kelamin</span><b>{pet.gender || "-"}</b></li>
          <li><span>Warna</span><b>{pet.color || "Coklat"}</b></li>
          <li><span>Berat</span><b>{pet.weightKg ? `${pet.weightKg} kg` : "-"}</b></li>
          <li><span>Microchip</span><b>{pet.microchip || "394940002828"}</b></li>
          <li><span>Dokter Utama</span><b>{pet.mainVet || "drh. Sari"}</b></li>
        </ul>

        <div className="pdx-owner">
          <span className="pdx-owner-label">Pemilik</span>
          <div className="pdx-owner-row">
            <span className="pdx-owner-ava">{ownerName.charAt(0).toUpperCase()}</span>
            <b>{ownerName}</b>
          </div>
        </div>

        <div className="pdx-card-actions">
          <button className="pdx-btn primary" onClick={() => navigate("/customer/jadwal")}>
            <FaCalendarPlus /> Booking
          </button>
          <button className="pdx-btn danger" onClick={handleDelete}>
            <FaTrash /> Hapus
          </button>
        </div>
      </aside>

      {/* ============ PANEL KONTEN (KANAN) ============ */}
      <section className="pdx-main">
        {/* Tabs */}
        <nav className="pdx-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`pdx-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key === "medical" && medicalCount > 0 && (
                <span className="pdx-tab-badge">{medicalCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* ---- TAB: SUMMARY ---- */}
        {tab === "summary" && (
          <div className="pdx-panels">
            {/* Membership */}
            <div className="pdx-block">
              <h3>Keanggotaan Aktif</h3>
              <div className="pdx-row">
                <span className="pdx-row-code">HG-74558</span>
                <span className="pdx-row-main">Premium Care - Tahunan</span>
                <span className="pdx-row-right">Aktif s/d {dummyMembership.activeUntil}</span>
              </div>
            </div>

            {/* Confirmed bookings */}
            <div className="pdx-block">
              <h3>Jadwal Terkonfirmasi</h3>
              {petAppts.length === 0 ? (
                <p className="pdx-empty">Belum ada jadwal untuk {pet.name}.</p>
              ) : (
                petAppts.map((a) => (
                  <div key={a.id} className="pdx-row">
                    <span className="pdx-row-code">BK-{String(a.id).slice(-5).toUpperCase()}</span>
                    <span className="pdx-row-main">{a.reason}</span>
                    <span className="pdx-row-chip">{a.doctorName}</span>
                    <span className="pdx-row-right">{fmtDateTime(a.dateTime)}</span>
                  </div>
                ))
              )}
            </div>

            {/* Active vaccines */}
            <div className="pdx-block">
              <h3>Vaksin Aktif {pet.name}</h3>
              <div className="pdx-cards-2">
                <div className="pdx-mini">
                  <span className="pdx-mini-bar amber" />
                  <div>
                    <b>DHP — Zoetis Vanguard 7</b>
                    <small className="ok">Berlaku s/d 12/10/2026</small>
                  </div>
                </div>
                <div className="pdx-mini">
                  <span className="pdx-mini-bar teal" />
                  <div>
                    <b>Rabies — Zoetis Defensor</b>
                    <small className="ok">Berlaku s/d 12/10/2026 <em className="pdx-upd">Updated</em></small>
                  </div>
                </div>
              </div>
            </div>

            {/* Active treatments */}
            <div className="pdx-block">
              <h3>Perawatan Aktif {pet.name}</h3>
              <div className="pdx-cards-2">
                <div className="pdx-mini bordered">
                  <div>
                    <b>Anti Parasit — NG Spectra</b>
                    <small className="ok">Berlaku s/d 10/12/2026</small>
                  </div>
                </div>
                <div className="pdx-mini bordered">
                  <div>
                    <b>Obat Cacing — Milbemax</b>
                    <small className="ok">Berlaku s/d 10/12/2026 <em className="pdx-upd">Updated</em></small>
                  </div>
                </div>
              </div>
            </div>

            {/* Diet schedule */}
            <div className="pdx-block">
              <h3><FaUtensils style={{ marginRight: 6 }} /> Jadwal Makan & Diet</h3>
              <div className="pdx-diet">
                <div className="pdx-diet-type">
                  <span>Diet</span>
                  <b>Fresh Food</b>
                </div>
                <div className="pdx-diet-meal">
                  <span>Pagi — 08:00</span>
                  <b>Butterbox, Beef - 400g</b>
                </div>
                <div className="pdx-diet-meal">
                  <span>Sore — 18:00</span>
                  <b>Butterbox, Beef - 400g</b>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---- TAB: MEDICAL ---- */}
        {tab === "medical" && (
          <div className="pdx-panels">
            <div className="pdx-block">
              <h3><FaNotesMedical style={{ marginRight: 6 }} /> Riwayat Rekam Medis</h3>
              {petRecords.length === 0 ? (
                <p className="pdx-empty">Belum ada rekam medis untuk {pet.name}.</p>
              ) : (
                <ul className="pdx-timeline">
                  {petRecords.map((r) => (
                    <li key={r.id}>
                      <span className="pdx-tl-dot"><FaNotesMedical /></span>
                      <div className="pdx-tl-body">
                        <div className="pdx-tl-head">
                          <b>{r.diagnosis || "Pemeriksaan"}</b>
                          <small>{fmtDate(r.created_at)}</small>
                        </div>
                        {r.physical_exam_notes && (
                          <p className="pdx-tl-note"><b>Pemeriksaan:</b> {r.physical_exam_notes}</p>
                        )}
                        {r.actions_taken && (
                          <p className="pdx-tl-note"><b>Tindakan:</b> {r.actions_taken}</p>
                        )}
                        {r.prescriptions?.length > 0 && (
                          <p className="pdx-tl-note">
                            <b>Resep:</b>{" "}
                            {r.prescriptions.map((rx) =>
                              `${rx.drug_name}${rx.dosage ? ` ${rx.dosage}` : ""}`
                            ).join(", ")}
                          </p>
                        )}
                        {(r.weight_at_visit || r.temperature) && (
                          <p className="pdx-tl-note">
                            {r.weight_at_visit ? <span><b>Berat:</b> {r.weight_at_visit} kg  </span> : null}
                            {r.temperature ? <span><b>Suhu:</b> {r.temperature}°C</span> : null}
                          </p>
                        )}
                        {r.follow_up_date && (
                          <span className="pdx-tl-doc">Kontrol berikutnya: {fmtDate(r.follow_up_date)}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pdx-block">
              <h3><FaShieldAlt style={{ marginRight: 6 }} /> Status Vaksinasi</h3>
              <div className="pdx-vac-status">
                <span className={`pdx-tag ${v.cls === "ok" ? "ok" : "warn"}`}>{v.label}</span>
                <p className="pdx-empty" style={{ marginTop: 8 }}>
                  Vaksin berikutnya dijadwalkan otomatis & Anda akan diingatkan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ---- TAB: GROOMING ---- */}
        {tab === "grooming" && (
          <div className="pdx-panels">
            <div className="pdx-block">
              <h3><FaPaw style={{ marginRight: 6 }} /> Riwayat Grooming</h3>
              <ul className="pdx-timeline">
                <li>
                  <span className="pdx-tl-dot teal"><FaPaw /></span>
                  <div className="pdx-tl-body">
                    <div className="pdx-tl-head">
                      <b>Full Bath & Groom</b>
                      <small>{fmtDate(new Date().toISOString())}</small>
                    </div>
                    <p className="pdx-tl-note">Mandi, potong kuku, dan perawatan bulu lengkap.</p>
                    <span className="pdx-tl-doc">Groomer: Hannah</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ---- TAB: DIET ---- */}
        {tab === "diet" && (
          <div className="pdx-panels">
            <div className="pdx-block">
              <h3><FaUtensils style={{ marginRight: 6 }} /> Rencana Diet</h3>
              <div className="pdx-diet">
                <div className="pdx-diet-type">
                  <span>Tipe Diet</span>
                  <b>Fresh Food</b>
                </div>
                <div className="pdx-diet-meal">
                  <span>Sarapan — 08:00</span>
                  <b>Butterbox, Beef - 400g</b>
                </div>
                <div className="pdx-diet-meal">
                  <span>Makan Malam — 18:00</span>
                  <b>Butterbox, Beef - 400g</b>
                </div>
              </div>
              <ul className="pdx-diet-notes">
                <li><FaCheckCircle /> Hindari makanan mengandung ayam (alergi)</li>
                <li><FaCheckCircle /> Sediakan air bersih setiap saat</li>
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
