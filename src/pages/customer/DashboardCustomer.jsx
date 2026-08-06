// src/pages/customer/DashboardCustomer.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaBell, FaPaw, FaCalendarAlt, FaClipboardList, FaCreditCard, FaSyringe,
  FaPlusCircle, FaChevronRight, FaCalendarCheck, FaRegClock, FaStar,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { useCustomerData } from "../../context/CustomerDataContext";
import NpsSurvey from "../../components/customer/NpsSurvey";
import {
  dummyPayments, dummyVaccineReminders,
} from "../../data/dummyCustomer";
import { getLoyalty, LOYALTY_TIERS, runMemberTriggers, getInvoicesByOwner } from "../../lib/services";
import { supabase } from "../../lib/supabase";
import "./customer.css";

// Komponen avatar inisial — ditampilkan ketika belum ada foto profil
const InitialAvatar = ({ name, size = 72 }) => {
  const initials = (name || "U")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg, #14b8a6, #0ea5e9)",
        color: "#fff", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: size * 0.38,
        fontWeight: 700, flexShrink: 0, userSelect: "none",
        border: "3px solid rgba(255,255,255,0.25)",
        boxShadow: "0 0 15px rgba(22,199,132,0.2)",
      }}
    >
      {initials}
    </div>
  );
};

const fullDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const daysUntil = (iso) =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));

const HEALTH = {
  healthy:  { label: "Sehat",            cls: "ok" },
  recovery: { label: "Kontrol Lanjutan", cls: "warn" },
  sick:     { label: "Perlu Perhatian",  cls: "bad" },
};

const QUICK = [
  { label: "Tambah Hewan",        icon: <FaPlusCircle />,   to: "/customer/daftar-hewan", cls: "qa-green" },
  { label: "Booking Pemeriksaan", icon: <FaCalendarAlt />,  to: "/customer/jadwal",       cls: "qa-sky" },
  { label: "Rekam Medis",         icon: <FaClipboardList />, to: "/customer/rekam-medis", cls: "qa-violet" },
  { label: "Pembayaran",          icon: <FaCreditCard />,   to: "/customer/pembayaran",   cls: "qa-amber" },
  { label: "Ulasan Dokter",       icon: <FaStar />,         to: "/customer/ulasan-dokter", cls: "qa-brand" },
];

