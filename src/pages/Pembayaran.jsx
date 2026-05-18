import { useMemo, useState } from "react";
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

import {
  PageHeader,
  Button,
  StatCard,
  FilterChips,
  Card,
  Table,
  Badge,
  Tag,
  EmptyState,
  Pagination,
  Modal,
} from "../components/ui";

const DATA = [
  { no: 1, invoice: "INV-20260510-001", hewan: "Milo",  pemilik: "Budi Santoso",  layananKey: "vaksinRabies",  tanggal: "10 Mei 2026", metodeKey: "transferBca", total: 250000,  status: "Lunas"      },
  { no: 2, invoice: "INV-20260505-002", hewan: "Rocky", pemilik: "Andi Wijaya",   layananKey: "operasiRingan", tanggal: "05 Mei 2026", metodeKey: "qris",        total: 1750000, status: "Lunas"      },
  { no: 3, invoice: "INV-20260501-003", hewan: "Luna",  pemilik: "Sari Indah",    layananKey: "vaksinTricat",  tanggal: "01 Mei 2026", metodeKey: "tunai",       total: 180000,  status: "Lunas"      },
  { no: 4, invoice: "INV-20260428-004", hewan: "Bruno", pemilik: "Rizky Pratama", layananKey: "konsulKulit",   tanggal: "28 Apr 2026", metodeKey: "belumBayar",  total: 150000,  status: "Pending"    },
  { no: 5, invoice: "INV-20260502-005", hewan: "Coco",  pemilik: "Dewi Lestari",  layananKey: "checkupRutin",  tanggal: "02 Mei 2026", metodeKey: "none",        total: 120000,  status: "Dibatalkan" },
];

const LAYANAN = {
  id: { vaksinRabies: "Vaksin Rabies", operasiRingan: "Operasi Ringan", vaksinTricat: "Vaksin Tricat", konsulKulit: "Konsultasi Kulit", checkupRutin: "Checkup Rutin" },
  en: { vaksinRabies: "Rabies Vaccine", operasiRingan: "Minor Surgery", vaksinTricat: "Tricat Vaccine", konsulKulit: "Skin Consultation", checkupRutin: "Routine Checkup" },
};

const METODE = {
  id: { transferBca: "Transfer BCA", qris: "QRIS", tunai: "Tunai", belumBayar: "Belum Bayar", none: "-" },
  en: { transferBca: "BCA Transfer", qris: "QRIS", tunai: "Cash", belumBayar: "Unpaid", none: "-" },
};

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
  const [filter, setFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const [activeInvoice, setActiveInvoice] = useState(null);

  const layananLabel = (key) => LAYANAN[lang]?.[key] ?? key;
  const metodeLabel = (key) => METODE[lang]?.[key] ?? key;

  const filtered = useMemo(() => {
    return DATA.filter((d) => {
      const matchKey = matches(
        d.invoice,
        d.hewan,
        d.pemilik,
        layananLabel(d.layananKey)
      );
      const matchFilter = filter === "Semua" || d.status === filter;
      return matchKey && matchFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, filter, lang]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(() => {
    const lunas = DATA.filter((d) => d.status === "Lunas");
    const pending = DATA.filter((d) => d.status === "Pending");
    return {
      totalPemasukan: lunas.reduce((a, b) => a + b.total, 0),
      totalPending: pending.reduce((a, b) => a + b.total, 0),
      jumlahLunas: lunas.length,
      jumlahPending: pending.length,
    };
  }, []);

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

      <div className="toolbar toolbar-filter-only" style={{ marginTop: 14 }}>
        <FilterChips
          label="Filter"
          value={filter}
          onChange={(k) => {
            setFilter(k);
            setPage(1);
          }}
          options={filterKeys.map((f) => ({
            key: f,
            label: f === "Semua" ? t("common.all") : t(`status.${f}`),
          }))}
        />
      </div>

      <Card
        title={t("pembayaran.riwayat")}
        subtitle={`${t("common.showing")} ${filtered.length} ${t("common.data")}`}
      >
        <Table
          rowKey="no"
          data={pageRows}
          empty={<EmptyState title={t("common.noMatch")} />}
          columns={[
            { key: "invoice", header: t("table.invoice"),
              render: (r) => <Tag color="blue">{r.invoice}</Tag> },
            { key: "hewan", header: t("table.hewan"),
              render: (r) => <b>{r.hewan}</b> },
            { key: "pemilik", header: t("table.pemilik") },
            { key: "layanan", header: t("table.layanan"),
              render: (r) => <Tag color="brand">{layananLabel(r.layananKey)}</Tag> },
            { key: "tanggal", header: t("table.tanggal"),
              render: (r) => <span className="muted">{formatDate(r.tanggal, lang)}</span> },
            { key: "metode", header: t("table.metode"),
              render: (r) => metodeLabel(r.metodeKey) },
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

        {filtered.length > PER_PAGE && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </Card>

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
              <b>{layananLabel(activeInvoice.layananKey)}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#7a857f" }}>Tanggal</span>
              <b>{formatDate(activeInvoice.tanggal, lang)}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#7a857f" }}>Metode</span>
              <b>{metodeLabel(activeInvoice.metodeKey)}</b>
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
