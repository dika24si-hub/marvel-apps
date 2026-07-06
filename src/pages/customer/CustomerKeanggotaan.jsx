// src/pages/customer/CustomerKeanggotaan.jsx
// =====================================================================
// KEANGGOTAAN / LOYALTY (PRD 10.3 & 11.4)
// Poin & tier dihitung NYATA dari Supabase (tabel loyalty_points).
// Tier: Silver 0-499, Gold 500-1499, Platinum 1500+.
// Member bisa menukar poin dengan reward dari katalog (tabel rewards).
// =====================================================================
import { useCallback, useEffect, useState } from "react";
import {
  FaArrowUp,
  FaGift,
  FaCrown,
  FaCoins,
  FaHistory,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";
import { PageHeader, Card } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import {
  LOYALTY_TIERS,
  getLoyalty,
  getRewards,
  redeemReward,
} from "../../lib/services";
import "./customer.css";

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Tier berikutnya setelah tier sekarang (null bila sudah tertinggi).
function nextTierOf(tierKey) {
  const idx = LOYALTY_TIERS.findIndex((t) => t.key === tierKey);
  return LOYALTY_TIERS[idx + 1] ?? null;
}

export default function CustomerKeanggotaan() {
  const { user } = useAuth();
  const memberId = user?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [loyalty, setLoyalty] = useState({ total: 0, tier: LOYALTY_TIERS[0], history: [] });
  const [rewards, setRewards] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    if (!memberId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [loy, rw] = await Promise.all([getLoyalty(memberId), getRewards()]);
      setLoyalty(loy);
      setRewards(rw);
    } catch (err) {
      console.error("Gagal memuat loyalty:", err.message);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRedeem = async (reward) => {
    if (!memberId) return;
    setBusyId(reward.id);
    setMsg(null);
    try {
      const res = await redeemReward(memberId, reward);
      if (res.ok) {
        setMsg({ type: "ok", text: `Berhasil menukar "${reward.name}". Tunggu konfirmasi admin.` });
        await load();
      } else {
        setMsg({ type: "err", text: res.error });
      }
    } catch (err) {
      setMsg({ type: "err", text: err.message });
    } finally {
      setBusyId(null);
    }
  };

  const tier = loyalty.tier;
  const next = nextTierOf(tier.key);
  const progressPct = next
    ? Math.min(100, Math.round((loyalty.total / next.min) * 100))
    : 100;
  const pointsToNext = next ? Math.max(0, next.min - loyalty.total) : 0;

  if (loading) {
    return (
      <>
        <PageHeader title="Keanggotaan" subtitle="Memuat data loyalty..." />
        <Card>
          <p className="dh-empty">Memuat poin & tier...</p>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Keanggotaan"
        subtitle="Kumpulkan poin dari setiap kunjungan dan tukar dengan hadiah menarik."
      />

      {msg && (
        <div className={`loy-alert ${msg.type === "ok" ? "ok" : "err"}`}>
          {msg.text}
        </div>
      )}

      {/* Kartu poin + progres tier */}
      <div className="loy-top">
        
        {/* Holographic Credit Card Design */}
        <div className={`membership-digital-card ${tier.key}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.85 }}>
              VetCare Loyalty Card
            </span>
            <span style={{ fontSize: 20, color: tier.key === "platinum" ? "#ec4899" : "#f5b301" }}>
              <FaCrown />
            </span>
          </div>

          <div className="membership-chip" />

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "1px" }}>
              {loyalty.total.toLocaleString("id-ID")}
              <span style={{ fontSize: 13, fontWeight: 500, marginLeft: 6, opacity: 0.9 }}>Points</span>
            </span>
            <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.7)", marginTop: 2 }}>
              Masa Aktif: Setahun sejak registrasi
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
            <div>
              <span style={{ fontSize: 9.5, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", display: "block" }}>
                Cardholder Tier
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.5px" }}>
                {tier.label} Member
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 9.5, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", display: "block" }}>
                Benefit
              </span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                {tier.discount}% Diskon
              </span>
            </div>
          </div>
        </div>

        <div className="loy-progress">
          <div className="loy-progress-head" style={{ display: "flex", alignItems: "center", gap: 8, color: "#10b981", fontWeight: 700, marginBottom: 8 }}>
            <FaArrowUp />
            <span>{next ? `Menuju ${next.label}` : "Kamu di tier tertinggi 🎉"}</span>
          </div>
          {next ? (
            <>
              <p className="loy-progress-text" style={{ fontSize: 13, color: "#475569", margin: "0 0 12px" }}>
                Kurang <b>{pointsToNext.toLocaleString("id-ID")}</b> poin lagi untuk
                naik ke {next.label}.
              </p>
              
              <div className="loyalty-progress-track">
                <div className="loyalty-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              
              <div className="loy-bar-scale" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                <span>{tier.min.toLocaleString("id-ID")} pts</span>
                <span>{next.min.toLocaleString("id-ID")} pts</span>
              </div>
            </>
          ) : (
            <p className="loy-progress-text" style={{ fontSize: 13, color: "#475569", margin: 0 }}>
              Nikmati semua keuntungan member tertinggi VetCare. Diskon 10% di setiap pemeriksaan hewan.
            </p>
          )}
        </div>
      </div>

      {/* Daftar tier */}
      <div className="loy-tiers">
        {LOYALTY_TIERS.map((t) => {
          const isCurrent = t.key === tier.key;
          const reached = loyalty.total >= t.min;
          return (
            <div
              key={t.key}
              className={`loy-tier ${isCurrent ? "current" : ""}`}
              style={isCurrent ? { borderColor: t.color } : undefined}
            >
              <div className="loy-tier-head">
                <span className="loy-tier-dot" style={{ background: t.color }} />
                <span className="loy-tier-name">{t.label}</span>
                {isCurrent && <span className="loy-tier-badge">Tier kamu</span>}
              </div>
              <div className="loy-tier-min">
                {reached ? <FaCheckCircle /> : <FaLock />}
                Mulai {t.min.toLocaleString("id-ID")} poin
              </div>
              <div className="loy-tier-benefit">Diskon layanan {t.discount}%</div>
            </div>
          );
        })}
      </div>

      {/* Katalog reward */}
      <Card>
        <div className="loy-section-head">
          <FaGift /> <h3>Tukar Poin</h3>
        </div>
        {rewards.length === 0 ? (
          <p className="dh-empty">Belum ada hadiah tersedia.</p>
        ) : (
          <div className="loy-rewards">
            {rewards.map((r) => {
              const canRedeem = loyalty.total >= r.points_required && r.stock > 0;
              return (
                <div key={r.id} className="loy-reward">
                  <div className="loy-reward-ic">
                    <FaGift />
                  </div>
                  <div className="loy-reward-body">
                    <div className="loy-reward-name">{r.name}</div>
                    <div className="loy-reward-desc">{r.description}</div>
                    <div className="loy-reward-meta">
                      <span className="loy-reward-points">
                        <FaCoins /> {r.points_required.toLocaleString("id-ID")} poin
                      </span>
                      <span className="loy-reward-stock">Stok: {r.stock}</span>
                    </div>
                  </div>
                  <button
                    className="loy-reward-btn"
                    disabled={!canRedeem || busyId === r.id}
                    onClick={() => handleRedeem(r)}
                  >
                    {busyId === r.id
                      ? "Memproses..."
                      : canRedeem
                      ? "Tukar"
                      : r.stock <= 0
                      ? "Habis"
                      : "Poin kurang"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Riwayat poin */}
      <Card>
        <div className="loy-section-head">
          <FaHistory /> <h3>Riwayat Poin</h3>
        </div>
        {loyalty.history.length === 0 ? (
          <p className="dh-empty">Belum ada aktivitas poin. Selesaikan kunjungan untuk mulai mengumpulkan poin.</p>
        ) : (
          <div className="loy-history">
            {loyalty.history.map((h) => (
              <div key={h.id} className="loy-history-row">
                <div className="loy-history-info">
                  <div className="loy-history-source">{h.source || (h.type === "EARN" ? "Poin masuk" : "Penukaran")}</div>
                  <div className="loy-history-date">{fmtDate(h.created_at)}</div>
                </div>
                <div className={`loy-history-points ${h.type === "EARN" ? "earn" : "redeem"}`}>
                  {h.type === "EARN" ? "+" : "-"}
                  {(h.points || 0).toLocaleString("id-ID")}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
