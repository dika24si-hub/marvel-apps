// src/pages/customer/CustomerJadwal.jsx
import { useState } from "react";
import { FaCalendarCheck, FaCalendarPlus, FaCheckCircle } from "react-icons/fa";

import { PageHeader, Card, EmptyState, Button, Input } from "../../components/ui";
import { useCustomerData } from "../../context/CustomerDataContext";
import { dummyDoctors } from "../../data/dummyCustomer";
import "./customer.css";

const fmt = (iso) =>
  new Date(iso).toLocaleString("id-ID", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });

const EMPTY = { petId: "", date: "", time: "", doctorName: dummyDoctors[0], reason: "" };

export default function CustomerJadwal() {
  const { pets, appointments, addAppointment, cancelAppointment } = useCustomerData();

  const [form, setForm] = useState(EMPTY);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const change = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const upcoming = appointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.petId) return setError("Pilih hewan yang akan diperiksa.");
    if (!form.date || !form.time) return setError("Tanggal & jam wajib diisi.");

    const pet = pets.find((p) => p.id === form.petId);
    addAppointment({
      petId: pet.id,
      petName: pet.name,
      doctorName: form.doctorName,
      reason: form.reason,
      dateTime: `${form.date}T${form.time}:00`,
    });

    setSuccess(`Booking untuk ${pet.name} berhasil dibuat.`);
    setForm(EMPTY);
    setTimeout(() => setSuccess(""), 4000);
  };

  return (
    <>
      <PageHeader title="Jadwal Periksa" subtitle="Booking pemeriksaan & kelola jadwal." />

      {success && (
        <div className="dh-alert"><FaCheckCircle /> <span>{success}</span></div>
      )}

      <div className="dh-layout">
        {/* ---------- Form booking ---------- */}
        <Card title="Booking Pemeriksaan" subtitle="Buat jadwal pemeriksaan baru.">
          {pets.length === 0 ? (
            <EmptyState
              title="Belum ada hewan"
              description="Tambahkan hewan dulu sebelum booking pemeriksaan."
            />
          ) : (
            <form className="dh-form" onSubmit={handleSubmit}>
              <div className="ui-field">
                <label className="ui-label">Hewan</label>
                <select className="dh-select" value={form.petId}
                  onChange={(e) => change("petId", e.target.value)}>
                  <option value="">— Pilih hewan —</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                  ))}
                </select>
              </div>

              <div className="dh-row">
                <Input label="Tanggal" type="date" value={form.date}
                  onChange={(e) => change("date", e.target.value)} required />
                <Input label="Jam" type="time" value={form.time}
                  onChange={(e) => change("time", e.target.value)} required />
              </div>

              <div className="ui-field">
                <label className="ui-label">Dokter</label>
                <select className="dh-select" value={form.doctorName}
                  onChange={(e) => change("doctorName", e.target.value)}>
                  {dummyDoctors.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <Input label="Keluhan / Tujuan" placeholder="Mis. Vaksin tahunan"
                value={form.reason} onChange={(e) => change("reason", e.target.value)} />

              {error && <p className="dh-error">{error}</p>}

              <Button type="submit" variant="primary" leftIcon={<FaCalendarPlus />}>
                Buat Booking
              </Button>
            </form>
          )}
        </Card>

        {/* ---------- Jadwal mendatang ---------- */}
        <Card title="Jadwal Mendatang" subtitle={`${upcoming.length} jadwal aktif`}>
          {upcoming.length === 0 ? (
            <EmptyState icon={<FaCalendarCheck />} title="Belum ada jadwal"
              description="Booking pemeriksaan lewat form di samping." />
          ) : (
            <div className="dh-appt-list">
              {upcoming.map((a) => (
                <div key={a.id} className="appt-item">
                  <div className="appt-left">
                    <span className="appt-ic"><FaCalendarCheck /></span>
                    <div>
                      <p className="appt-title">{a.petName} • {a.reason}</p>
                      <p className="appt-sub">{a.doctorName} • {fmt(a.dateTime)}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="danger"
                    onClick={() => cancelAppointment(a.id)}>
                    Batalkan
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
