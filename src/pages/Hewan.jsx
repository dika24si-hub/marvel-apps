import { useMemo, useState } from "react";
import {
  FaPlus,
  FaEye,
  FaPaw,
  FaDog,
  FaCat,
  FaHeartbeat,
  FaSyringe,
  FaStethoscope,
} from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";
import { formatDate } from "../i18n/format";
import { usePageSearch } from "../context/SearchContext";

import {
  PageHeader,
  Button,
  StatCard,
  Card,
  Table,
  Badge,
  EmptyState,
  Pagination,
} from "../components/ui";
import { Tooltip as ScTooltip, Dialog, Tabs, TabsList, TabsTrigger, TabsContent } from "../components/shadcn";

const DATA = [
  { no: 1, nama: "Milo",  jenis: "Kucing", ras: "Persia",          umur: 2, kelamin: "Jantan", pemilik: "Budi Santoso",  status: "Sehat",     terakhir: "10 Apr 2026" },
  { no: 2, nama: "Rocky", jenis: "Anjing", ras: "Golden Retriever",umur: 3, kelamin: "Jantan", pemilik: "Andi Wijaya",   status: "Perawatan", terakhir: "05 Mei 2026" },
  { no: 3, nama: "Luna",  jenis: "Kucing", ras: "Anggora",         umur: 1, kelamin: "Betina", pemilik: "Sari Indah",    status: "Vaksin",    terakhir: "01 Mei 2026" },
  { no: 4, nama: "Bruno", jenis: "Anjing", ras: "Bulldog",         umur: 4, kelamin: "Jantan", pemilik: "Rizky Pratama", status: "Sehat",     terakhir: "28 Apr 2026" },
  { no: 5, nama: "Coco",  jenis: "Kucing", ras: "Maine Coon",      umur: 2, kelamin: "Betina", pemilik: "Dewi Lestari",  status: "Perawatan", terakhir: "02 Mei 2026" },
];

const STATUS_VARIANT = {
  Sehat: "success",
  Perawatan: "warning",
  Vaksin: "info",
};

function PetIcon({ jenis }) {
  if (jenis === "Anjing") return <FaDog />;
  if (jenis === "Kucing") return <FaCat />;
  return <FaPaw />;
}

const PER_PAGE = 3;

