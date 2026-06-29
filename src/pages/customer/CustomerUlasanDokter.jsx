// src/pages/customer/CustomerUlasanDokter.jsx
// =====================================================================
// ULASAN & RATING DOKTER (PRD 7.4.9 & 10.5)
//   - Daftar dokter + agregat rating dari Supabase (tabel reviews)
//   - Member memberi rating bintang + komentar -> tersimpan ke DB
//   - Review negatif (<=2) memicu notifikasi tindak lanjut
// =====================================================================
import { useCallback, useEffect, useState } from "react";
import {
  FaStar, FaRegStar, FaUserMd, FaCommentDots, FaCheckCircle, FaThumbsUp,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card, Button, Avatar, Tag, EmptyState } from "../../components/ui";
import { getDoctorsWithReviews, submitReview } from "../../lib/services";

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";

function StarRating({ value = 0, onChange, size = 16, readOnly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "inline-flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hover || value) >= star;
        return (
          <span
            key={star}
            role={readOnly ? undefined : "button"}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onChange?.(star)}
            style={{ color: active ? "#f5b301" : "#d8ddd6", fontSize: size, cursor: readOnly ? "default" : "pointer", lineHeight: 1 }}
          >
            {active ? <FaStar /> : <FaRegStar />}
          </span>
        );
      })}
    </div>
  );
}

function ReviewForm({ onSubmit, busy }) {
  const [rating, setRating] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return setErr("Silakan pilih rating bintang.");
    if (!komentar.trim()) return setErr("Komentar tidak boleh kosong.");
    onSubmit({ rating, komentar: komentar.trim() }, () => { setRating(0); setKomentar(""); setErr(""); });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14, paddingTop: 14, borderTop: "1px dashed #e5e9e2" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12.5, color: "#7a857f" }}>Rating Anda:</span>
        <StarRating value={rating} onChange={setRating} size={20} />
      </div>
      <textarea value={komentar} onChange={(e) => setKomentar(e.target.value)}
        placeholder="Tulis ulasan Anda untuk dokter ini..." rows={3}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e9e2", fontSize: 13, resize: "vertical", fontFamily: "inherit" }} />
      {err && <small style={{ color: "#b91c1c", fontSize: 12 }}>{err}</small>}
      <div>
        <Button type="submit" variant="primary" size="sm" leftIcon={<FaCommentDots />} loading={busy}>
          Kirim Ulasan
        </Button>
      </div>
    </form>
  );
}

export default function CustomerUlasanDokter() {
  const { user, profile } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDoctors(await getDoctorsWithReviews());
    } catch (e) {
      console.error("Gagal memuat ulasan:", e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleAddReview = async (doctorId, { rating, komentar }, reset) => {
    if (!user?.id) return;
    setBusyId(doctorId);
    try {
      await submitReview({ memberId: user.id, doctorId, rating, comment: komentar });
      reset?.();
      await load();
    } catch (e) {
      alert("Gagal mengirim ulasan: " + e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Ulasan Dokter" subtitle="Beri penilaian untuk dokter yang telah menangani hewan Anda." />

      {loading ? (
        <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 14 }}>Memuat dokter...</p>
      ) : doctors.length === 0 ? (
        <div style={{ marginTop: 14 }}>
          <Card><EmptyState icon={<FaUserMd />} title="Belum ada dokter" /></Card>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16, marginTop: 14 }}>
          {doctors.map((doc) => (
            <Card key={doc.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={doc.name} size={48} rounded="full" theme="purple" />
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 14.5, display: "block" }}>{doc.name}</b>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#7a857f", fontSize: 12, marginTop: 2 }}>
                    <FaUserMd style={{ fontSize: 11 }} />
                    <span>{doc.specialization}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14, padding: "12px 0", borderTop: "1px solid #f0f2ee", borderBottom: "1px solid #f0f2ee" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#7a857f" }}>
                    <FaStar style={{ color: "#f5b301", fontSize: 11 }} /> Rating
                  </div>
                  <b style={{ fontSize: 16 }}>{doc.avgRating || 0} / 5</b>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#7a857f" }}>Total Ulasan</div>
                  <b style={{ fontSize: 16 }}>{doc.totalReviews}</b>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#7a857f" }}>
                    <FaThumbsUp style={{ fontSize: 10 }} /> Rekomendasi
                  </div>
                  <b style={{ fontSize: 16 }}>{doc.recommend}%</b>
                </div>
              </div>

              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12, maxHeight: 260, overflowY: "auto" }}>
                {doc.reviews.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: "#aab2ac" }}>Belum ada ulasan. Jadilah yang pertama!</p>
                ) : (
                  doc.reviews.map((rev) => (
                    <div key={rev.created_at + rev.member_id} style={{ background: "#f8faf7", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <b style={{ fontSize: 13 }}>{rev.member_name}</b>
                        {rev.rating >= 5 && (
                          <Tag color="brand"><FaCheckCircle style={{ fontSize: 9, marginRight: 3 }} /> Top</Tag>
                        )}
                      </div>
                      <StarRating value={rev.rating} readOnly size={13} />
                      <p style={{ fontSize: 12.5, color: "#56605a", lineHeight: 1.5, margin: "8px 0 6px" }}>{rev.comment}</p>
                      <small style={{ color: "#aab2ac", fontSize: 11 }}>{fmtDate(rev.created_at)}</small>
                    </div>
                  ))
                )}
              </div>

              <ReviewForm busy={busyId === doc.id} onSubmit={(data, reset) => handleAddReview(doc.id, data, reset)} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
