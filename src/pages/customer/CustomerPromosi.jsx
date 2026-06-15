import { useEffect, useState } from "react";
import {
  FaTags,
  FaPercent,
  FaSyringe,
  FaCut,
  FaStethoscope,
  FaGift,
  FaBoxOpen,
  FaIdCard,
  FaBirthdayCake,
  FaExclamationCircle,
} from "react-icons/fa";

import { useLang } from "../../i18n/LanguageContext";
import { getActivePromotions } from "../../lib/services";
import { PageHeader, Card, Button, Tag, EmptyState } from "../../components/ui";

// Mapping nama icon (dari kolom DB) → komponen react-icon
const ICONS = {
  syringe: <FaSyringe />,
  cut: <FaCut />,
  stethoscope: <FaStethoscope />,
  gift: <FaGift />,
  bundle: <FaBoxOpen />,
  member: <FaIdCard />,
  birthday: <FaBirthdayCake />,
};

// Daftar promo default (tampil bila data dari server kosong).
const FALLBACK_PROMOS = [
  {
    id: "promo-vaksin",
    title: "Promo Vaksin",
    description:
      "Diskon spesial untuk paket vaksinasi lengkap. Lindungi hewan kesayangan Anda dari penyakit.",
    badge: "25% OFF",
    icon: "syringe",
    color: "#16c784",
    valid_until: "Berlaku s/d 30 Juni 2026",
  },
  {
    id: "paket-bundling",
    title: "Paket Bundling",
    description:
      "Hemat lebih banyak dengan paket bundling pemeriksaan + grooming + vitamin dalam satu harga.",
    badge: "HEMAT",
    icon: "bundle",
    color: "#3b82f6",
    valid_until: "Kuota terbatas",
  },
  {
    id: "promo-grooming",
    title: "Promo Grooming",
    description:
      "Gratis potong kuku untuk setiap layanan grooming di akhir pekan. Hewan bersih & wangi.",
    badge: "GRATIS",
    icon: "cut",
    color: "#f59e0b",
    valid_until: "Setiap Sabtu & Minggu",
  },
  {
    id: "promo-member",
    title: "Promo Member",
    description:
      "Daftar jadi member VetCare dan nikmati potongan harga di setiap transaksi serta poin reward.",
    badge: "MEMBER",
    icon: "member",
    color: "#a855f7",
    valid_until: "Program berkelanjutan",
  },
  {
    id: "promo-ulang-tahun",
    title: "Promo Ulang Tahun Hewan",
    description:
      "Rayakan ulang tahun hewan kesayangan dengan hadiah spesial & diskon layanan di hari spesialnya.",
    badge: "SPESIAL",
    icon: "birthday",
    color: "#ec4899",
    valid_until: "Di bulan ulang tahun hewan",
  },
];

export default function CustomerPromosi() {
  const { t } = useLang();

  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getActivePromotions();
        // Bila server belum punya data promo, pakai daftar default.
        setPromos(data && data.length ? data : FALLBACK_PROMOS);
      } catch (err) {
        // Jika gagal memuat dari server, tetap tampilkan promo default.
        setPromos(FALLBACK_PROMOS);
        setError(err.message || "Gagal memuat promosi");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title={t("sidebar.menu.promosi")}
        subtitle={t("sidebar.tip.promosi")}
      />

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 10,
            background: "#fee2e2",
            color: "#b91c1c",
            fontSize: 13,
            margin: "14px 0",
          }}
        >
          <FaExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      {!loading && promos.length === 0 && (
        <div style={{ marginTop: 14 }}>
          <Card>
            <EmptyState
              title="Belum ada promosi"
              description="Promosi yang tersedia akan ditampilkan di sini."
            />
          </Card>
        </div>
      )}

      {loading && (
        <div style={{ marginTop: 14 }}>
          <Card>
            <EmptyState title="Memuat promosi..." />
          </Card>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
          marginTop: 14,
        }}
      >
        {promos.map((p) => {
          const color = p.color || "#16c784";
          return (
            <Card key={p.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${color}1a`,
                    color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {ICONS[p.icon] || <FaGift />}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <b style={{ fontSize: 14.5 }}>{p.title}</b>
                    {p.badge && (
                      <Tag color="brand">
                        <FaPercent style={{ fontSize: 9, marginRight: 3 }} />
                        {p.badge}
                      </Tag>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: 12.5,
                      color: "#7a857f",
                      lineHeight: 1.5,
                      margin: "0 0 10px",
                    }}
                  >
                    {p.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <small style={{ color: "#aab2ac", fontSize: 11 }}>
                      {p.valid_until}
                    </small>
                    <Button variant="ghost" size="sm" leftIcon={<FaTags />}>
                      {t("common.detail")}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
