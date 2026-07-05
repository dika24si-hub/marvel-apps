import { useEffect, useMemo, useState } from "react";
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
import { supabase } from "../lib/supabase";
import { getAllPatients } from "../lib/services";
import PetPhoto from "../components/customer/PetPhoto";

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

const STATUS_VARIANT = {
  Sehat: "success",
  Perawatan: "warning",
  Vaksin: "info",
};

const healthLabel = (status) => {
  if (status === "sick" || status === "recovery") return "Perawatan";
  return "Sehat";
};

const labelOf = (dict, key) => (key && dict[key]) || key || "-";

const genderVariant = (value) => {
  if (value === "Jantan") return "info";
  if (value === "Betina") return "danger";
  return "neutral";
};

const formatVisitDate = (value, lang) => {
  if (!value) return "-";

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString(lang === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return formatDate(value, lang) || "-";
};

const mapPatientRow = (animal, index) => ({
  id: animal.id,
  no: index + 1,
  nama: animal.name || "Tanpa Nama",
  jenis: animal.species || "Lainnya",
  ras: animal.breed || "-",
  umur: animal.age_text || "-",
  kelamin: animal.gender || "-",
  pemilik: animal.owner?.full_name || animal.owner?.email || "-",
  ownerJoined: animal.owner?.created_at || null,
  status: animal.vaccine_status === "lengkap" ? "Vaksin" : healthLabel(animal.health_status),
  terakhir: animal.lastVisit || null,
  telepon: animal.owner?.phone || "-",
  email: animal.owner?.email || "-",
  kunjungan: animal.visitCount || 0,
  berat: animal.weight ? `${animal.weight} kg` : "-",
  warna: animal.color || "-",
  photo: animal.foto || animal.photo_url || animal.photo || "",
});

function PetIcon({ jenis }) {
  if (jenis === "Anjing") return <FaDog />;
  if (jenis === "Kucing") return <FaCat />;
  return <FaPaw />;
}

const PER_PAGE = 3;

export default function Hewan() {
  const { t, lang } = useLang();
  const { matches } = usePageSearch(t("hewan.searchPlaceholder"));
  const [hewan, setHewan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [page, setPage] = useState(1);

  // 🟢 Shadcn Dialog — detail hewan (dibuka dari tombol Detail)
  const [activeHewan, setActiveHewan] = useState(null);

  const loadHewan = async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await getAllPatients();
      setHewan(rows.map(mapPatientRow));
    } catch (err) {
      console.error("Gagal memuat data hewan:", err.message);
      setError(err.message || "Gagal memuat data hewan dari database.");
      setHewan([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHewan();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-animals-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "animals" },
        () => loadHewan()
      )
      .subscribe();

    const handleFocus = () => loadHewan();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, []);

  const formatAge = (value) => {
    if (!value || value === "-") return "-";
    if (typeof value === "number") {
      return lang === "en" ? `${value} year${value > 1 ? "s" : ""}` : `${value} Tahun`;
    }
    return value;
  };

  const filtered = useMemo(() => {
    return hewan.filter((d) => {
      const matchKey = matches(d.nama, d.pemilik, d.ras, d.email, d.telepon);
      const matchFilter = filter === "Semua" || d.jenis === filter;
      return matchKey && matchFilter;
    });
  }, [matches, filter, hewan]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(
    () => ({
      total: hewan.length,
      sehat: hewan.filter((d) => d.status === "Sehat").length,
      perawatan: hewan.filter((d) => d.status === "Perawatan").length,
      vaksin: hewan.filter((d) => d.status === "Vaksin").length,
    }),
    [hewan]
  );

  return (
    <div>
      {/* 🟢 Komponen #1 PageHeader  +  #2 Button */}
      <PageHeader
        title={t("hewan.title")}
        subtitle={t("hewan.breadcrumb")}
        actions={
          <Button variant="primary" leftIcon={<FaPlus />} onClick={loadHewan}>
            Muat Ulang
          </Button>
        }
      />

      {error && (
        <div className="dh-alert err" style={{ marginTop: 14 }}>
          <span>{error}</span>
        </div>
      )}

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
            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat data hewan...</p>
            ) : (
              <Table
                rowKey="id"
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
                      <PetPhoto
                        photo={r.photo}
                        name={r.nama}
                        className={`pet-thumb ${r.jenis === "Anjing" ? "orange" : "blue"}`}
                      />
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
                      <b>{labelOf(t("jenis"), r.jenis)}</b>
                      <small className="block muted">{r.ras}</small>
                    </>
                  ),
                },
                { key: "umur", header: t("table.umur"),
                  render: (r) => formatAge(r.umur) },
                { key: "kelamin", header: t("table.kelamin"),
                  render: (r) => (
                    <Badge variant={genderVariant(r.kelamin)}>
                      {labelOf(t("kelamin"), r.kelamin)}
                    </Badge>
                  ),
                },
                { key: "pemilik", header: t("table.pemilik") },
                { key: "terakhir", header: t("table.kunjunganTerakhir"),
                  render: (r) => <span className="muted">{formatVisitDate(r.terakhir, lang)}</span> },
                { key: "status", header: t("table.status"),
                  render: (r) => (
                    <Badge variant={STATUS_VARIANT[r.status]} dot>
                      {labelOf(t("status"), r.status)}
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
            )}

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
              {activeHewan.photo ? (
                <PetPhoto
                  photo={activeHewan.photo}
                  name={activeHewan.nama}
                  className="pet-thumb pet-thumb-lg"
                />
              ) : (
              <div
                className={`pet-thumb ${activeHewan.jenis === "Anjing" ? "orange" : "blue"}`}
                style={{ width: 52, height: 52, fontSize: 22 }}
              >
                <PetIcon jenis={activeHewan.jenis} />
              </div>
              )}
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0e2d24" }}>
                  {activeHewan.nama}
                </h3>
                <Badge variant={STATUS_VARIANT[activeHewan.status]} dot>
                  {labelOf(t("status"), activeHewan.status)}
                </Badge>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px dashed #e5e9e2" }} />

            {[
              [t("table.jenisRas"), `${labelOf(t("jenis"), activeHewan.jenis)} - ${activeHewan.ras}`],
              [t("table.umur"), formatAge(activeHewan.umur)],
              [t("table.kelamin"), labelOf(t("kelamin"), activeHewan.kelamin)],
              [t("hewanDetail.berat"), activeHewan.berat],
              [t("hewanDetail.warna"), activeHewan.warna],
              [t("table.pemilik"), activeHewan.pemilik],
              [t("hewanDetail.telepon"), activeHewan.telepon],
              [t("hewanDetail.email"), activeHewan.email],
              ["Bergabung", formatVisitDate(activeHewan.ownerJoined, lang)],
              [t("table.kunjunganTerakhir"), formatVisitDate(activeHewan.terakhir, lang)],
              [t("common.visits"), activeHewan.kunjungan],
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
