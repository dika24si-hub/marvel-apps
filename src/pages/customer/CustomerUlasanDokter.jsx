// src/pages/customer/CustomerUlasanDokter.jsx
// =====================================================================
// ULASAN & RATING DOKTER (PRD 7.4.9 & 10.5)
//   - Daftar dokter + agregat rating dari Supabase (tabel reviews)
//   - Member memberi rating bintang + komentar -> tersimpan ke DB
//   - Review negatif (<=2) memicu notifikasi tindak lanjut
// =====================================================================
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  FaStar, FaRegStar, FaUserMd, FaCommentDots, FaCheckCircle, FaThumbsUp,
  FaArrowRight, FaPen, FaHistory
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card, Button, Avatar, Tag, EmptyState } from "../../components/ui";
import { Dialog, Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/shadcn";
import { getDoctorsWithReviews, submitReview } from "../../lib/services";

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";

function StarRating({ value = 0, onChange, size = 16, readOnly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "inline-flex", gap: 5 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hover || value) >= star;
        return (
          <span
            key={star}
            role={readOnly ? undefined : "button"}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onChange?.(star)}
            style={{
              color: active ? "#f5b301" : "#e2e8f0",
              fontSize: size,
              cursor: readOnly ? "default" : "pointer",
              lineHeight: 1,
              transition: "transform 0.1s, color 0.15s",
              transform: !readOnly && hover === star ? "scale(1.25)" : "none",
              display: "inline-block"
            }}
          >
            {active ? <FaStar /> : <FaRegStar />}
          </span>
        );
      })}
    </div>
  );
}

function ReviewFormModal({ doctor, onSubmit, busy, onClose }) {
  const [rating, setRating] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [err, setErr] = useState("");

  const emojiMap = {
    0: "Beri rating bintang",
    1: "Buruk sekali 😞",
    2: "Kurang memuaskan 🙁",
    3: "Cukup baik 😐",
    4: "Sangat baik 🙂",
    5: "Luar biasa! 😍"
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return setErr("Silakan pilih rating bintang.");
    if (!komentar.trim()) return setErr("Komentar tidak boleh kosong.");
    onSubmit({ rating, komentar: komentar.trim() }, () => {
      setRating(0);
      setKomentar("");
      setErr("");
      onClose();
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Bagaimana pelayanan dari</p>
        <h4 style={{ margin: "4px 0 12px", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{doctor?.name}</h4>
        
        <div style={{ margin: "14px 0 6px" }}>
          <StarRating value={rating} onChange={setRating} size={32} />
        </div>
        <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: rating > 0 ? "#10b981" : "#94a3b8", minHeight: 18 }}>
          {emojiMap[rating]}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 700, color: "#475569" }}>Tulis Ulasan Anda</label>
        <textarea
          value={komentar}
          onChange={(e) => setKomentar(e.target.value)}
          placeholder="Ceritakan pengalaman Anda berinteraksi dengan dokter ini..."
          rows={4}
          maxLength={500}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            fontSize: 13,
            resize: "none",
            fontFamily: "inherit",
            outline: "none",
            transition: "border-color 0.15s",
            background: "#f8fafc"
          }}
          onFocus={(e) => e.target.style.borderColor = "#10b981"}
          onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }}>
          <span>{err && <span style={{ color: "#ef4444", fontWeight: 600 }}>{err}</span>}</span>
          <span>{komentar.length}/500 karakter</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Button type="button" variant="outline" style={{ flex: 1 }} onClick={onClose} disabled={busy}>
          Batal
        </Button>
        <Button type="submit" variant="primary" style={{ flex: 1 }} loading={busy}>
          Kirim Ulasan
        </Button>
      </div>
    </form>
  );
}

