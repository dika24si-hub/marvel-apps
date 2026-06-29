// src/components/customer/NpsSurvey.jsx
// =====================================================================
// NPS SURVEY (PRD 10.5)
//   - Skala 0-10 "Seberapa mungkin Anda merekomendasikan VetCare?"
//   - Tersimpan ke Supabase (tabel leads, type 'nps')
//   - Muncul sekali; setelah dijawab disembunyikan (localStorage).
// =====================================================================
import { useState } from "react";
import { FaTimes, FaCheckCircle } from "react-icons/fa";
import { submitNps } from "../../lib/services";

const NPS_KEY = "vc_nps_done";

export default function NpsSurvey({ email }) {
  const [done, setDone] = useState(() => {
    try { return !!localStorage.getItem(NPS_KEY); } catch { return false; }
  });
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [thanks, setThanks] = useState(false);

  if (done) return null;

  const dismiss = () => {
    localStorage.setItem(NPS_KEY, "dismissed");
    setDone(true);
  };

  const submit = async () => {
    if (score == null) return;
    setSending(true);
    try {
      await submitNps({ score, comment, email });
      localStorage.setItem(NPS_KEY, "done");
      setThanks(true);
      setTimeout(() => setDone(true), 2000);
    } catch (e) {
      console.error("NPS gagal:", e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="nps-card">
      <button className="nps-close" onClick={dismiss} aria-label="Tutup"><FaTimes /></button>
      {thanks ? (
        <div className="nps-thanks"><FaCheckCircle /> Terima kasih atas masukan Anda!</div>
      ) : (
        <>
          <div className="nps-q">Seberapa mungkin Anda merekomendasikan VetCare ke teman?</div>
          <div className="nps-scale">
            {Array.from({ length: 11 }).map((_, n) => (
              <button key={n} className={`nps-num ${score === n ? "active" : ""}`} onClick={() => setScore(n)}>
                {n}
              </button>
            ))}
          </div>
          <div className="nps-legend"><span>Tidak mungkin</span><span>Sangat mungkin</span></div>
          {score != null && (
            <>
              <textarea className="nps-comment" rows={2} placeholder="Ceritakan alasan Anda (opsional)..."
                value={comment} onChange={(e) => setComment(e.target.value)} />
              <button className="nps-submit" onClick={submit} disabled={sending}>
                {sending ? "Mengirim..." : "Kirim"}
              </button>
            </>
          )}
        </>
      )}
    </section>
  );
}
