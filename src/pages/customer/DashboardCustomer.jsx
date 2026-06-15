import { useEffect, useMemo, useState } from "react";
import {
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaFileInvoice,
  FaCreditCard,
  FaExclamationCircle,
} from "react-icons/fa";

import { useLang } from "../../i18n/LanguageContext";
import { formatCurrency } from "../../i18n/format";
import { useAuth } from "../../context/AuthContext";
import { getPaymentsByOwner, payPayment } from "../../lib/services";

import {
  PageHeader,
  StatCard,
  Card,
  Table,
  Badge,
  Tag,
  Button,
  EmptyState,
  Modal,
} from "../../components/ui";

const STATUS_VARIANT = {
  Lunas: "success",
  Pending: "warning",
  Dibatalkan: "danger",
};

const STATUS_ICON = {
  Lunas: <FaCheckCircle />,
  Pending: <FaClock />,
  Dibatalkan: <FaTimesCircle />,
};

function formatDate(value, lang) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString(
      lang === "en" ? "en-US" : "id-ID",
      { day: "2-digit", month: "short", year: "numeric" }
    );
  } catch {
    return value;
  }
}

export default function DashboardCustomer() {
  const { t, lang } = useLang();
  const { user, profile } = useAuth();

  const [payInvoice, setPayInvoice] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  // ==========================
  // LOAD DATA
  // ==========================
  const loadPayments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const rows = await getPaymentsByOwner(user.id);
      setData(rows);
    } catch (err) {
      setError(err.message || "Gagal memuat data tagihan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const stats = useMemo(() => {
    const lunas = data.filter((d) => d.status === "Lunas");
    const pending = data.filter((d) => d.status === "Pending");
    return {
      totalTagihan: pending.reduce((a, b) => a + Number(b.total || 0), 0),
      jumlahLunas: lunas.length,
      jumlahPending: pending.length,
    };
  }, [data]);

  // ==========================
  // PAY
  // ==========================
  const handlePay = async () => {
    if (!payInvoice) return;
    setError("");
    setPaying(true);
    try {
      const updated = await payPayment(payInvoice.id);
      setData((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d))
      );
      setPayInvoice(null);
    } catch (err) {
      setError(err.message || "Gagal memproses pembayaran");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t("sidebar.menu.pembayaran")}
        subtitle={`${t("sidebar.customerRole")} • ${
          profile?.full_name || "-"
        }`}
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

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard
          icon={<FaMoneyBillWave />}
          color="warning"
          label={t("pembayaran.totalPending")}
          value={formatCurrency(stats.totalTagihan, lang)}
        />
        <StatCard
          icon={<FaCheckCircle />}
          color="success"
          label={t("pembayaran.transaksiLunas")}
          value={stats.jumlahLunas}
        />
        <StatCard
          icon={<FaClock />}
          color="info"
          label={t("pembayaran.menungguBayar")}
          value={stats.jumlahPending}
        />
      </div>

      <Card
        title={t("pembayaran.riwayat")}
        subtitle={`${t("common.showing")} ${data.length} ${t("common.data")}`}
      >
        <Table
          rowKey="id"
          data={data}
          empty={
            <EmptyState
              title={loading ? "Memuat data..." : t("common.noData")}
            />
          }
          columns={[
            {
              key: "invoice",
              header: t("table.invoice"),
              render: (r) => <Tag color="blue">{r.invoice}</Tag>,
            },
            {
              key: "hewan",
              header: t("table.hewan"),
              render: (r) => <b>{r.hewan}</b>,
            },
            {
              key: "layanan",
              header: t("table.layanan"),
              render: (r) => <Tag color="brand">{r.layanan}</Tag>,
            },
            {
              key: "tanggal",
              header: t("table.tanggal"),
              render: (r) => formatDate(r.created_at, lang),
            },
            {
              key: "total",
              header: t("table.total"),
              align: "right",
              render: (r) => (
                <b className="amount">{formatCurrency(r.total, lang)}</b>
              ),
            },
            {
              key: "status",
              header: t("table.status"),
              render: (r) => (
                <Badge
                  variant={STATUS_VARIANT[r.status]}
                  icon={STATUS_ICON[r.status]}
                >
                  {t(`status.${r.status}`)}
                </Badge>
              ),
            },
            {
              key: "act",
              header: t("common.action"),
              align: "right",
              render: (r) =>
                r.status === "Pending" ? (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<FaCreditCard />}
                    onClick={() => setPayInvoice(r)}
                  >
                    {t("sidebar.menu.pembayaran")}
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" leftIcon={<FaFileInvoice />}>
                    {t("common.invoice")}
                  </Button>
                ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!payInvoice}
        onClose={() => setPayInvoice(null)}
        title={payInvoice ? `Bayar ${payInvoice.invoice}` : ""}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayInvoice(null)}>
              Batal
            </Button>
            <Button
              variant="primary"
              leftIcon={<FaCreditCard />}
              loading={paying}
              onClick={handlePay}
            >
              Konfirmasi Bayar
            </Button>
          </>
        }
      >
        {payInvoice && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontSize: 13,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#7a857f" }}>Hewan</span>
              <b>{payInvoice.hewan}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#7a857f" }}>Layanan</span>
              <b>{payInvoice.layanan}</b>
            </div>
            <hr style={{ border: 0, borderTop: "1px dashed #e5e9e2" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#7a857f" }}>Total Bayar</span>
              <b style={{ fontSize: 16, color: "#0fa86d" }}>
                {formatCurrency(payInvoice.total, lang)}
              </b>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
