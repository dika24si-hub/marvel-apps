// src/pages/customer/CustomerPembayaran.jsx
// =====================================================================
// PEMBAYARAN & INVOICE (PRD 7.7)
//   - Riwayat transaksi/tagihan dari Supabase (tabel invoices + items)
//   - Tagihan aktif (PENDING) bisa dibayar -> status PAID
//   - Saat dibayar: poin loyalty masuk + notifikasi (via service)
// =====================================================================
import { useCallback, useEffect, useState } from "react";
import {
  FaWallet, FaCheckCircle, FaRegClock, FaFileInvoiceDollar, FaTimes,
} from "react-icons/fa";
import { PageHeader, StatCard, Card, EmptyState } from "../../components/ui";
import { Tabs, TabsList, TabsTrigger } from "../../components/shadcn";
import { Dialog } from "../../components/shadcn";
import { useAuth } from "../../context/AuthContext";
import { getInvoicesByOwner, payInvoice } from "../../lib/services";
import "./customer.css";

const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const STATUS = {
  PAID:    { cls: "vac-lengkap", text: "Lunas" },
  PENDING: { cls: "vac-parsial", text: "Belum Bayar" },
  CANCELLED: { cls: "vac-belum", text: "Dibatalkan" },
};

const METHODS = ["QRIS", "Transfer Bank", "Kartu Kredit/Debit"];

export default function CustomerPembayaran() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Dialog pembayaran
  const [payTarget, setPayTarget] = useState(null);
  const [method, setMethod] = useState(METHODS[0]);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getInvoicesByOwner(user.id);
      setInvoices(data);
    } catch (err) {
      console.error("Gagal memuat invoice:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const pendingTotal = invoices
    .filter((i) => i.status === "PENDING")
    .reduce((s, i) => s + (i.total || 0), 0);
  const paidCount = invoices.filter((i) => i.status === "PAID").length;
  const pendingCount = invoices.filter((i) => i.status === "PENDING").length;

  const filtered = invoices.filter((i) => {
    if (filter === "all") return true;
    if (filter === "pending") return i.status === "PENDING";
    if (filter === "paid") return i.status === "PAID";
    return true;
  });

  const handlePay = async () => {
    if (!payTarget) return;
    setPaying(true);
    try {
      await payInvoice(payTarget.id, method);
      setPayTarget(null);
      await load();
    } catch (err) {
      console.error("Gagal membayar:", err.message);
    } finally {
      setPaying(false);
    }
  };

  const invLabel = (i) => `INV-${i.id.slice(0, 8).toUpperCase()}`;

  return (
    <>
      <PageHeader title="Pembayaran" subtitle="Riwayat & status tagihan hewan peliharaanmu." />

      <div className="cust-grid-stats">
        <StatCard icon={<FaWallet />} color="warning" label="Total Belum Bayar" value={rupiah(pendingTotal)} />
        <StatCard icon={<FaCheckCircle />} color="success" label="Transaksi Lunas" value={paidCount} />
        <StatCard icon={<FaRegClock />} color="info" label="Menunggu Pembayaran" value={pendingCount} />
      </div>

      <div style={{ marginTop: 16 }}>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="pending">Belum Bayar{pendingCount > 0 ? ` (${pendingCount})` : ""}</TabsTrigger>
            <TabsTrigger value="paid">Lunas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div style={{ marginTop: 12 }}>
        <Card title="Riwayat Transaksi" subtitle={`Menampilkan ${filtered.length} data`}>
          {loading ? (
            <p className="dh-empty">Memuat tagihan...</p>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<FaFileInvoiceDollar />} title="Tidak ada tagihan" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((inv) => {
                const s = STATUS[inv.status] ?? STATUS.PENDING;
                const itemNames = (inv.invoice_items || []).map((it) => it.item_name).filter(Boolean).join(", ");
                return (
                  <div key={inv.id} className="appt-item">
                    <div className="appt-left">
                      <span className="appt-ic"><FaFileInvoiceDollar /></span>
                      <div>
                        <p className="appt-title">{invLabel(inv)}</p>
                        <p className="appt-sub">
                          {itemNames || "Layanan klinik"} • {fmtDate(inv.created_at)}
                        </p>
                        {inv.status === "PAID" && inv.payment_method && (
                          <p className="appt-sub">Dibayar via {inv.payment_method}</p>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="appt-title">{rupiah(inv.total)}</p>
                      <span className={`pet-vac ${s.cls}`}>{s.text}</span>
                      {inv.status === "PENDING" && (
                        <button
                          className="pay-btn"
                          onClick={() => { setPayTarget(inv); setMethod(METHODS[0]); }}
                        >
                          Bayar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Dialog pembayaran */}
      <Dialog
        open={!!payTarget}
        onOpenChange={(o) => { if (!o) setPayTarget(null); }}
        title="Pembayaran Tagihan"
      >
        {payTarget && (
          <div className="pay-dialog">
            <div className="pay-summary">
              <span>Total Tagihan</span>
              <b>{rupiah(payTarget.total)}</b>
            </div>

            {payTarget.invoice_items && payTarget.invoice_items.length > 0 && (
              <ul className="pay-items">
                {payTarget.invoice_items.map((it) => (
                  <li key={it.id}>
                    <span>{it.item_name} {it.qty > 1 ? `x${it.qty}` : ""}</span>
                    <span>{rupiah(it.total_price || it.unit_price)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="pay-method">
              <label>Metode Pembayaran</label>
              <div className="pay-method-opts">
                {METHODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`pay-method-opt ${method === m ? "active" : ""}`}
                    onClick={() => setMethod(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button className="pay-confirm" onClick={handlePay} disabled={paying}>
              {paying ? "Memproses..." : `Bayar ${rupiah(payTarget.total)}`}
            </button>
          </div>
        )}
      </Dialog>
    </>
  );
}
