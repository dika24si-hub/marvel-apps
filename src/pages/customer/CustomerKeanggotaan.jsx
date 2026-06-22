// src/pages/customer/CustomerKeanggotaan.jsx
import {
  FaCheckCircle,
  FaRegCircle,
  FaLock,
  FaArrowUp,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaGift,
} from "react-icons/fa";
import { PageHeader, Card } from "../../components/ui";
import { dummyMembership, dummyMemberStats } from "../../data/dummyCustomer";
import { evaluateMembership } from "../../data/membership";
import "./customer.css";

export default function CustomerKeanggotaan() {
  const { tiers, current, currentIndex, next, nextMetCount } =
    evaluateMembership(dummyMemberStats);

  return (
    <>
      <PageHeader
        title="Keanggotaan"
        subtitle="Tier membership dihitung otomatis dari aktivitasmu di VetCare."
      />

      {/* Status sekarang + progres ke tier berikutnya */}
      <div className="mbs-top">
        <div
          className="mbs-hero"
          style={{ borderColor: current?.color, background: current?.tint }}
        >
          <span className="mbs-hero-medal">{current?.medal ?? "🔓"}</span>
          <div>
            <div className="mbs-hero-label" style={{ color: current?.color }}>
              {current ? current.label : "Belum jadi member"}
            </div>
            <p className="mbs-hero-sub">
              {current
                ? "Terima kasih sudah setia bersama VetCare."
                : "Lengkapi syarat Basic untuk mengaktifkan keanggotaan."}
            </p>
          </div>
        </div>

        <div className="mbs-progress">
          <div className="mbs-progress-head">
            <FaArrowUp />
            <span>
              {next ? `Menuju ${next.label}` : "Kamu di tier tertinggi 🎉"}
            </span>
          </div>
          {next ? (
            <>
              <p className="mbs-progress-text">
                {nextMetCount} dari {next.requirements.length} syarat terpenuhi.
              </p>
              <div className="mbs-bar">
                <div
                  className="mbs-bar-fill"
                  style={{
                    width: `${Math.round(
                      (nextMetCount / next.requirements.length) * 100
                    )}%`,
                  }}
                />
              </div>
              <ul className="mbs-progress-list">
                {next.requirements.map((r) => (
                  <li key={r.key} className={r.met ? "ok" : ""}>
                    {r.met ? <FaCheckCircle /> : <FaRegCircle />}
                    <span>{r.text}</span>
                    {r.progress && <em>{r.progress}</em>}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mbs-progress-text">
              Nikmati semua keuntungan member tertinggi VetCare.
            </p>
          )}
        </div>
      </div>

      {/* Tiga tier: syarat + benefit */}
      <div className="mbs-tiers">
        {tiers.map((tier, idx) => {
          const isCurrent = idx === currentIndex;
          const isLocked = idx > currentIndex; // belum tercapai
          return (
            <div
              key={tier.key}
              className={`mbs-tier ${isCurrent ? "current" : ""} ${
                isLocked ? "locked" : ""
              }`}
              style={isCurrent ? { borderColor: tier.color } : undefined}
            >
              <div className="mbs-tier-head">
                <span className="mbs-tier-medal">{tier.medal}</span>
                <div>
                  <div className="mbs-tier-name">{tier.label}</div>
                  {tier.priceText && (
                    <div className="mbs-tier-price">{tier.priceText}</div>
                  )}
                </div>
                {isCurrent && <span className="mbs-tier-badge">Tier kamu</span>}
              </div>

              <div className="mbs-tier-section-label">Syarat</div>
              <ul className="mbs-req">
                {tier.requirements.map((r) => (
                  <li key={r.key} className={r.met ? "ok" : "no"}>
                    {r.met ? <FaCheckCircle /> : <FaRegCircle />}
                    <span>{r.text}</span>
                    {r.progress && <em>{r.progress}</em>}
                  </li>
                ))}
              </ul>

              <div className="mbs-tier-section-label">Benefit</div>
              <ul className="mbs-benefit">
                {tier.benefits.map((b) => (
                  <li key={b}>
                    {isLocked ? <FaLock /> : <FaGift />}
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Pembayaran & tagihan (ala template Flume) */}
      <div className="mbs-billing">
        <Card>
          <div className="mbs-card-head">
            <FaCreditCard /> <h3>Informasi Pembayaran</h3>
          </div>
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            <Field
              label="Nomor kartu"
              value={`${dummyMembership.payment.method} ** ${dummyMembership.payment.last4}`}
            />
            <Field label="Berlaku hingga" value={dummyMembership.payment.expiry} />
          </div>
        </Card>

        <Card>
          <div className="mbs-card-head">
            <FaFileInvoiceDollar /> <h3>Informasi Tagihan</h3>
          </div>
          <Field label="Atas nama" value={dummyMembership.billing.name} />
          <div style={{ marginTop: 12 }}>
            <Field label="Alamat" value={dummyMembership.billing.address} />
          </div>
        </Card>
      </div>
    </>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#9aa39a" }}>{label}</div>
      <div style={{ fontSize: 14, color: "#20322a", fontWeight: 600, marginTop: 2 }}>
        {value}
      </div>
    </div>
  );
}
