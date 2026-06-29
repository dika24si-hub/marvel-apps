// src/pages/customer/CustomerKonsultasi.jsx
// =====================================================================
// KONSULTASI ONLINE (PRD 7.6)
//   - Kirim pertanyaan ke dokter (pilih dokter + hewan + subjek)
//   - Lihat daftar thread konsultasi + status (OPEN/CLOSED)
//   - Buka thread -> chat dengan dokter (kirim pesan)
// Data nyata Supabase: consultations + consultation_messages.
// =====================================================================
import { useCallback, useEffect, useState } from "react";
import {
  FaComments, FaPlus, FaPaperPlane, FaArrowLeft, FaUserMd, FaCircle,
} from "react-icons/fa";
import { PageHeader, Card, EmptyState } from "../../components/ui";
import { Dialog } from "../../components/shadcn";
import { useAuth } from "../../context/AuthContext";
import { useCustomerData } from "../../context/CustomerDataContext";
import {
  getConsultations,
  createConsultation,
  getConsultationMessages,
  sendConsultationMessage,
  getDoctors,
} from "../../lib/services";
import "./customer.css";

const fmtTime = (iso) =>
  new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function CustomerKonsultasi() {
  const { user } = useAuth();
  const { pets } = useCustomerData();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);

  // Thread aktif
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  // Dialog buat konsultasi
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ subject: "", doctorId: "", animalId: "" });
  const [creating, setCreating] = useState(false);

  const loadList = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [cons, docs] = await Promise.all([getConsultations(user.id), getDoctors()]);
      setList(cons);
      setDoctors(docs);
    } catch (err) {
      console.error("Gagal memuat konsultasi:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openThread = async (c) => {
    setActive(c);
    setMessages([]);
    try {
      const msgs = await getConsultationMessages(c.id);
      setMessages(msgs);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    setSending(true);
    const text = draft.trim();
    setDraft("");
    try {
      const msg = await sendConsultationMessage({
        consultationId: active.id,
        senderId: user.id,
        message: text,
      });
      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      console.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject.trim()) return;
    setCreating(true);
    try {
      const c = await createConsultation({
        memberId: user.id,
        doctorId: form.doctorId || null,
        animalId: form.animalId || null,
        subject: form.subject,
      });
      setShowNew(false);
      setForm({ subject: "", doctorId: "", animalId: "" });
      await loadList();
      openThread(c);
    } catch (err) {
      console.error("Gagal membuat konsultasi:", err.message);
    } finally {
      setCreating(false);
    }
  };

  const doctorName = (id) => {
    const d = doctors.find((x) => x.id === id);
    return d?.profile?.full_name || "Dokter";
  };

  // ---- Tampilan thread (chat) ----
  if (active) {
    return (
      <>
        <PageHeader title="Konsultasi" subtitle={active.subject} />
        <button className="kons-back" onClick={() => setActive(null)}>
          <FaArrowLeft /> Kembali ke daftar
        </button>

        <Card>
          <div className="kons-chat">
            <div className="kons-chat-head">
              <span className="kons-chat-ava"><FaUserMd /></span>
              <div>
                <b>{active.doctor_id ? doctorName(active.doctor_id) : "Tim Dokter VetCare"}</b>
                <span className={`kons-status ${active.status === "OPEN" ? "open" : ""}`}>
                  <FaCircle /> {active.status === "OPEN" ? "Terbuka" : "Ditutup"}
                </span>
              </div>
            </div>

            <div className="kons-chat-body">
              {messages.length === 0 ? (
                <p className="dh-empty">Belum ada pesan. Mulai percakapan dengan dokter.</p>
              ) : (
                messages.map((m) => {
                  const mine = m.sender_id === user.id;
                  return (
                    <div key={m.id} className={`kons-bubble ${mine ? "mine" : "doc"}`}>
                      <p>{m.message}</p>
                      <span>{fmtTime(m.created_at)}</span>
                    </div>
                  );
                })
              )}
            </div>

            <form className="kons-chat-input" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Tulis pesan..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" disabled={sending || !draft.trim()}>
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </Card>
      </>
    );
  }

  // ---- Tampilan daftar konsultasi ----
  return (
    <>
      <PageHeader title="Konsultasi Online" subtitle="Tanya dokter hewan tanpa perlu datang ke klinik." />

      <div className="kons-toolbar">
        <button className="kons-new" onClick={() => setShowNew(true)}>
          <FaPlus /> Konsultasi Baru
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <Card title="Riwayat Konsultasi">
          {loading ? (
            <p className="dh-empty">Memuat konsultasi...</p>
          ) : list.length === 0 ? (
            <EmptyState icon={<FaComments />} title="Belum ada konsultasi" />
          ) : (
            <div className="kons-list">
              {list.map((c) => (
                <button key={c.id} className="kons-item" onClick={() => openThread(c)}>
                  <span className="kons-item-ic"><FaComments /></span>
                  <div className="kons-item-info">
                    <div className="kons-item-title">{c.subject}</div>
                    <div className="kons-item-sub">
                      {c.doctor_id ? doctorName(c.doctor_id) : "Tim Dokter VetCare"} • {fmtTime(c.created_at)}
                    </div>
                  </div>
                  <span className={`kons-badge ${c.status === "OPEN" ? "open" : ""}`}>
                    {c.status === "OPEN" ? "Terbuka" : "Ditutup"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Dialog konsultasi baru */}
      <Dialog
        open={showNew}
        onOpenChange={setShowNew}
        title="Konsultasi Baru"
        description="Sampaikan keluhan, dokter akan membalas secepatnya."
      >
        <form className="kons-form" onSubmit={handleCreate}>
          <div className="prof-field">
            <label>Subjek / Keluhan</label>
            <input
              type="text"
              placeholder="cth: Kucing saya tidak nafsu makan"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />
          </div>
          <div className="prof-field">
            <label>Hewan (opsional)</label>
            <select value={form.animalId} onChange={(e) => setForm({ ...form, animalId: e.target.value })}>
              <option value="">— Pilih hewan —</option>
              {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="prof-field">
            <label>Dokter (opsional)</label>
            <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">— Tim Dokter VetCare —</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.profile?.full_name || "Dokter"}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="prof-btn" disabled={creating}>
            {creating ? "Membuat..." : "Mulai Konsultasi"}
          </button>
        </form>
      </Dialog>
    </>
  );
}