export default function CustomerUlasanDokter() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [activeTab, setActiveTab] = useState("doctors");

  // Modal State
  const [selectedDoctor, setSelectedDoctor] = useState(null);

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

  // Ulasan yang ditulis oleh user saat ini
  const myReviews = useMemo(() => {
    const list = [];
    doctors.forEach((doc) => {
      doc.reviews.forEach((rev) => {
        if (rev.member_id === user?.id) {
          list.push({
            ...rev,
            doctorName: doc.name,
            doctorSpecialization: doc.specialization
          });
        }
      });
    });
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [doctors, user]);

  return (
    <div>
      <PageHeader title="Ulasan & Rating Dokter" subtitle="Berikan masukan tulus Anda untuk dokter yang menangani hewan Anda." />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="rekam-tabs" style={{ marginTop: 14 }}>
        <TabsList>
          <TabsTrigger value="doctors" icon={<FaUserMd />}>Daftar Dokter</TabsTrigger>
          <TabsTrigger value="my-reviews" icon={<FaHistory />}>Ulasanku ({myReviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="doctors">
          {loading ? (
            <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 14 }}>Memuat daftar dokter...</p>
          ) : doctors.length === 0 ? (
            <div style={{ marginTop: 14 }}>
              <Card><EmptyState icon={<FaUserMd />} title="Belum ada dokter terdaftar" /></Card>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16, marginTop: 14 }}>
              {doctors.map((doc) => (
                <Card key={doc.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "transform 0.2s, box-shadow 0.2s" }} className="hover-premium">
                  <div>
                    {/* Header info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <Avatar name={doc.name} size={52} rounded="full" theme="purple" />
                      <div style={{ flex: 1 }}>
                        <b style={{ fontSize: 15, display: "block", color: "#0f172a" }}>{doc.name}</b>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 12, marginTop: 3 }}>
                          <FaUserMd style={{ fontSize: 11 }} />
                          <span>{doc.specialization}</span>
                        </span>
                      </div>
                    </div>

                    {/* Stats summary */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 8,
                      margin: "14px 0",
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: 10,
                      border: "1px solid #f1f5f9"
                    }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 11, color: "#64748b", marginBottom: 2 }}>
                          <FaStar style={{ color: "#f5b301", fontSize: 11 }} /> Rating
                        </div>
                        <b style={{ fontSize: 15, color: "#0f172a" }}>{doc.avgRating || 0} / 5</b>
                      </div>
                      <div style={{ textAlign: "center", borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>Ulasan</div>
                        <b style={{ fontSize: 15, color: "#0f172a" }}>{doc.totalReviews}</b>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 11, color: "#64748b", marginBottom: 2 }}>
                          <FaThumbsUp style={{ fontSize: 10, color: "#10b981" }} /> Rekomendasi
                        </div>
                        <b style={{ fontSize: 15, color: "#10b981" }}>{doc.recommend}%</b>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 8 }}>Ulasan Terbaru</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 180, overflowY: "auto", paddingRight: 4 }}>
                        {doc.reviews.length === 0 ? (
                          <p style={{ fontSize: 12.5, color: "#94a3b8", fontStyle: "italic", margin: "6px 0" }}>Belum ada ulasan untuk dokter ini.</p>
                        ) : (
                          doc.reviews.slice(0, 3).map((rev) => (
                            <div key={rev.created_at + rev.member_id} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px", border: "1px solid #f1f5f9" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <b style={{ fontSize: 12, color: "#334155" }}>{rev.member_name}</b>
                                <StarRating value={rev.rating} readOnly size={10} />
                              </div>
                              <p style={{ fontSize: 12, color: "#475569", margin: "4px 0", lineHeight: 1.4 }}>{rev.comment}</p>
                              <small style={{ color: "#94a3b8", fontSize: 10 }}>{fmtDate(rev.created_at)}</small>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<FaPen />}
                      style={{ width: "100%" }}
                      onClick={() => setSelectedDoctor(doc)}
                    >
                      Beri Ulasan & Bintang
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-reviews">
          {myReviews.length === 0 ? (
            <Card style={{ marginTop: 14 }}>
              <EmptyState
                icon={<FaCommentDots />}
                title="Kamu belum pernah memberi ulasan"
                description="Ulasan yang kamu berikan ke dokter akan tercantum di sini."
              />
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginTop: 14 }}>
              {myReviews.map((rev) => (
                <Card key={rev.created_at} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <b style={{ fontSize: 14, display: "block", color: "#0f172a" }}>{rev.doctorName}</b>
                      <span style={{ fontSize: 11.5, color: "#64748b" }}>{rev.doctorSpecialization}</span>
                    </div>
                    <StarRating value={rev.rating} readOnly size={13} />
                  </div>
                  <hr style={{ border: 0, borderTop: "1px dashed #cbd5e1", margin: 0 }} />
                  <p style={{ fontSize: 13, color: "#334155", margin: 0, lineHeight: 1.5, flexGrow: 1 }}>
                    "{rev.comment}"
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#94a3b8" }}>
                    <span>{fmtDate(rev.created_at)}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <FaCheckCircle style={{ color: "#10b981" }} /> Terkirim ke Admin
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal Popup interaktif untuk Form Ulasan */}
      <Dialog
        open={!!selectedDoctor}
        onOpenChange={(o) => !o && setSelectedDoctor(null)}
        title="Tulis Ulasan Baru"
        description="Masukan Anda membantu meningkatkan kualitas pelayanan dokter kami."
        size="sm"
      >
        {selectedDoctor && (
          <ReviewFormModal
            doctor={selectedDoctor}
            busy={busyId === selectedDoctor.id}
            onClose={() => setSelectedDoctor(null)}
            onSubmit={(data, reset) => handleAddReview(selectedDoctor.id, data, reset)}
          />
        )}
      </Dialog>
    </div>
  );
}
