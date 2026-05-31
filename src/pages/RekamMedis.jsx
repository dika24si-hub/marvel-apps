import { useMemo, useState } from "react";
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

const DATA = [
  { no: 1, kode: "RM-00421", hewan: "Milo",  jenis: "Kucing", pemilik: "Budi Santoso",  dokter: "Dr. Dika Pratama",   tanggal: "10 Mei 2026", diagnosaKey: "demamRingan",   kategori: "Konsultasi", tindakanKey: "antipiretik",     obat: "Paracetamol vet"        },
  { no: 2, kode: "RM-00422", hewan: "Rocky", jenis: "Anjing", pemilik: "Andi Wijaya",   dokter: "Dr. Felix Hartanto", tanggal: "05 Mei 2026", diagnosaKey: "patahTulang",   kategori: "Operasi",    tindakanKey: "fiksasi",         obat: "Antibiotik + analgesik" },
  { no: 3, kode: "RM-00423", hewan: "Luna",  jenis: "Kucing", pemilik: "Sari Indah",    dokter: "Dr. Kiran Nugraha",  tanggal: "01 Mei 2026", diagnosaKey: "vaksinRutin",   kategori: "Vaksin",     tindakanKey: "vaksinTricat",    obat: "Tricat vaccine"         },
  { no: 4, kode: "RM-00424", hewan: "Bruno", jenis: "Anjing", pemilik: "Rizky Pratama", dokter: "Dr. Clara Wijayanti",tanggal: "28 Apr 2026", diagnosaKey: "infeksiKulit",  kategori: "Konsultasi", tindakanKey: "salepTopikal",    obat: "Salep antijamur"        },
  { no: 5, kode: "RM-00425", hewan: "Coco",  jenis: "Kucing", pemilik: "Dewi Lestari",  dokter: "Dr. Dika Pratama",   tanggal: "02 Mei 2026", diagnosaKey: "checkupRutin",  kategori: "Konsultasi", tindakanKey: "pemeriksaanUmum", obat: "-"                       },
];

const DIAGNOSA = {
  id: { demamRingan: "Demam Ringan", patahTulang: "Patah Tulang Minor", vaksinRutin: "Vaksinasi Rutin", infeksiKulit: "Infeksi Kulit", checkupRutin: "Checkup Rutin" },
  en: { demamRingan: "Mild Fever", patahTulang: "Minor Fracture", vaksinRutin: "Routine Vaccination", infeksiKulit: "Skin Infection", checkupRutin: "Routine Checkup" },
};

const TINDAKAN = {
  id: { antipiretik: "Pemberian antipiretik", fiksasi: "Operasi fiksasi ringan", vaksinTricat: "Vaksin Tricat", salepTopikal: "Pemberian salep topikal", pemeriksaanUmum: "Pemeriksaan umum" },
  en: { antipiretik: "Antipyretic administration", fiksasi: "Minor fixation surgery", vaksinTricat: "Tricat vaccination", salepTopikal: "Topical ointment", pemeriksaanUmum: "General examination" },
};

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

const PER_PAGE = 3;

export default function RekamMedis() {
  const { t, lang } = useLang();
  const { matches } = usePageSearch(t("rekamMedis.searchPlaceholder"));
  const [filter, setFilter] = useState("Semua");
  const [page, setPage] = useState(1);

  const diagLabel = (key) => DIAGNOSA[lang]?.[key] ?? key;
  const tindakanLabel = (key) => TINDAKAN[lang]?.[key] ?? key;

  const filtered = useMemo(() => {
    return DATA.filter((d) => {
      const matchKey = matches(
        d.kode,
        d.hewan,
        d.pemilik,
        d.dokter,
        diagLabel(d.diagnosaKey)
      );
      const matchFilter = filter === "Semua" || d.kategori === filter;
      return matchKey && matchFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, filter, lang]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(
    () => ({
      total: DATA.length,
      konsultasi: DATA.filter((d) => d.kategori === "Konsultasi").length,
      vaksin: DATA.filter((d) => d.kategori === "Vaksin").length,
      operasi: DATA.filter((d) => d.kategori === "Operasi").length,
    }),
    []
  );

  return (
    <div>
      <PageHeader
        title={t("rekamMedis.title")}
        subtitle={t("rekamMedis.breadcrumb")}
        actions={
          <Button variant="primary" leftIcon={<FaPlus />}>
            {t("rekamMedis.addBtn")}
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
            <Table
              rowKey="no"
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
                  render: (r) => <b>{diagLabel(r.diagnosaKey)}</b> },
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
                      <b style={{ fontSize: 12 }}>{tindakanLabel(r.tindakanKey)}</b>
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
