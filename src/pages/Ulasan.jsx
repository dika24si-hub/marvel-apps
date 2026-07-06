// src/pages/Ulasan.jsx
// =====================================================================
// FEEDBACK & RATING — ADMIN (PRD 10.5)
//   - Semua ulasan member, filter rating, sorot review negatif (<=2)
//   - KPI: rata-rata rating, jumlah ulasan, NPS-like (promotor%)
// =====================================================================
import { useEffect, useMemo, useState } from "react";
import {
  FaStar, FaThumbsUp, FaExclamationTriangle, FaCommentDots,
} from "react-icons/fa";
import {
  PageHeader, StatCard, Card, Table, Badge, EmptyState,
} from "../components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/shadcn";
import { usePageSearch } from "../context/SearchContext";
import { getAllReviews } from "../lib/services";
import { supabase } from "../lib/supabase";
import "./doctor/doctor.css";

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

export default function Ulasan() {
  const { matches } = usePageSearch("Cari ulasan atau member...");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const loadReviews = () => {
    getAllReviews()
      .then(setReviews)
      .catch((e) => console.error("Gagal memuat ulasan:", e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-reviews-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews" },
        () => loadReviews()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => loadReviews()
      )
      .subscribe();

    const handleFocus = () => loadReviews();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => reviews.filter((r) => {
    const mk = matches(r.member_name, r.doctor_name, r.comment, r.source);
    const mf = tab === "all"
      ? true
      : tab === "positive" ? r.rating >= 4
      : tab === "neutral" ? r.rating === 3
      : r.rating <= 2;
    return mk && mf;
  }), [reviews, matches, tab]);

  const count = reviews.length;
  const avg = count ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / count).toFixed(1) : 0;
  const promoters = reviews.filter((r) => r.rating >= 4).length;
  const detractors = reviews.filter((r) => r.rating <= 2).length;
  const npsLike = count ? Math.round(((promoters - detractors) / count) * 100) : 0;

  return (
    <div>
      <PageHeader title="Feedback & Rating" subtitle="Ulasan member untuk dokter & layanan klinik." />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaStar />} color="warning" label="Rating Rata-rata" value={`${avg} / 5`} />
        <StatCard icon={<FaCommentDots />} color="primary" label="Total Ulasan" value={count} />
        <StatCard icon={<FaThumbsUp />} color="success" label="NPS Score" value={npsLike} />
        <StatCard icon={<FaExclamationTriangle />} color="danger" label="Perlu Tindak Lanjut" value={detractors} />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="rekam-tabs">
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="positive">Positif (4-5)</TabsTrigger>
          <TabsTrigger value="neutral">Netral (3)</TabsTrigger>
          <TabsTrigger value="negative">Negatif (1-2){detractors > 0 ? ` (${detractors})` : ""}</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          <Card title="Daftar Ulasan" subtitle={`Menampilkan ${filtered.length} ulasan`}>
            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat ulasan...</p>
            ) : (
              <Table
                rowKey="id"
                data={filtered}
                empty={<EmptyState icon={<FaCommentDots />} title="Belum ada ulasan" />}
                columns={[
                  { key: "member", header: "Member", render: (r) => <b>{r.member_name}</b> },
                  { key: "source", header: "Sumber",
                    render: (r) => (
                      <Badge variant={r.source === "nps" ? "info" : "primary"}>
                        {r.source === "nps" ? "NPS" : "Ulasan Dokter"}
                      </Badge>
                    ),
                  },
                  { key: "target", header: "Dokter/Layanan", render: (r) => r.doctor_name || "-" },
                  { key: "rating", header: "Rating",
                    render: (r) => (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ color: "#f5b301" }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar key={i} style={{ opacity: i < r.rating ? 1 : 0.2, fontSize: 13 }} />
                          ))}
                        </span>
                        {r.source === "nps" && <small className="muted">NPS: {r.nps_score}/10</small>}
                      </div>
                    ),
                  },
                  { key: "comment", header: "Komentar", render: (r) => r.comment || "-" },
                  { key: "date", header: "Tanggal", render: (r) => fmtDate(r.created_at) },
                  { key: "flag", header: "Status",
                    render: (r) => r.rating <= 2
                      ? <Badge variant="danger" dot>Tindak Lanjut</Badge>
                      : <Badge variant="success" dot>Baik</Badge> },
                ]}
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
