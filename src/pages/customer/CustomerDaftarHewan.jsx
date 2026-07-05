// src/pages/customer/CustomerDaftarHewan.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPaw, FaDog, FaCheckCircle, FaPlusCircle, FaTrash, FaChevronRight,
} from "react-icons/fa";

import { PageHeader, Card, Input, Button } from "../../components/ui";
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

const EMPTY = {
  name: "", species: "Kucing", breed: "", ageText: "", weightKg: "",
  gender: "", color: "", photo: "", vaccineStatus: "belum", healthStatus: "healthy", complaint: "",
};

export default function CustomerDaftarHewan() {
  const navigate = useNavigate();
  const { pets, addPet, removePet, loading } = useCustomerData();

  const [form, setForm] = useState(EMPTY);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const change = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const pet = await addPet(form);
      setSuccess(`"${pet.name}" berhasil ditambahkan.`);
      setForm(EMPTY);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Gagal menyimpan hewan ke database.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Hapus data "${name}"?`)) removePet(id);
  };

  return (
    <div>
      <PageHeader
        title="Hewan Peliharaan"
        subtitle="Tambah & kelola data hewan peliharaanmu."
      />

      {success && (
        <div className="dh-alert">
          <FaCheckCircle /> <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="dh-alert err">
          <span>{error}</span>
        </div>
      )}

      <div className="dh-layout">
        {/* ---------- Form tambah hewan ---------- */}
        <Card title="Tambah Hewan" subtitle="Lengkapi data hewan peliharaanmu.">
          <form className="dh-form" onSubmit={handleSubmit}>
            <Input
              label="Nama Hewan"
              placeholder="Mis. Milo"
              value={form.name}
              onChange={(e) => change("name", e.target.value)}
              leftIcon={<FaPaw />}
              required
            />

            <div className="dh-row">
              <div className="ui-field">
                <label className="ui-label">Jenis</label>
                <select className="dh-select" value={form.species}
                  onChange={(e) => change("species", e.target.value)}>
                  <option value="Kucing">Kucing</option>
                  <option value="Anjing">Anjing</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <Input label="Ras" placeholder="Mis. Persia" value={form.breed}
                onChange={(e) => change("breed", e.target.value)} leftIcon={<FaDog />} />
            </div>

            <div className="dh-row">
              <Input label="Usia" placeholder="Mis. 2 Tahun" value={form.ageText}
                onChange={(e) => change("ageText", e.target.value)} />
              <Input label="Berat (kg)" type="number" placeholder="Mis. 4.2" value={form.weightKg}
                onChange={(e) => change("weightKg", e.target.value)} />
            </div>

            <div className="dh-row">
              <div className="ui-field">
                <label className="ui-label">Kelamin</label>
                <select className="dh-select" value={form.gender}
                  onChange={(e) => change("gender", e.target.value)} required>
                  <option value="">Pilih kelamin</option>
                  <option value="Jantan">Jantan</option>
                  <option value="Betina">Betina</option>
                </select>
              </div>
              <Input label="Warna" placeholder="Mis. Putih abu-abu" value={form.color}
                onChange={(e) => change("color", e.target.value)} />
            </div>

            <div className="dh-row">
              <div className="ui-field">
                <label className="ui-label">Status Kesehatan</label>
                <select className="dh-select" value={form.healthStatus}
                  onChange={(e) => change("healthStatus", e.target.value)}>
                  <option value="healthy">Sehat</option>
                  <option value="recovery">Kontrol Lanjutan</option>
                  <option value="sick">Perlu Perhatian</option>
                </select>
              </div>
              <div className="ui-field">
                <label className="ui-label">Status Vaksin</label>
                <select className="dh-select" value={form.vaccineStatus}
                  onChange={(e) => change("vaccineStatus", e.target.value)}>
                  <option value="lengkap">Lengkap</option>
                  <option value="parsial">Parsial</option>
                  <option value="belum">Belum</option>
                </select>
              </div>
            </div>

            <Input label="URL Foto" placeholder="https://..."
              value={form.photo} onChange={(e) => change("photo", e.target.value)} required />

            <div className="ui-field">
              <label className="ui-label">Catatan / Keluhan (opsional)</label>
              <textarea className="dh-textarea" rows={3} value={form.complaint}
                onChange={(e) => change("complaint", e.target.value)}
                placeholder="Kondisi atau keluhan hewan..." />
            </div>

            <Button type="submit" variant="primary" leftIcon={<FaPlusCircle />} loading={saving}>
              {saving ? "Menyimpan..." : "Tambahkan Hewan"}
            </Button>
          </form>
        </Card>

        {/* ---------- Daftar hewan (kartu) ---------- */}
        <Card title="Daftar Hewan" subtitle={`${pets.length} hewan terdaftar`}>
          {loading ? (
            <p className="dh-empty">Memuat data hewan...</p>
          ) : pets.length === 0 ? (
            <p className="dh-empty">Belum ada hewan. Tambahkan lewat form di samping.</p>
          ) : (
            <div className="dh-grid">
              {pets.map((p) => {
                const h = HEALTH[p.healthStatus] ?? HEALTH.healthy;
                const v = VAC[p.vaccineStatus] ?? VAC.belum;
                return (
                  <div key={p.id} className="dh-pet" onClick={() => navigate(`/customer/hewan/${p.id}`)}>
                    <PetPhoto photo={p.photo} name={p.name} className="dh-pet-photo" />
                    <div className="dh-pet-body">
                      <div className="dh-pet-top">
                        <div>
                          <div className="dh-pet-name">{p.name}</div>
                          <div className="dh-pet-breed">{p.species} • {p.breed}</div>
                        </div>
                        <button className="dh-pet-del" title="Hapus"
                          onClick={(e) => handleDelete(e, p.id, p.name)}>
                          <FaTrash />
                        </button>
                      </div>
                      <div className="dh-pet-tags">
                        <span>Usia: {p.ageText}</span>
                        <span className={`dh-tag ${h.cls}`}>{h.label}</span>
                        <span className={`dh-tag ${v.cls}`}>{v.label}</span>
                      </div>
                      <div className="dh-pet-link">Lihat detail <FaChevronRight /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
