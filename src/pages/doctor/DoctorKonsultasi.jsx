// src/pages/doctor/DoctorKonsultasi.jsx
// =====================================================================
// KONSULTASI ONLINE — DOKTER (PRD 8.5)
//   - Inbox semua thread konsultasi member, filter status
//   - Balas pesan, tutup/buka konsultasi
// =====================================================================
import { useCallback, useEffect, useState } from "react";
import {
  FaComments, FaPaperPlane, FaArrowLeft, FaUser, FaCheck, FaUndo, FaCircle,
} from "react-icons/fa";
import { PageHeader, StatCard, Card, EmptyState, Button } from "../../components/ui";
import { Tabs, TabsList, TabsTrigger } from "../../components/shadcn";
import { useAuth } from "../../context/AuthContext";
import {
  getAllConsultations,
  getConsultationMessages,
  sendConsultationMessage,
  setConsultationStatus,
} from "../../lib/services";
import { supabase } from "../../lib/supabase";
import "./doctor.css";

const fmtTime = (iso) =>
  new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function DoctorKonsultasi() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getAllConsultations(user.id);
      setList(data);
    } catch (e) {
      console.error("Gagal memuat konsultasi:", e.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Efek real-time untuk inbox daftar konsultasi
  useEffect(() => {
    const channel = supabase
      .channel("doctor-consultations-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "consultations" },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  // Efek real-time untuk pesan di dalam thread aktif
  useEffect(() => {
    if (!active?.id) return;

    // Listener untuk pesan baru
    const msgChannel = supabase
      .channel(`doctor-chat-msgs-${active.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "consultation_messages", filter: `consultation_id=eq.${active.id}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    // Listener untuk perubahan status thread (misal jika status berubah)
    const statusChannel = supabase
      .channel(`doctor-chat-status-${active.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "consultations", filter: `id=eq.${active.id}` },
        (payload) => {
          setActive(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(statusChannel);
    };
  }, [active?.id]);

  useEffect(() => { load(); }, [load]);

  const openThread = async (c) => {
    setActive(c);
    setMessages([]);
    try {
      setMessages(await getConsultationMessages(c.id));
    } catch (e) {
      console.error(e.message);
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
        senderId: user?.id || null,
        message: text,
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } catch (e) {
      console.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const toggleStatus = async (c) => {
    const next = c.status === "OPEN" ? "CLOSED" : "OPEN";
    try {
      await setConsultationStatus(c.id, next);
      setActive((a) => (a ? { ...a, status: next } : a));
      setList((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: next } : x)));
    } catch (e) {
      console.error(e.message);
    }
  };

  const filtered = list.filter((c) => {
    if (filter === "all") return true;
    if (filter === "open") return c.status === "OPEN";
    return c.status === "CLOSED";
  });
  const openCount = list.filter((c) => c.status === "OPEN").length;

  // ---- Thread aktif ----
  if (active) {
    return (
      <div>
        <PageHeader title="Konsultasi" subtitle={active.subject} />
        <button className="kons-back" onClick={() => setActive(null)}>
          <FaArrowLeft /> Kembali ke inbox
        </button>

        <Card>
          <div className="kons-chat">
            <div className="kons-chat-head">
              <span className="kons-chat-ava"><FaUser /></span>
              <div>
                <b>{active.member?.full_name || "Member"}</b>
                <span className={`kons-status ${active.status === "OPEN" ? "open" : ""}`}>
                  <FaCircle /> {active.status === "OPEN" ? "Terbuka" : "Ditutup"}
                </span>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Button size="sm" variant={active.status === "OPEN" ? "danger" : "primary"}
                  leftIcon={active.status === "OPEN" ? <FaCheck /> : <FaUndo />}
                  onClick={() => toggleStatus(active)}>
                  {active.status === "OPEN" ? "Tutup" : "Buka Lagi"}
                </Button>
              </div>
            </div>

            <div className="kons-chat-body">
              {messages.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 13 }}>Belum ada pesan.</p>
              ) : (
                messages.map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={`kons-bubble ${mine ? "mine" : "doc"}`}>
                      <p>{m.message}</p>
                      <span>{fmtTime(m.created_at)}</span>
                    </div>
                  );
                })
              )}
            </div>

            {active.status === "OPEN" ? (
              <form className="kons-chat-input" onSubmit={handleSend}>
                <input type="text" placeholder="Tulis balasan..." value={draft}
                  onChange={(e) => setDraft(e.target.value)} />
                <button type="submit" disabled={sending || !draft.trim()}><FaPaperPlane /></button>
              </form>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: 13, paddingTop: 12 }}>
                Konsultasi ditutup. Buka kembali untuk membalas.
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ---- Inbox ----
  return (
    <div>
      <PageHeader title="Konsultasi Online" subtitle="Inbox pertanyaan dari member." />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaComments />} color="primary" label="Total Konsultasi" value={list.length} />
        <StatCard icon={<FaCircle />} color="warning" label="Terbuka" value={openCount} />
      </div>

      <div className="doc-mt">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="open">Terbuka{openCount > 0 ? ` (${openCount})` : ""}</TabsTrigger>
            <TabsTrigger value="closed">Ditutup</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card title="Daftar Konsultasi" subtitle={`Menampilkan ${filtered.length} thread`} className="doc-mt">
        {loading ? (
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat konsultasi...</p>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<FaComments />} title="Belum ada konsultasi" />
        ) : (
          <div className="kons-list">
            {filtered.map((c) => (
              <button key={c.id} className="kons-item" onClick={() => openThread(c)}>
                <span className="kons-item-ic"><FaComments /></span>
                <div className="kons-item-info">
                  <div className="kons-item-title">{c.subject}</div>
                  <div className="kons-item-sub">
                    {c.member?.full_name || "Member"} • {fmtTime(c.created_at)}
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
  );
}
