// src/pages/doctor/DoctorProfil.jsx
// =====================================================================
// PROFIL DOKTER (PRD 8.7)
//   - Edit profil publik (nama, spesialisasi, bio, foto)
//   - Edit profil privat (no HP, kota, no STR)
//   - Ganti password
// Data nyata dari Supabase (profiles + doctors).
// =====================================================================
import { useEffect, useState } from "react";
import {
  FaUserMd, FaLock, FaCheckCircle, FaIdBadge, FaStethoscope,
} from "react-icons/fa";
import { PageHeader, Card } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { getDoctorProfile, updateDoctorProfile } from "../../lib/services";
import "./doctor.css";

export default function DoctorProfil() {
  const { user, profile, changePassword, getUserProfile } = useAuth();
  const [tab, setTab] = useState("publik");
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    full_name: "", phone: "", city: "", avatar_url: "",
    specialization: "", str_number: "", bio: "",
  });
  const [saving, setSaving] = useState(false);

  const [pwd, setPwd] = useState({ next: "", confirm: "" });
  const [savingPwd, setSavingPwd] = useState(false);

  const isLocal = typeof user?.id === "string" && user.id.startsWith("local-");

  useEffect(() => {
    if (!user?.id || isLocal) {
      // Akun lokal: pakai data profile seadanya.
      if (profile) {
        setForm((f) => ({ ...f, full_name: profile.full_name || "" }));
      }
      setLoading(false);
      return;
    }
    getDoctorProfile(user.id)
      .then((d) => {
        setForm({
          full_name: d.full_name || "",
          phone: d.phone || "",
          city: d.city || "",
          avatar_url: d.avatar_url || "",
          specialization: d.specialization || "",
          str_number: d.str_number || "",
          bio: d.bio || "",
        });
      })
      .catch((e) => console.error("Gagal memuat profil dokter:", e.message))
      .finally(() => setLoading(false));
  }, [user?.id, isLocal, profile]);

  const flash = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isLocal) {
      flash("err", "Akun demo lokal tidak dapat menyimpan ke database.");
      return;
    }
    setSaving(true);
    try {
      await updateDoctorProfile(user.id, form);
      await getUserProfile?.();
      flash("ok", "Profil berhasil diperbarui.");
    } catch (err) {
      flash("err", err.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwd.next.length < 6) return flash("err", "Password baru minimal 6 karakter.");
    if (pwd.next !== pwd.confirm) return flash("err", "Konfirmasi password tidak cocok.");
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

  const initial = (form.full_name || "D").charAt(0).toUpperCase();

  return (
    <div>
      <PageHeader title="Profil Dokter" subtitle="Kelola informasi profil dan keamanan akun." />

      {alert && (
        <div className={`prof-alert ${alert.type === "ok" ? "ok" : "err"}`} style={{ marginTop: 8 }}>
          {alert.type === "ok" && <FaCheckCircle />} {alert.text}
        </div>
      )}

      <div className="prof-grid doc-mt">
        <Card>
          <div className="prof-side-user">
            {form.avatar_url ? (
              <img className="prof-side-ava" src={form.avatar_url} alt="Avatar"
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <div className="prof-side-ava ph">{initial}</div>
            )}
            <div className="prof-side-name">drh. {form.full_name || "Dokter"}</div>
            <div className="prof-side-email">{form.specialization || "Dokter Hewan"}</div>
          </div>
          <nav className="prof-tabs">
            <button className={tab === "publik" ? "active" : ""} onClick={() => setTab("publik")}>
              <FaUserMd /> Profil Publik
            </button>
            <button className={tab === "privat" ? "active" : ""} onClick={() => setTab("privat")}>
              <FaIdBadge /> Profil Privat
            </button>
            <button className={tab === "password" ? "active" : ""} onClick={() => setTab("password")}>
              <FaLock /> Ganti Password
            </button>
          </nav>
        </Card>

        <div>
          {loading ? (
            <Card><p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat profil...</p></Card>
          ) : tab === "publik" ? (
            <Card>
              <h3 className="prof-h3">Profil Publik</h3>
              <form className="prof-form" onSubmit={handleSave}>
                <div className="prof-field">
                  <label>URL Foto Profil</label>
                  <input type="url" placeholder="https://..." value={form.avatar_url}
                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} />
                </div>
                <div className="prof-field">
                  <label>Nama Lengkap</label>
                  <input type="text" value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                </div>
                <div className="prof-field">
                  <label><FaStethoscope /> Spesialisasi</label>
                  <input type="text" placeholder="cth: Bedah, Penyakit Dalam" value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
                </div>
                <div className="prof-field">
                  <label>Bio / Tentang</label>
                  <textarea rows={4} placeholder="Pengalaman, pendidikan, fokus layanan..."
                    value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    style={{ padding: "11px 13px", border: "1px solid #d9e2d9", borderRadius: 10, fontFamily: "inherit", fontSize: 14, resize: "vertical" }} />
                </div>
                <button type="submit" className="prof-btn" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            </Card>
          ) : tab === "privat" ? (
            <Card>
              <h3 className="prof-h3">Profil Privat</h3>
              <form className="prof-form" onSubmit={handleSave}>
                <div className="prof-field">
                  <label>Email</label>
                  <input type="email" value={user?.email || ""} disabled />
                </div>
                <div className="prof-row2">
                  <div className="prof-field">
                    <label>Nomor HP</label>
                    <input type="tel" placeholder="08xxxxxxxxxx" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="prof-field">
                    <label>Kota</label>
                    <input type="text" placeholder="Kota praktik" value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                </div>
                <div className="prof-field">
                  <label><FaIdBadge /> Nomor STR</label>
                  <input type="text" placeholder="Nomor Surat Tanda Registrasi" value={form.str_number}
                    onChange={(e) => setForm({ ...form, str_number: e.target.value })} />
                </div>
                <button type="submit" className="prof-btn" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            </Card>
          ) : (
            <Card>
              <h3 className="prof-h3">Ganti Password</h3>
              <form className="prof-form" onSubmit={handleChangePassword}>
                <div className="prof-field">
                  <label>Password Baru</label>
                  <input type="password" placeholder="Minimal 6 karakter" value={pwd.next}
                    onChange={(e) => setPwd({ ...pwd, next: e.target.value })} required />
                </div>
                <div className="prof-field">
                  <label>Konfirmasi Password Baru</label>
                  <input type="password" placeholder="Ulangi password baru" value={pwd.confirm}
                    onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} required />
                </div>
                <button type="submit" className="prof-btn" disabled={savingPwd}>
                  {savingPwd ? "Menyimpan..." : "Ganti Password"}
                </button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
