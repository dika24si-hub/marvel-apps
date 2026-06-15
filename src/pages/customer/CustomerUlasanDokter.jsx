import { useMemo, useState } from "react";
import {
  FaStar,
  FaRegStar,
  FaUserMd,
  FaCommentDots,
  FaCheckCircle,
  FaThumbsUp,
} from "react-icons/fa";

import { useLang } from "../../i18n/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card, Button, Avatar, Tag } from "../../components/ui";

// =====================================================
// DATA DUMMY — 5 DOKTER
// (statis di front-end; bisa diganti fetch dari Supabase)
// =====================================================
const INITIAL_DOCTORS = [
  {
    id: 1,
    nama: "drh. Andini Pratiwi",
    spesialis: "Spesialis Kucing",
    avgRating: 4.9,
    totalUlasan: 132,
    rekomendasi: 99,
    reviews: [
      {
        id: 11,
        nama: "Dika Sinambela",
        rating: 5,
        komentar: "Dokter sangat ramah dan menjelaskan kondisi hewan dengan baik.",
        tanggal: "12 Juni 2026",
      },
      {
        id: 12,
        nama: "Rani Wijaya",
        rating: 5,
        komentar: "Penanganan cepat, kucing saya langsung membaik.",
        tanggal: "8 Juni 2026",
      },
    ],
  },
  {
    id: 2,
    nama: "drh. Budi Santoso",
    spesialis: "Spesialis Anjing",
    avgRating: 4.7,
    totalUlasan: 98,
    rekomendasi: 96,
    reviews: [
      {
        id: 21,
        nama: "Agus Salim",
        rating: 5,
        komentar: "Sabar dan teliti saat memeriksa anjing saya.",
        tanggal: "10 Juni 2026",
      },
    ],
  },
  {
    id: 3,
    nama: "drh. Citra Lestari",
    spesialis: "Bedah Hewan",
    avgRating: 4.8,
    totalUlasan: 125,
    rekomendasi: 98,
    reviews: [
      {
        id: 31,
        nama: "Maya Putri",
        rating: 5,
        komentar: "Operasi berjalan lancar, komunikasi pasca operasi jelas.",
        tanggal: "5 Juni 2026",
      },
    ],
  },
  {
    id: 4,
    nama: "drh. Dimas Prakoso",
    spesialis: "Vaksinasi & Imunisasi",
    avgRating: 4.6,
    totalUlasan: 76,
    rekomendasi: 94,
    reviews: [
      {
        id: 41,
        nama: "Tono Hartono",
        rating: 4,
        komentar: "Pelayanan baik, antrian sedikit lama tapi sepadan.",
        tanggal: "3 Juni 2026",
      },
    ],
  },
  {
    id: 5,
    nama: "drh. Eka Saputri",
    spesialis: "Konsultasi Nutrisi",
    avgRating: 4.9,
    totalUlasan: 110,
    rekomendasi: 99,
    reviews: [
      {
        id: 51,
        nama: "Sinta Dewi",
        rating: 5,
        komentar: "Rekomendasi nutrisi sangat membantu kesehatan hewan saya.",
        tanggal: "1 Juni 2026",
      },
    ],
  },
];

// =====================================================
// STAR RATING — bisa statis atau interaktif
// =====================================================
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
            aria-label={readOnly ? undefined : `Beri ${star} bintang`}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onChange?.(star)}
            style={{
              color: active ? "#f5b301" : "#d8ddd6",
              fontSize: size,
              cursor: readOnly ? "default" : "pointer",
              lineHeight: 1,
              transition: "color .15s",
            }}
          >
            {active ? <FaStar /> : <FaRegStar />}
          </span>
        );
      })}
    </div>
  );
}

// =====================================================
// FORM ULASAN — rating + komentar
// =====================================================
function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      setErr("Silakan pilih rating bintang terlebih dahulu.");
      return;
    }
    if (!komentar.trim()) {
      setErr("Komentar tidak boleh kosong.");
      return;
    }
    onSubmit({ rating, komentar: komentar.trim() });
    setRating(0);
    setKomentar("");
    setErr("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginTop: 14,
        paddingTop: 14,
        borderTop: "1px dashed #e5e9e2",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12.5, color: "#7a857f" }}>Rating Anda:</span>
        <StarRating value={rating} onChange={setRating} size={20} />
      </div>

      <textarea
        value={komentar}
        onChange={(e) => setKomentar(e.target.value)}
        placeholder="Tulis ulasan Anda untuk dokter ini..."
        rows={3}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #e5e9e2",
          fontSize: 13,
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />

      {err && (
        <small style={{ color: "#b91c1c", fontSize: 12 }}>{err}</small>
      )}

      <div>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          leftIcon={<FaCommentDots />}
        >
          Kirim Ulasan
        </Button>
      </div>
    </form>
  );
}