export default function DashboardCustomer() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { pets, appointments } = useCustomerData();

  const firstName = (profile?.full_name || "Dika").split(" ")[0];

  // Sapaan ramah waktu
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 11) return "Selamat Pagi";
    if (hr < 15) return "Selamat Siang";
    if (hr < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Loyalty nyata dari Supabase.
  const [loyalty, setLoyalty] = useState({ total: 0, tier: LOYALTY_TIERS[0] });
  const [invoices, setInvoices] = useState([]);

  const loadUserData = () => {
    if (!user?.id) return;
    getLoyalty(user.id)
      .then(setLoyalty)
      .catch((e) => console.error("Gagal memuat loyalty:", e.message));
    
    getInvoicesByOwner(user.id)
      .then(setInvoices)
      .catch((e) => console.error("Gagal memuat invoice:", e.message));
  };

  useEffect(() => {
    if (!user?.id) return;
    loadUserData();

    // Jalankan trigger CRM otomatis (PRD 10.4): reminder kontrol & win-back.
    runMemberTriggers(user.id);

    const channel = supabase
      .channel(`cust-dash-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices", filter: `member_id=eq.${user.id}` }, () => loadUserData())
      .on("postgres_changes", { event: "*", schema: "public", table: "loyalty_points", filter: `member_id=eq.${user.id}` }, () => loadUserData())
      .subscribe();

    const handleFocus = () => loadUserData();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const tierMedal = { silver: "🥈", gold: "🥇", platinum: "💎" };
  const tier = {
    label: `${loyalty.tier.label} Member`,
    medal: tierMedal[loyalty.tier.key] ?? "🐾",
  };

  const upcoming = appointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  // Tentukan pengingat vaksin secara dinamis dari hewan yang belum/parsial vaksin
  const needsVaccine = pets.find((p) => p.vaccineStatus !== "lengkap");
  let vaccine = null;
  if (needsVaccine) {
    const estDueDate = new Date();
    estDueDate.setDate(estDueDate.getDate() + 14); // countdown 14 hari

    vaccine = {
      petName: needsVaccine.name,
      status: needsVaccine.vaccineStatus === "belum" ? "Belum Vaksin" : "Vaksin Parsial",
      vaccine: needsVaccine.species === "Kucing" ? "Vaksin Tricat (Tahunan)" : needsVaccine.species === "Anjing" ? "Vaksin DHPPi (Tahunan)" : "Vaksinasi Rutin",
      dueDate: estDueDate.toISOString(),
    };
  }

  const pendingBills = invoices.filter((i) => i.status === "PENDING").length;

  const stats = [
    { icon: <FaPaw />,         label: "Hewan Terdaftar",  value: pets.length, cls: "st-green" },
    { icon: <FaCalendarAlt />, label: "Jadwal Aktif",     value: upcoming.length, cls: "st-sky" },
    { icon: <FaSyringe />,     label: "Perlu Vaksin",     value: pets.filter((p) => p.vaccineStatus !== "lengkap").length, cls: "st-rose" },
    { icon: <FaCreditCard />,  label: "Tagihan",          value: pendingBills, cls: "st-amber" },
  ];

  return (
    <div className="dx">
      {/* 1 : Welcome */}
      <section className="dx-welcome">
        {profile?.avatar_url ? (
          <img
            className="dx-welcome-ava"
            src={profile.avatar_url}
            alt="Foto profil"
            style={{ border: "3px solid rgba(255,255,255,0.25)", boxShadow: "0 0 15px rgba(22,199,132,0.2)" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <InitialAvatar name={profile?.full_name} size={72} />
        )}
        <div className="dx-welcome-body">
          <h1 className="dx-welcome-hi">{getGreeting()}, {firstName} <span>👋</span></h1>
          <p className="dx-welcome-sub">Kesehatan hewan peliharaan Anda adalah prioritas utama kami.</p>
          {vaccine && (
            <div className="dx-welcome-notif">
              <FaBell />
              <span>
                {vaccine.petName} belum memiliki vaksinasi lengkap (Status: <b>{vaccine.status}</b>).
              </span>
            </div>
          )}
        </div>
        <button className="dx-tier-chip" onClick={() => navigate("/customer/membership")}>
          <span className="dx-tier-medal">{tier.medal}</span>
          <span>
            <b>{tier.label}</b>
            <em>{loyalty.total.toLocaleString("id-ID")} poin</em>
          </span>
        </button>
      </section>

      {/* 2 : Quick Actions (Compact SaaS Style) */}
      <section className="dx-quick" style={{ marginTop: 6, marginBottom: 6 }}>
        {QUICK.map((q) => (
          <button key={q.label} className="dx-quick-btn" onClick={() => navigate(q.to)}>
            <span className={`dx-quick-ic ${q.cls}`}>{q.icon}</span>
            <span className="dx-quick-label">{q.label}</span>
          </button>
        ))}
      </section>

      {/* NPS Survey (PRD 10.5) */}
      <NpsSurvey email={profile?.email} />

      {/* 4 : Ringkasan Akun */}
      <section className="dx-stats">
        {stats.map((s) => {
          // Format dua digit (mis. 01, 02)
          const formattedVal = typeof s.value === "number" ? String(s.value).padStart(2, "0") : s.value;
          return (
            <div key={s.label} className="dx-stat">
              <span className={`dx-stat-ic ${s.cls}`}>{s.icon}</span>
              <div>
                <div className="dx-stat-val">{formattedVal}</div>
                <div className="dx-stat-label">{s.label}</div>
                <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 600, marginTop: 2 }}>Aktif • Baru</div>
              </div>
            </div>
          );
        })}
      </section>

      <div className="dx-grid">
        {/* Kolom utama */}
        <div className="dx-col">
          {/* 5 : Hewan Peliharaan */}
          <section className="dx-card">
            <Header icon={<FaPaw />} title="Hewan Peliharaan Saya"
              actionText="Kelola" onAction={() => navigate("/customer/daftar-hewan")} />
            {pets.length === 0 ? (
              <p className="dh-empty">Belum ada hewan. Tambahkan di menu Hewan.</p>
            ) : (
              <div className="dx-pets">
                {pets.slice(0, 3).map((p) => {
                  const h = HEALTH[p.healthStatus] ?? HEALTH.healthy;
                  const healthPct = h.label === "Sehat" ? "95%" : h.label === "Kontrol Lanjutan" ? "70%" : "40%";
                  const healthColor = h.label === "Sehat" ? "#10b981" : h.label === "Kontrol Lanjutan" ? "#f59e0b" : "#ef4444";
                  
                  return (
                    <div key={p.id} className="dx-pet">
                      <PetThumb pet={p} />
                      {/* Status melayang absolute diatur lewat CSS */}
                      <span className={`dx-pet-status ${h.cls}`}>{h.label}</span>
                      
                      <div className="dx-pet-body">
                        <div className="dx-pet-name">{p.name}</div>
                        <div className="dx-pet-breed">{p.species} • {p.breed}</div>
                        
                        <div className="dx-pet-meta">
                          <span><b>Usia:</b> {p.ageText}</span>
                          <span><b>Kelamin:</b> {p.gender || "Jantan"}</span>
                          <span><b>Pemilik:</b> {firstName} (Anda)</span>
                        </div>

                        {/* Health Progress Bar */}
                        <div className="health-progress-bar" style={{ marginTop: 10, marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>
                            <span>Kondisi Fisik</span>
                            <span style={{ color: healthColor }}>{healthPct}</span>
                          </div>
                          <div className="loyalty-progress-track" style={{ height: 6, margin: 0 }}>
                            <div className="loyalty-progress-fill" style={{ width: healthPct, background: healthColor }} />
                          </div>
                        </div>

                        <button className="dx-pet-btn"
                          onClick={() => navigate(`/customer/hewan/${p.id}`)}>
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 6 : Jadwal Pemeriksaan */}
          <section className="dx-card">
            <Header icon={<FaCalendarAlt />} title="Jadwal Pemeriksaan"
              actionText="Booking" onAction={() => navigate("/customer/jadwal")} />
            {upcoming.length === 0 ? (
              <p className="dh-empty">Tidak ada jadwal mendatang.</p>
            ) : (
              <div className="dx-list">
                {upcoming.slice(0, 3).map((a) => (
                  <div key={a.id} className="dx-appt">
                    <div className="dx-appt-date">
                      <span className="d">{new Date(a.dateTime).getDate()}</span>
                      <span className="m">{new Date(a.dateTime).toLocaleDateString("id-ID", { month: "short" })}</span>
                    </div>
                    <div className="dx-appt-info">
                      <div className="dx-appt-title">{a.reason}</div>
                      <div className="dx-appt-sub">{a.doctorName} • {a.petName}</div>
                    </div>
                    <span className="dx-badge sky">Terjadwal</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Rail kanan */}
        <div className="dx-col">
          {/* 7 : Reminder Vaksin */}
          {vaccine && (
            <section className="dx-vaccine">
              <div className="dx-vaccine-head"><FaSyringe /> Reminder Vaksin</div>
              <div className="dx-vaccine-name">{vaccine.vaccine}</div>
              <div className="dx-vaccine-pet">{vaccine.petName}</div>
              <div className="dx-vaccine-row">
                <span className="dx-vaccine-date"><FaRegClock /> {fullDate(vaccine.dueDate)}</span>
                <span className="dx-vaccine-left">{daysUntil(vaccine.dueDate)} Hari Lagi</span>
              </div>
              <button 
                type="button" 
                className="dx-pet-btn" 
                style={{ marginTop: 4, width: "100%", background: "#fff", color: "#e11d48", borderColor: "#fecdd3" }}
                onClick={() => navigate("/customer/daftar-hewan")}
              >
                Lihat Detail Hewan
              </button>
            </section>
          )}

          {/* Ringkas jadwal terdekat */}
          <section className="dx-card">
            <Header icon={<FaCalendarCheck />} title="Janji Terdekat" />
            {upcoming.length === 0 ? (
              <p className="dh-empty">Belum ada janji.</p>
            ) : (
              <div className="dx-next">
                <div className="dx-next-day">{fullDate(upcoming[0].dateTime)}</div>
                <div className="dx-next-sub">
                  {upcoming[0].petName} • {upcoming[0].reason}
                </div>
                <div className="dx-next-doc">{upcoming[0].doctorName}</div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 8 : Premium SaaS Footer */}
      <footer className="cust-shell-footer">
        <div>© {new Date().getFullYear()} VetCare CRM. Version 1.0.0</div>
        <div className="cust-shell-footer-links">
          <a href="#support" onClick={(e) => { e.preventDefault(); alert("Customer Support Hub: support@vetcare.com"); }}>Support</a>
          <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Kebijakan Privasi VetCare"); }}>Privacy Policy</a>
          <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Syarat & Ketentuan Layanan"); }}>Terms</a>
        </div>
        <div>Made with <span style={{ color: "#ef4444" }}>❤</span> for Pets</div>
      </footer>
    </div>
  );
}

function PetThumb({ pet }) {
  if (pet.photo) {
    return (
      <img className="dx-pet-photo" src={pet.photo} alt={pet.name}
        onError={(e) => { e.currentTarget.style.display = "none"; }} />
    );
  }
  return <div className="dx-pet-photo ph">🐾</div>;
}

function Header({ icon, title, actionText, onAction }) {
  return (
    <div className="dx-head">
      <span className="dx-head-title">{icon} {title}</span>
      {actionText && (
        <button className="dx-head-link" onClick={onAction}>
          {actionText} <FaChevronRight />
        </button>
      )}
    </div>
  );
}