export default function Hewan() {
  const { t, lang } = useLang();
  const { matches } = usePageSearch(t("hewan.searchPlaceholder"));
  const [filter, setFilter] = useState("Semua");
  const [page, setPage] = useState(1);

  // 🟢 Shadcn Dialog — detail hewan (dibuka dari tombol Detail)
  const [activeHewan, setActiveHewan] = useState(null);

  const formatAge = (n) =>
    lang === "en" ? `${n} year${n > 1 ? "s" : ""}` : `${n} Tahun`;

  const filtered = useMemo(() => {
    return DATA.filter((d) => {
      const matchKey = matches(d.nama, d.pemilik, d.ras);
      const matchFilter = filter === "Semua" || d.jenis === filter;
      return matchKey && matchFilter;
    });
  }, [matches, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(
    () => ({
      total: DATA.length,
      sehat: DATA.filter((d) => d.status === "Sehat").length,
      perawatan: DATA.filter((d) => d.status === "Perawatan").length,
      vaksin: DATA.filter((d) => d.status === "Vaksin").length,
    }),
    []
  );

  return (
    <div>
      {/* 🟢 Komponen #1 PageHeader  +  #2 Button */}
      <PageHeader
        title={t("hewan.title")}
        subtitle={t("hewan.breadcrumb")}
        actions={
          <Button variant="primary" leftIcon={<FaPlus />}>
            {t("hewan.addBtn")}
          </Button>
        }
      />

      {/* 🟢 Komponen #3 StatCard */}
      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaPaw />}        color="primary" label={t("hewan.totalHewan")}    value={stats.total} />
        <StatCard icon={<FaHeartbeat />}  color="success" label={t("hewan.kondisiSehat")} value={stats.sehat} />
        <StatCard icon={<FaStethoscope />}color="warning" label={t("hewan.perawatan")}    value={stats.perawatan} />
        <StatCard icon={<FaSyringe />}    color="info"    label={t("hewan.vaksinasi")}    value={stats.vaksin} />
      </div>

      {/* 🟢 Shadcn Tabs — navigasi jenis hewan */}
      <Tabs
        value={filter}
        onValueChange={(k) => {
          setFilter(k);
          setPage(1);
        }}
        className="rekam-tabs"
      >
        <TabsList>
          <TabsTrigger value="Semua">{t("common.all")}</TabsTrigger>
          <TabsTrigger value="Kucing" icon={<FaCat />}>{t("jenis.Kucing")}</TabsTrigger>
          <TabsTrigger value="Anjing" icon={<FaDog />}>{t("jenis.Anjing")}</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          <Card
            title={t("hewan.daftarHewan")}
            subtitle={`${t("common.showing")} ${filtered.length} ${t("common.data")}`}
          >
            <Table
              rowKey="no"
              data={pageRows}
              empty={
                <EmptyState
                  title={t("common.noMatch")}
                  description="Coba ubah keyword pencarian atau filter."
                />
              }
              columns={[
                { key: "no", header: t("table.no"),
                  render: (r) => <span className="muted">#{String(r.no).padStart(2, "0")}</span> },
                { key: "hewan", header: t("table.hewan"),
                  render: (r) => (
                    <div className="pet-cell">
                      <div className={`pet-thumb ${r.jenis === "Anjing" ? "orange" : "blue"}`}>
                        <PetIcon jenis={r.jenis} />
                      </div>
                      <div>
                        <b>{r.nama}</b>
                        <small>ID-HW{String(r.no).padStart(3, "0")}</small>
                      </div>
                    </div>
                  ),
                },
                { key: "jenis", header: t("table.jenisRas"),
                  render: (r) => (
                    <>
                      <b>{t(`jenis.${r.jenis}`)}</b>
                      <small className="block muted">{r.ras}</small>
                    </>
                  ),
                },
                { key: "umur", header: t("table.umur"),
                  render: (r) => formatAge(r.umur) },
                { key: "kelamin", header: t("table.kelamin"),
                  render: (r) => (
                    <Badge variant={r.kelamin === "Jantan" ? "info" : "danger"}>
                      {t(`kelamin.${r.kelamin}`)}
                    </Badge>
                  ),
                },
                { key: "pemilik", header: t("table.pemilik") },
                { key: "terakhir", header: t("table.kunjunganTerakhir"),
                  render: (r) => <span className="muted">{formatDate(r.terakhir, lang)}</span> },
                { key: "status", header: t("table.status"),
                  render: (r) => (
                    <Badge variant={STATUS_VARIANT[r.status]} dot>
                      {t(`status.${r.status}`)}
                    </Badge>
                  ),
                },
                { key: "act", header: t("table.aksi"), align: "right",
                  render: (r) => (
                    <ScTooltip content={`Lihat detail ${r.nama}`} side="left">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FaEye />}
                        onClick={() => setActiveHewan(r)}
                      >
                        {t("common.detail")}
                      </Button>
                    </ScTooltip>
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
        </TabsContent>
      </Tabs>

      {/* 🟢 Shadcn Dialog — detail hewan (dari tombol Detail) */}
      <Dialog
        open={!!activeHewan}
        onOpenChange={(o) => !o && setActiveHewan(null)}
        title={activeHewan ? `Detail ${activeHewan.nama}` : ""}
        description="Informasi lengkap data hewan."
        size="md"
        footer={
          <Button variant="primary" onClick={() => setActiveHewan(null)}>
            Tutup
          </Button>
        }
      >
        {activeHewan && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                className={`pet-thumb ${activeHewan.jenis === "Anjing" ? "orange" : "blue"}`}
                style={{ width: 52, height: 52, fontSize: 22 }}
              >
                <PetIcon jenis={activeHewan.jenis} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0e2d24" }}>
                  {activeHewan.nama}
                </h3>
                <Badge variant={STATUS_VARIANT[activeHewan.status]} dot>
                  {t(`status.${activeHewan.status}`)}
                </Badge>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px dashed #e5e9e2" }} />

            {[
              [t("table.jenisRas"), `${t(`jenis.${activeHewan.jenis}`)} • ${activeHewan.ras}`],
              [t("table.umur"), formatAge(activeHewan.umur)],
              [t("table.kelamin"), t(`kelamin.${activeHewan.kelamin}`)],
              [t("table.pemilik"), activeHewan.pemilik],
              [t("table.kunjunganTerakhir"), formatDate(activeHewan.terakhir, lang)],
              ["ID", `ID-HW${String(activeHewan.no).padStart(3, "0")}`],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}
              >
                <span style={{ color: "#7a857f" }}>{label}</span>
                <b style={{ color: "#0e2d24" }}>{value}</b>
              </div>
            ))}
          </div>
        )}
      </Dialog>
    </div>
  );
}