// =====================================================
// HALAMAN UTAMA
// =====================================================
export default function CustomerUlasanDokter() {
  const { t } = useLang();
  const { profile } = useAuth();

  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);

  const reviewerName = profile?.full_name || "Pengguna VetCare";

  // Tanggal hari ini (format Indonesia)
  const today = useMemo(
    () =>
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    []
  );

  const handleAddReview = (doctorId, { rating, komentar }) => {
    setDoctors((prev) =>
      prev.map((doc) => {
        if (doc.id !== doctorId) return doc;

        const newReview = {
          id: Date.now(),
          nama: reviewerName,
          rating,
          komentar,
          tanggal: today,
        };

        const reviews = [newReview, ...doc.reviews];
        const totalUlasan = doc.totalUlasan + 1;
        const recommend = rating >= 4;

        // Hitung ulang rata-rata berdasarkan ulasan yang tampil
        const avg =
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        return {
          ...doc,
          reviews,
          totalUlasan,
          avgRating: Number(avg.toFixed(1)),
          rekomendasi: recommend ? doc.rekomendasi : Math.max(0, doc.rekomendasi - 1),
        };
      })
    );
  };

  return (
    <div>
      <PageHeader
        title={t("sidebar.menu.ulasanDokter")}
        subtitle={t("sidebar.tip.ulasanDokter")}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 16,
          marginTop: 14,
        }}
      >
        {doctors.map((doc) => (
          <Card key={doc.id}>
            {/* HEADER DOKTER */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={doc.nama} size={48} rounded="full" theme="purple" />
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 14.5, display: "block" }}>{doc.nama}</b>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#7a857f",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  <FaUserMd style={{ fontSize: 11 }} />
                  <span>{doc.spesialis}</span>
                </div>
              </div>
            </div>

            {/* RINGKASAN STATISTIK */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                marginTop: 14,
                padding: "12px 0",
                borderTop: "1px solid #f0f2ee",
                borderBottom: "1px solid #f0f2ee",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    color: "#7a857f",
                  }}
                >
                  <FaStar style={{ color: "#f5b301", fontSize: 11 }} />
                  Rating Rata-rata
                </div>
                <b style={{ fontSize: 16 }}>{doc.avgRating} / 5</b>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "#7a857f" }}>
                  Total Ulasan
                </div>
                <b style={{ fontSize: 16 }}>{doc.totalUlasan}</b>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    color: "#7a857f",
                  }}
                >
                  <FaThumbsUp style={{ fontSize: 10 }} />
                  Rekomendasi
                </div>
                <b style={{ fontSize: 16 }}>{doc.rekomendasi}%</b>
              </div>
            </div>

            {/* DAFTAR ULASAN */}
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                maxHeight: 260,
                overflowY: "auto",
              }}
            >
              {doc.reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: "#f8faf7",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <b style={{ fontSize: 13 }}>{rev.nama}</b>
                    {rev.rating >= 5 && (
                      <Tag color="brand">
                        <FaCheckCircle
                          style={{ fontSize: 9, marginRight: 3 }}
                        />
                        Top
                      </Tag>
                    )}
                  </div>
                  <StarRating value={rev.rating} readOnly size={13} />
                  <p
                    style={{
                      fontSize: 12.5,
                      color: "#56605a",
                      lineHeight: 1.5,
                      margin: "8px 0 6px",
                    }}
                  >
                    {rev.komentar}
                  </p>
                  <small style={{ color: "#aab2ac", fontSize: 11 }}>
                    {rev.tanggal}
                  </small>
                </div>
              ))}
            </div>

            {/* FORM TAMBAH ULASAN */}
            <ReviewForm
              onSubmit={(data) => handleAddReview(doc.id, data)}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
