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
        <div className="loy-card" style={{ "--tier": tier.color }}>
          <div className="loy-card-tier">
            <FaCrown /> {tier.label} Member
          </div>
          <div className="loy-card-points">
            <FaCoins />
            <span>{loyalty.total.toLocaleString("id-ID")}</span>
            <em>poin</em>
          </div>
          <div className="loy-card-disc">
            Diskon layanan{" "}
            <b>{tier.discount}%</b>
          </div>
        </div>

        <div className="loy-progress">
          <div className="loy-progress-head">
            <FaArrowUp />
            <span>{next ? `Menuju ${next.label}` : "Kamu di tier tertinggi 🎉"}</span>
          </div>
          {next ? (
            <>
              <p className="loy-progress-text">
                Kurang <b>{pointsToNext.toLocaleString("id-ID")}</b> poin lagi untuk
                naik ke {next.label}.
              </p>
              <div className="loy-bar">
                <div className="loy-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="loy-bar-scale">
                <span>{tier.min.toLocaleString("id-ID")}</span>
                <span>{next.min.toLocaleString("id-ID")}</span>
              </div>
            </>
          ) : (
            <p className="loy-progress-text">
              Nikmati semua keuntungan member tertinggi VetCare.
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
