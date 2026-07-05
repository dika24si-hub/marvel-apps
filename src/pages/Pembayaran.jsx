import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaFileInvoice,
  FaPrint,
} from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";
import { formatDate, formatCurrency } from "../i18n/format";
import { usePageSearch } from "../context/SearchContext";
import { getAllInvoices } from "../lib/services";

import {
  PageHeader,
  Button,
  StatCard,
  Card,
  Table,
  Badge,
  Tag,
  EmptyState,
  Pagination,
  Modal,
} from "../components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/shadcn";

const invLabel = (id) => `INV-${String(id || "").slice(0, 8).toUpperCase()}`;

const formatIsoDate = (iso, lang) => {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return formatDate(iso, lang) || "-";
  return date.toLocaleDateString(lang === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const invoiceStatus = (status) => {
  if (status === "PAID") return "Lunas";
  if (status === "FAILED" || status === "CANCELLED") return "Dibatalkan";
  return "Pending";
};

const itemSummary = (items = []) => {
  const names = items.map((it) => it.item_name).filter(Boolean);
  if (names.length === 0) return "Layanan klinik";
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
};

const mapInvoiceRow = (inv, index) => ({
  id: inv.id,
  no: index + 1,
  invoice: invLabel(inv.id),
  hewan: inv.animal?.name || inv.appointment?.pet_name || "-",
  pemilik: inv.member?.full_name || inv.member?.email || "-",
  layanan: itemSummary(inv.invoice_items),
  tanggal: inv.paid_at || inv.created_at,
  metode: inv.payment_method || (inv.status === "PAID" ? "-" : "Belum Bayar"),
  total: inv.total || 0,
  status: invoiceStatus(inv.status),
  rawStatus: inv.status,
  items: inv.invoice_items || [],
  subtotal: inv.subtotal || 0,
  diskon: inv.discount_amount || 0,
});

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

const PER_PAGE = 3;

export default function Pembayaran() {
  const { t, lang } = useLang();
  const { matches } = usePageSearch(t("pembayaran.searchPlaceholder"));
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const [activeInvoice, setActiveInvoice] = useState(null);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const rows = await getAllInvoices();
      setInvoices(rows.map(mapInvoiceRow));
    } catch (err) {
      console.error("Gagal memuat pembayaran:", err.message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filtered = useMemo(() => {
    return invoices.filter((d) => {
      const matchKey = matches(
        d.invoice,
        d.hewan,
        d.pemilik,
        d.layanan
      );
      const matchFilter = filter === "Semua" || d.status === filter;
      return matchKey && matchFilter;
    });
  }, [matches, filter, invoices]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(() => {
    const lunas = invoices.filter((d) => d.status === "Lunas");
    const pending = invoices.filter((d) => d.status === "Pending");
    return {
      totalPemasukan: lunas.reduce((a, b) => a + b.total, 0),
      totalPending: pending.reduce((a, b) => a + b.total, 0),
      jumlahLunas: lunas.length,
      jumlahPending: pending.length,
    };
  }, [invoices]);

  const filterKeys = ["Semua", "Lunas", "Pending", "Dibatalkan"];

  return (
    <div>
      <PageHeader
        title={t("pembayaran.title")}
        subtitle={t("pembayaran.breadcrumb")}
        actions={
          <Button variant="primary" leftIcon={<FaPlus />}>
            {t("pembayaran.addBtn")}
          </Button>
        }
      />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaMoneyBillWave />} color="success" label={t("pembayaran.totalPemasukan")} value={formatCurrency(stats.totalPemasukan, lang)} />
        <StatCard icon={<FaClock />}         color="warning" label={t("pembayaran.totalPending")}   value={formatCurrency(stats.totalPending, lang)} />
        <StatCard icon={<FaCheckCircle />}   color="primary" label={t("pembayaran.transaksiLunas")} value={stats.jumlahLunas} />
        <StatCard icon={<FaFileInvoice />}   color="info"    label={t("pembayaran.menungguBayar")}  value={stats.jumlahPending} />
      </div>

      {/* 🟢 Shadcn Tabs — navigasi status pembayaran */}
      <Tabs
        value={filter}
        onValueChange={(k) => {
          setFilter(k);
          setPage(1);
        }}
        className="rekam-tabs"
      >
        <TabsList>
          {filterKeys.map((f) => (
            <TabsTrigger key={f} value={f}>
              {f === "Semua" ? t("common.all") : t(`status.${f}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filter}>
          <Card
            title={t("pembayaran.riwayat")}
            subtitle={`${t("common.showing")} ${filtered.length} ${t("common.data")}`}
          >
            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat pembayaran...</p>
            ) : (
              <Table
                rowKey="id"
                data={pageRows}
                empty={<EmptyState title={t("common.noMatch")} />}
                columns={[
                  { key: "invoice", header: t("table.invoice"),
                    render: (r) => <Tag color="blue">{r.invoice}</Tag> },
                  { key: "hewan", header: t("table.hewan"),
                    render: (r) => <b>{r.hewan}</b> },
                  { key: "pemilik", header: t("table.pemilik") },
                  { key: "layanan", header: t("table.layanan"),
                    render: (r) => <Tag color="brand">{r.layanan}</Tag> },
                  { key: "tanggal", header: t("table.tanggal"),
                    render: (r) => <span className="muted">{formatIsoDate(r.tanggal, lang)}</span> },
                  { key: "metode", header: t("table.metode"),
                    render: (r) => r.metode },
                  { key: "total", header: t("table.total"), align: "right",
                    render: (r) => <b className="amount">{formatCurrency(r.total, lang)}</b> },
                  { key: "status", header: t("table.status"),
                    render: (r) => (
                      <Badge variant={STATUS_VARIANT[r.status]} icon={STATUS_ICON[r.status]}>
                        {t(`status.${r.status}`)}
                      </Badge>
                    ),
                  },
                  { key: "act", header: t("table.berkas"), align: "right",
                    render: (r) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FaFileInvoice />}
                        onClick={() => setActiveInvoice(r)}
                      >
                        {t("common.invoice")}
                      </Button>
                    ),
                  },
                ]}
              />
            )}

            {filtered.length > PER_PAGE && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Modal
        open={!!activeInvoice}
        onClose={() => setActiveInvoice(null)}
        title={activeInvoice ? `Invoice ${activeInvoice.invoice}` : ""}
        footer={
          <>
            <Button variant="ghost" onClick={() => setActiveInvoice(null)}>
              Tutup
            </Button>
            <Button variant="primary" leftIcon={<FaPrint />} onClick={() => window.print()}>
              Cetak
            </Button>
          </>
        }
      >
        {activeInvoice && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#7a857f" }}>Hewan</span>
              <b>{activeInvoice.hewan}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#7a857f" }}>Pemilik</span>
              <b>{activeInvoice.pemilik}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#7a857f" }}>Layanan</span>
              <b>{activeInvoice.layanan}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#7a857f" }}>Tanggal</span>
              <b>{formatIsoDate(activeInvoice.tanggal, lang)}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#7a857f" }}>Metode</span>
              <b>{activeInvoice.metode}</b>
            </div>
            <hr style={{ border: 0, borderTop: "1px dashed #e5e9e2" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#7a857f" }}>Total</span>
              <b style={{ fontSize: 16, color: "#0fa86d" }}>
                {formatCurrency(activeInvoice.total, lang)}
              </b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ color: "#7a857f" }}>Status</span>
              <Badge variant={STATUS_VARIANT[activeInvoice.status]}>
                {t(`status.${activeInvoice.status}`)}
              </Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
