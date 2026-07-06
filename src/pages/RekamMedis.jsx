// src/pages/RekamMedis.jsx
// =====================================================================
// REKAM MEDIS — ADMIN (PRD 8.4 & 11.3)
//   - Menampilkan semua riwayat pemeriksaan hewan peliharaan
//   - Sync real-time dengan Supabase
// =====================================================================
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  FaPlus,
  FaNotesMedical,
  FaSyringe,
  FaStethoscope,
  FaProcedures,
  FaFilePdf,
} from "react-icons/fa";
import { useLang } from "../i18n/LanguageContext";
import { formatDate } from "../i18n/format";
import { usePageSearch } from "../context/SearchContext";
import { supabase } from "../lib/supabase";
import { getAllMedicalRecords } from "../lib/services";

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
} from "../components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/shadcn";

const KATEGORI_VARIANT = {
  Konsultasi: "info",
  Vaksin: "success",
  Operasi: "warning",
};

const KATEGORI_ICON = {
  Konsultasi: <FaStethoscope />,
  Vaksin: <FaSyringe />,
  Operasi: <FaProcedures />,
};

const PER_PAGE = 5;

// Helper untuk menebak kategori rekam medis berdasarkan diagnosis/tindakan
const determineCategory = (rec) => {
  const text = `${rec.physical_exam_notes || ""} ${rec.diagnosis || ""} ${rec.actions_taken || ""}`.toLowerCase();
  if (text.includes("operasi") || text.includes("bedah") || text.includes("jahit") || text.includes("fiksasi")) {
    return "Operasi";
  }
  if (text.includes("vaksin") || text.includes("imunisasi") || text.includes("suntik")) {
    return "Vaksin";
  }
  return "Konsultasi";
};

export default function RekamMedis() {
  const { t, lang } = useLang();
  const { matches } = usePageSearch(t("rekamMedis.searchPlaceholder"));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");
  const [page, setPage] = useState(1);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getAllMedicalRecords();
      
      // Mapping record Supabase ke format UI
      const mapped = rows.map((r, i) => {
        const category = determineCategory(r);
        const prescriptionsText = (r.prescriptions || [])
          .map((p) => `${p.drug_name} (${p.dosage || ""})`)
          .join(", ") || "-";

        return {
          id: r.id,
          no: i + 1,
          kode: `RM-${String(r.id || "").substring(0, 5).toUpperCase()}`,
          hewan: r.animal?.name || "Tanpa Nama",
          jenis: r.animal?.species || "Kucing",
          pemilik: r.animal?.owner?.full_name || r.animal?.owner?.email || "-",
          dokter: r.doctor?.full_name || r.doctor?.email || "-",
          tanggal: r.created_at,
          diagnosa: r.diagnosis || "-",
          kategori: category,
          tindakan: r.actions_taken || "-",
          obat: prescriptionsText,
        };
      });

      setRecords(mapped);
    } catch (err) {
      console.error("Gagal memuat rekam medis:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // Real-time synchronization
  useEffect(() => {
    const channel = supabase
      .channel("admin-medical-records-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "medical_records" },
        () => {
          loadRecords();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prescriptions" },
        () => {
          loadRecords();
        }
      )
      .subscribe();

    const handleFocus = () => loadRecords();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, [loadRecords]);

  const filtered = useMemo(() => {
    return records.filter((d) => {
      const matchKey = matches(
        d.kode,
        d.hewan,
        d.pemilik,
        d.dokter,
        d.diagnosa
      );
      const matchFilter = filter === "Semua" || d.kategori === filter;
      return matchKey && matchFilter;
    });
  }, [matches, filter, records]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(
    () => ({
      total: records.length,
      konsultasi: records.filter((d) => d.kategori === "Konsultasi").length,
      vaksin: records.filter((d) => d.kategori === "Vaksin").length,
      operasi: records.filter((d) => d.kategori === "Operasi").length,
    }),
    [records]
  );

  return (
    <div>
      <PageHeader
        title={t("rekamMedis.title")}
        subtitle={t("rekamMedis.breadcrumb")}
        actions={
          <Button variant="primary" leftIcon={<FaPlus />} onClick={loadRecords}>
            Muat Ulang
          </Button>
        }
      />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaNotesMedical />} color="primary" label={t("rekamMedis.totalRekam")}  value={stats.total} />
        <StatCard icon={<FaStethoscope />}  color="info"    label={t("rekamMedis.konsultasi")}  value={stats.konsultasi} />
        <StatCard icon={<FaSyringe />}      color="success" label={t("rekamMedis.vaksinasi")}   value={stats.vaksin} />
        <StatCard icon={<FaProcedures />}   color="warning" label={t("rekamMedis.operasi")}     value={stats.operasi} />
      </div>

      {/* 🟢 Shadcn Tabs — navigasi kategori rekam medis */}
      <Tabs
        value={filter}
        onValueChange={(k) => {
          setFilter(k);
          setPage(1);
        }}
        className="rekam-tabs"
        style={{ marginTop: 14 }}
      >
        <TabsList>
          <TabsTrigger value="Semua">{t("common.all")}</TabsTrigger>
          <TabsTrigger value="Konsultasi" icon={<FaStethoscope />}>
            {t("kategori.Konsultasi")}
          </TabsTrigger>
          <TabsTrigger value="Vaksin" icon={<FaSyringe />}>
            {t("kategori.Vaksin")}
          </TabsTrigger>
          <TabsTrigger value="Operasi" icon={<FaProcedures />}>
            {t("kategori.Operasi")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          <Card
            title={t("rekamMedis.riwayat")}
            subtitle={`${t("common.showing")} ${filtered.length} ${t("common.data")}`}
          >
            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat rekam medis...</p>
            ) : (
              <Table
                rowKey="id"
                data={pageRows}
                empty={<EmptyState title={t("common.noMatch")} />}
                columns={[
                  { key: "kode", header: t("table.kode"),
                    render: (r) => <Tag color="blue">{r.kode}</Tag> },
                  { key: "hewan", header: t("table.hewan"),
                    render: (r) => (
                      <>
                        <b>{r.hewan}</b>
                        <small className="block muted">{t(`jenis.${r.jenis}`)}</small>
                      </>
                    ),
                  },
                  { key: "pemilik", header: t("table.pemilik") },
                  { key: "dokter", header: t("table.dokter") },
                  { key: "tanggal", header: t("table.tanggal"),
                    render: (r) => <span className="muted">{formatDate(r.tanggal, lang)}</span> },
                  { key: "diagnosa", header: t("table.diagnosa"),
                    render: (r) => <b>{r.diagnosa}</b> },
                  { key: "kategori", header: t("table.kategori"),
                    render: (r) => (
                      <Badge variant={KATEGORI_VARIANT[r.kategori]} icon={KATEGORI_ICON[r.kategori]}>
                        {t(`kategori.${r.kategori}`)}
                      </Badge>
                    ),
                  },
                  { key: "tindakanObat", header: t("table.tindakanObat"),
                    render: (r) => (
                      <>
                        <b style={{ fontSize: 12 }}>{r.tindakan}</b>
                        <small className="block muted">{t("common.obat")}: {r.obat}</small>
                      </>
                    ),
                  },
                  { key: "act", header: t("table.berkas"), align: "right",
                    render: () => (
                      <Button variant="ghost" size="sm" leftIcon={<FaFilePdf />}>
                        {t("common.pdf")}
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
    </div>
  );
}
