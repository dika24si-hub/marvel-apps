// src/pages/customer/DashboardCustomer.jsx
import { useNavigate } from "react-router-dom";
import {
  FaBell, FaPaw, FaCalendarAlt, FaClipboardList, FaCreditCard, FaSyringe,
  FaPlusCircle, FaChevronRight, FaCalendarCheck, FaRegClock,
} from "react-icons/fa";

import fotoDika from "../../assets/dika.jpg";
import { useAuth } from "../../context/AuthContext";
import { useCustomerData } from "../../context/CustomerDataContext";
import {
  dummyPayments, dummyMemberStats, dummyMembership, dummyVaccineReminders,
} from "../../data/dummyCustomer";
import { evaluateMembership } from "../../data/membership";
import "./customer.css";

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
];

export default function DashboardCustomer() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { pets, appointments } = useCustomerData();

  const firstName = (profile?.full_name || "Dika").split(" ")[0];
  const { current } = evaluateMembership(dummyMemberStats);
  const tier = current ?? { label: "Member", medal: "🐾" };

  const upcoming = appointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  const vaccine = dummyVaccineReminders[0];
  const pendingBills = dummyPayments.filter((p) => p.status === "pending").length;

  const stats = [
    { icon: <FaPaw />,         label: "Hewan Terdaftar",  value: pets.length, cls: "st-green" },
    { icon: <FaCalendarAlt />, label: "Jadwal Aktif",     value: upcoming.length, cls: "st-sky" },
    { icon: <FaSyringe />,     label: "Vaksin Mendatang",  value: dummyVaccineReminders.length, cls: "st-rose" },
    { icon: <FaCreditCard />,  label: "Tagihan",          value: pendingBills, cls: "st-amber" },
  ];

  return (
    <div className="dx">
      {/* 1 : Welcome */}
      <section className="dx-welcome">
        <img className="dx-welcome-ava" src={fotoDika} alt="Foto profil" />
        <div className="dx-welcome-body">
          <h1 className="dx-welcome-hi">Halo, {firstName} <span>👋</span></h1>
          <p className="dx-welcome-sub">Selamat datang kembali</p>
          {vaccine && (
            <div className="dx-welcome-notif">
              <FaBell />
              <span>
                {vaccine.petName} memiliki jadwal vaksin pada{" "}
                <b>{fullDate(vaccine.dueDate)}</b>.
              </span>
            </div>
          )}
        </div>
        <button className="dx-tier-chip" onClick={() => navigate("/customer/membership")}>
          <span className="dx-tier-medal">{tier.medal}</span>
          <span>
            <b>{tier.label}</b>
            <em>{dummyMembership.points.toLocaleString("id-ID")} poin</em>
          </span>
        </button>
      </section>

      {/* 3 : Quick Actions */}
      <section className="dx-quick dx-quick-4">
        {QUICK.map((q) => (
          <button key={q.label} className="dx-quick-btn" onClick={() => navigate(q.to)}>
            <span className={`dx-quick-ic ${q.cls}`}>{q.icon}</span>
            <span className="dx-quick-label">{q.label}</span>
          </button>
        ))}
      </section>

      {/* 4 : Ringkasan Akun */}
      <section className="dx-stats">
        {stats.map((s) => (
          <div key={s.label} className="dx-stat">
            <span className={`dx-stat-ic ${s.cls}`}>{s.icon}</span>
            <div>
              <div className="dx-stat-val">{s.value}</div>
              <div className="dx-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
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
                  return (
                    <div key={p.id} className="dx-pet">
                      <PetThumb pet={p} />
                      <div className="dx-pet-body">
                        <div className="dx-pet-name">{p.name}</div>
                        <div className="dx-pet-breed">{p.breed}</div>
                        <div className="dx-pet-meta">
                          <span>Usia: {p.ageText}</span>
                          <span className={`dx-pet-status ${h.cls}`}>{h.label}</span>
                        </div>
                        <button className="dx-pet-btn"
                          onClick={() => navigate(`/customer/hewan/${p.id}`)}>
                          Detail
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
