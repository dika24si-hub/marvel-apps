// src/pages/customer/CustomerPembayaran.jsx
import { FaWallet, FaCheckCircle, FaRegClock } from "react-icons/fa";
import { PageHeader, StatCard, Card, EmptyState } from "../../components/ui";
import { dummyPayments } from "../../data/dummyCustomer";
import "./customer.css";

const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const STATUS = {
  paid:    { cls: "vac-lengkap", text: "Lunas" },
  pending: { cls: "vac-parsial", text: "Pending" },
  failed:  { cls: "vac-belum",   text: "Gagal" },
};

export default function CustomerPembayaran() {
  const pending = dummyPayments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const paidCount = dummyPayments.filter((p) => p.status === "paid").length;
  const pendingCount = dummyPayments.filter((p) => p.status === "pending").length;

  return (
    <>
      <PageHeader title="Pembayaran" subtitle="Riwayat & status tagihan hewan peliharaanmu." />

      <div className="cust-grid-stats">
        <StatCard icon={<FaWallet />} color="warning" label="Total Pending" value={rupiah(pending)} />
        <StatCard icon={<FaCheckCircle />} color="success" label="Transaksi Lunas" value={paidCount} />
        <StatCard icon={<FaRegClock />} color="info" label="Menunggu Pembayaran" value={pendingCount} />
      </div>

      <div style={{ marginTop: 20 }}>
        <Card title="Riwayat Transaksi" subtitle={`Menampilkan ${dummyPayments.length} data`}>
          {dummyPayments.length === 0 ? (
            <EmptyState title="Tidak ada data" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {dummyPayments.map((p) => {
                const s = STATUS[p.status] ?? STATUS.pending;
                return (
                  <div key={p.id} className="appt-item">
                    <div className="appt-left">
                      <span className="appt-ic"><FaWallet /></span>
                      <div>
                        <p className="appt-title">{p.invoiceNo} • {p.petName}</p>
                        <p className="appt-sub">{p.service} • {p.date}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="appt-title">{rupiah(p.amount)}</p>
                      <span className={`pet-vac ${s.cls}`}>{s.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}