// src/pages/Pengaturan.jsx
// =====================================================================
// PENGATURAN SISTEM — ADMIN (PRD 9.9)
//   - Profil klinik: nama, alamat, telepon, jam buka, logo
//   - Pengaturan loyalty (info), preferensi sistem
// Disimpan di localStorage (konfigurasi klinik tunggal).
// =====================================================================
import { useEffect, useState } from "react";
import {
  FaClinicMedical, FaCheckCircle, FaCog, FaPaw, FaHistory,
} from "react-icons/fa";
import { PageHeader, Card, Button, Input } from "../components/ui";
import { POINTS_PER_VISIT, LOYALTY_TIERS, getAuditLogs } from "../lib/services";
import "./doctor/doctor.css";

const SETTINGS_KEY = "vetcare_clinic_settings";
const DEFAULT = {
  name: "VetCare Animal Clinic",
  address: "Jl. Merdeka No. 10, Jakarta 10110",
  phone: "+62 21 1234 5678",
  email: "hello@vetcare.id",
  openHours: "Senin–Sabtu, 08.00–20.00 WIB",
  logoUrl: "",
};

export default function Pengaturan() {
  const [form, setForm] = useState(DEFAULT);
  const [tab, setTab] = useState("klinik");
  const [saved, setSaved] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setForm({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (tab === "audit") {
      getAuditLogs(50).then(setLogs).catch((e) => console.error("Audit log:", e.message));
    }
  }, [tab]);

  const save = (e) => {
    e.preventDefault();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <PageHeader title="Pengaturan Sistem" subtitle="Konfigurasi profil klinik dan preferensi aplikasi." />

      {saved && (
        <div className="prof-alert ok" style={{ marginTop: 8 }}>
          <FaCheckCircle /> Pengaturan berhasil disimpan.
        </div>
      )}

      <div className="prof-grid doc-mt">
        <Card>
          <div className="prof-side-user">
            {form.logoUrl ? (
              <img className="prof-side-ava" src={form.logoUrl} alt="Logo"
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <div className="prof-side-ava ph"><FaPaw /></div>
            )}
            <div className="prof-side-name">{form.name}</div>
            <div className="prof-side-email">{form.email}</div>
          </div>
          <nav className="prof-tabs">
            <button className={tab === "klinik" ? "active" : ""} onClick={() => setTab("klinik")}>
              <FaClinicMedical /> Profil Klinik
            </button>
            <button className={tab === "sistem" ? "active" : ""} onClick={() => setTab("sistem")}>
              <FaCog /> Preferensi Sistem
            </button>
            <button className={tab === "audit" ? "active" : ""} onClick={() => setTab("audit")}>
              <FaHistory /> Log Aktivitas
            </button>
          </nav>
        </Card>

        <div>
          {tab === "klinik" ? (
            <Card>
              <h3 className="prof-h3">Profil Klinik</h3>
              <form className="prof-form" onSubmit={save}>
                <Input label="Nama Klinik" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <Input label="Alamat" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
                <div className="prof-row2">
                  <Input label="Telepon" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <Input label="Email" type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <Input label="Jam Buka" value={form.openHours}
                  onChange={(e) => setForm({ ...form, openHours: e.target.value })} />
                <Input label="URL Logo" type="url" placeholder="https://..." value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
                <Button type="submit" variant="primary">Simpan Pengaturan</Button>
              </form>
            </Card>
          ) : tab === "sistem" ? (
            <Card>
              <h3 className="prof-h3">Preferensi Sistem</h3>
              <div className="set-info-list">
                <div className="set-info-row">
                  <span>Poin per kunjungan selesai</span>
                  <b>{POINTS_PER_VISIT} poin</b>
                </div>
                {LOYALTY_TIERS.map((t) => (
                  <div className="set-info-row" key={t.key}>
                    <span>Tier {t.label}</span>
                    <b>≥ {t.min.toLocaleString("id-ID")} poin • diskon {t.discount}%</b>
                  </div>
                ))}
                <div className="set-info-row">
                  <span>Versi Aplikasi</span>
                  <b>VetCare v1.0.0</b>
                </div>
                <div className="set-info-row">
                  <span>Database</span>
                  <b>Supabase (PostgreSQL)</b>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 14 }}>
                Konfigurasi tier & poin diatur di kode (services.js) agar konsisten dengan logika loyalty.
              </p>
            </Card>
          ) : (
            <Card>
              <h3 className="prof-h3">Log Aktivitas</h3>
              {logs.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 13 }}>Belum ada aktivitas tercatat.</p>
              ) : (
                <div className="set-info-list">
                  {logs.map((l) => (
                    <div className="set-info-row" key={l.id}>
                      <span>
                        <b style={{ color: "#0f172a" }}>{l.actor_name}</b> — {l.action}
                        {l.table_name ? ` (${l.table_name})` : ""}
                      </span>
                      <b style={{ color: "#94a3b8", fontWeight: 500, fontSize: 12 }}>
                        {l.created_at ? new Date(l.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                      </b>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
