// src/pages/customer/CustomerProfil.jsx
// =====================================================================
// PROFIL MEMBER (PRD 7.2)
// Tab: Edit Profil | Ganti Password | Preferensi Notifikasi
//   - Edit Profil: nama, no HP, foto (avatar_url) -> profiles
//   - Ganti Password: Supabase Auth updateUser
//   - Preferensi Notifikasi: email / pengingat janji / promo (localStorage)
// =====================================================================
import { useEffect, useState } from "react";
import {
  FaUser,
  FaLock,
  FaBell,
  FaCheckCircle,
  FaCamera,
} from "react-icons/fa";
import { PageHeader, Card } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import "./customer.css";

const NOTIF_KEY = "vc_notif_prefs";
const DEFAULT_NOTIF = { email: true, appointment: true, promo: false };

export default function CustomerProfil() {
  const { profile, user, updateProfile, changePassword } = useAuth();

  const [tab, setTab] = useState("profil");
  const [alert, setAlert] = useState(null);

  // ---- Edit Profil ----
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  // ---- Ganti Password ----
  const [pwd, setPwd] = useState({ next: "", confirm: "" });
  const [savingPwd, setSavingPwd] = useState(false);

  // ---- Preferensi Notifikasi ----
  const [notif, setNotif] = useState(DEFAULT_NOTIF);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIF_KEY);
      if (raw) setNotif({ ...DEFAULT_NOTIF, ...JSON.parse(raw) });
    } catch {
      // ignore
    }
  }, []);

  const flash = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateProfile({
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      avatar_url: form.avatar_url.trim() || null,
    });
    setSavingProfile(false);
    if (res.success) flash("ok", "Profil berhasil diperbarui.");
    else flash("err", res.error || "Gagal memperbarui profil.");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwd.next.length < 6) {
      flash("err", "Password baru minimal 6 karakter.");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      flash("err", "Konfirmasi password tidak cocok.");
      return;
    }
    setSavingPwd(true);
    const res = await changePassword(pwd.next);
    setSavingPwd(false);
    if (res.success) {
      setPwd({ next: "", confirm: "" });
      flash("ok", "Password berhasil diganti.");
    } else {
      flash("err", res.error || "Gagal mengganti password.");
    }
  };

  const toggleNotif = (key) => {
    const next = { ...notif, [key]: !notif[key] };
    setNotif(next);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
    flash("ok", "Preferensi notifikasi disimpan.");
  };

  const initial = (form.full_name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <>
      <PageHeader
        title="Profil Saya"
        subtitle="Kelola informasi pribadi, keamanan akun, dan preferensi notifikasi."
      />

      {alert && (
        <div className={`prof-alert ${alert.type === "ok" ? "ok" : "err"}`}>
          {alert.type === "ok" && <FaCheckCircle />} {alert.text}
        </div>
      )}

      <div className="prof-grid">
        {/* Sidebar tab */}
        <Card>
          <div className="prof-side-user">
            {form.avatar_url ? (
              <img className="prof-side-ava" src={form.avatar_url} alt="Avatar"
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <div className="prof-side-ava ph">{initial}</div>
            )}
            <div className="prof-side-name">{form.full_name || "Member"}</div>
            <div className="prof-side-email">{user?.email}</div>
          </div>
          <nav className="prof-tabs">
            <button className={tab === "profil" ? "active" : ""} onClick={() => setTab("profil")}>
              <FaUser /> Edit Profil
            </button>
            <button className={tab === "password" ? "active" : ""} onClick={() => setTab("password")}>
              <FaLock /> Ganti Password
            </button>
            <button className={tab === "notif" ? "active" : ""} onClick={() => setTab("notif")}>
              <FaBell /> Preferensi Notifikasi
            </button>
          </nav>
        </Card>

        {/* Konten tab */}
        <div>
          {tab === "profil" && (
            <Card>
              <h3 className="prof-h3">Informasi Pribadi</h3>
              <form className="prof-form" onSubmit={handleSaveProfile}>
                <div className="prof-avatar-row">
                  {form.avatar_url ? (
                    <img className="prof-avatar-lg" src={form.avatar_url} alt="Avatar"
                      onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  ) : (
                    <div className="prof-avatar-lg ph">{initial}</div>
                  )}
                  <div className="prof-field" style={{ flex: 1 }}>
                    <label><FaCamera /> URL Foto Profil</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={form.avatar_url}
                      onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="prof-field">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="prof-field">
                  <label>Email</label>
                  <input type="email" value={user?.email || ""} disabled />
                  <small>Email tidak dapat diubah.</small>
                </div>

                <div className="prof-field">
                  <label>Nomor HP</label>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <button type="submit" className="prof-btn" disabled={savingProfile}>
                  {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            </Card>
          )}

          {tab === "password" && (
            <Card>
              <h3 className="prof-h3">Ganti Password</h3>
              <form className="prof-form" onSubmit={handleChangePassword}>
                <div className="prof-field">
                  <label>Password Baru</label>
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={pwd.next}
                    onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                    required
                  />
                </div>
                <div className="prof-field">
                  <label>Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    placeholder="Ulangi password baru"
                    value={pwd.confirm}
                    onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="prof-btn" disabled={savingPwd}>
                  {savingPwd ? "Menyimpan..." : "Ganti Password"}
                </button>
              </form>
            </Card>
          )}

          {tab === "notif" && (
            <Card>
              <h3 className="prof-h3">Preferensi Notifikasi</h3>
              <div className="prof-notif-list">
                <NotifRow
                  title="Notifikasi Email"
                  desc="Terima pembaruan penting lewat email."
                  on={notif.email}
                  onToggle={() => toggleNotif("email")}
                />
                <NotifRow
                  title="Pengingat Janji Temu"
                  desc="Ingatkan saya menjelang jadwal pemeriksaan."
                  on={notif.appointment}
                  onToggle={() => toggleNotif("appointment")}
                />
                <NotifRow
                  title="Promo & Penawaran"
                  desc="Info promo, diskon, dan penawaran member."
                  on={notif.promo}
                  onToggle={() => toggleNotif("promo")}
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function NotifRow({ title, desc, on, onToggle }) {
  return (
    <div className="prof-notif-row">
      <div>
        <div className="prof-notif-title">{title}</div>
        <div className="prof-notif-desc">{desc}</div>
      </div>
      <button
        type="button"
        className={`prof-switch ${on ? "on" : ""}`}
        onClick={onToggle}
        aria-pressed={on}
      >
        <span />
      </button>
    </div>
  );
}
