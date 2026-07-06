// src/pages/doctor/DoctorUlasan.jsx
import { useEffect, useMemo, useState } from "react";
import { FaStar, FaRegStar, FaCommentDots, FaHistory } from "react-icons/fa";
import { PageHeader, StatCard, Card, Table, EmptyState, Avatar } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { usePageSearch } from "../../context/SearchContext";
import { supabase } from "../../lib/supabase";
import "./doctor.css";

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";

function StarRating({ value = 0, size = 12 }) {
  return (
    <div style={{ display: "inline-flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            color: value >= star ? "#f5b301" : "#e2e8f0",
            fontSize: size,
            lineHeight: 1,
            display: "inline-block"
          }}
        >
          {value >= star ? <FaStar /> : <FaRegStar />}
        </span>
      ))}
    </div>
  );
}

export default function DoctorUlasan() {
  const { profile } = useAuth();
  const { matches } = usePageSearch("Cari komentar ulasan...");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      // Fetch reviews for this doctor
      const { data: revs, error: revErr } = await supabase
        .from("reviews")
        .select("*")
        .eq("doctor_id", profile.id)
        .order("created_at", { ascending: false });

      if (revErr) throw revErr;
      const all = revs || [];

      // Fetch member names
      const memberIds = [...new Set(all.map((r) => r.member_id).filter(Boolean))];
      let nameMap = {};
      if (memberIds.length) {
        const { data: members } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", memberIds);
        nameMap = Object.fromEntries((members || []).map((m) => [m.id, m.full_name]));
      }

      setReviews(
        all.map((r) => ({
          ...r,
          member_name: nameMap[r.member_id] || "Member",
        }))
      );
    } catch (e) {
      console.error("Gagal memuat ulasan:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [profile?.id]);

  const filtered = useMemo(() => {
    return reviews.filter((r) => matches(r.member_name, r.comment));
  }, [reviews, matches]);

  const stats = useMemo(() => {
    const count = reviews.length;
    const avg = count ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count).toFixed(1) : "0.0";
    const positive = count ? Math.round((reviews.filter((r) => r.rating >= 4).length / count) * 100) : 0;
    return { count, avg, positive };
  }, [reviews]);

  return (
    <div>
      <PageHeader title="Ulasan & Rating Saya" subtitle="Masukan dan feedback langsung dari pemilik hewan." />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaStar />} color="warning" label="Rating Rata-rata" value={`${stats.avg} / 5`} />
        <StatCard icon={<FaCommentDots />} color="primary" label="Total Ulasan" value={stats.count} />
        <StatCard icon={<FaHistory />} color="success" label="Ulasan Positif" value={`${stats.positive}%`} />
      </div>

      <Card title="Daftar Ulasan Pasien" subtitle={`Menampilkan ${filtered.length} ulasan`} className="doc-mt">
        {loading ? (
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat ulasan...</p>
        ) : (
          <Table
            rowKey="id"
            data={filtered}
            empty={<EmptyState title="Belum ada ulasan" description="Ulasan dari member akan muncul di sini." />}
            columns={[
              {
                key: "member",
                header: "Pasien / Pemilik",
                render: (r) => (
                  <div className="pet-cell">
                    <Avatar name={r.member_name} size={36} rounded="full" theme="purple" />
                    <div>
                      <b>{r.member_name}</b>
                    </div>
                  </div>
                )
              },
              {
                key: "rating",
                header: "Rating Bintang",
                render: (r) => <StarRating value={r.rating} size={13} />
              },
              {
                key: "comment",
                header: "Ulasan / Komentar",
                render: (r) => <span style={{ fontSize: 13, color: "#475569" }}>{r.comment || "-"}</span>
              },
              {
                key: "created_at",
                header: "Tanggal",
                render: (r) => <span className="muted">{fmtDate(r.created_at)}</span>
              }
            ]}
          />
        )}
      </Card>
    </div>
  );
}
