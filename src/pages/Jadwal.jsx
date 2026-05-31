import { useMemo, useState } from "react";
import {
  FaPlus,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaPaw,
  FaDog,
  FaCat,
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
  { no: 1, hewan: "Milo",  jenis: "Kucing", pemilik: "Budi Santoso",  dokter: "Dr. Dika Pratama",   tanggal: "12 Mei 2026", jam: "09:00", keperluanKey: "vaksinRabies",   ruang: "R-101", status: "Terjadwal"   },
  { no: 2, hewan: "Rocky", jenis: "Anjing", pemilik: "Andi Wijaya",   dokter: "Dr. Felix Hartanto", tanggal: "12 Mei 2026", jam: "10:30", keperluanKey: "kontrolOperasi", ruang: "R-102", status: "Berlangsung" },
  { no: 3, hewan: "Luna",  jenis: "Kucing", pemilik: "Sari Indah",    dokter: "Dr. Kiran Nugraha",  tanggal: "11 Mei 2026", jam: "13:00", keperluanKey: "vaksinTricat",   ruang: "R-103", status: "Selesai"     },
  { no: 4, hewan: "Bruno", jenis: "Anjing", pemilik: "Rizky Pratama", dokter: "Dr. Clara Wijayanti",tanggal: "13 Mei 2026", jam: "08:30", keperluanKey: "grooming",       ruang: "R-105", status: "Terjadwal"   },
  { no: 5, hewan: "Coco",  jenis: "Kucing", pemilik: "Dewi Lestari",  dokter: "Dr. Dika Pratama",   tanggal: "10 Mei 2026", jam: "15:00", keperluanKey: "checkupRutin",   ruang: "R-101", status: "Dibatalkan"  },
];

const KEPERLUAN_LABEL = {
  id: { vaksinRabies: "Vaksin Rabies", kontrolOperasi: "Kontrol Pasca Operasi", vaksinTricat: "Vaksin Tricat", grooming: "Grooming", checkupRutin: "Checkup Rutin" },
  en: { vaksinRabies: "Rabies Vaccine", kontrolOperasi: "Post-Op Checkup", vaksinTricat: "Tricat Vaccine", grooming: "Grooming", checkupRutin: "Routine Checkup" },
};

const STATUS_VARIANT = {
  Terjadwal: "info",
  Berlangsung: "warning",
  Selesai: "success",
  Dibatalkan: "danger",
};

function PetIcon({ jenis }) {
  if (jenis === "Anjing") return <FaDog />;
  if (jenis === "Kucing") return <FaCat />;
  return <FaPaw />;
}

const PER_PAGE = 3;

export default function Jadwal() {
  const { t, lang } = useLang();
  const { matches } = usePageSearch(t("jadwal.searchPlaceholder"));
  const [filter, setFilter] = useState("Semua");
  const [page, setPage] = useState(1);

  const keperluanLabel = (key) => KEPERLUAN_LABEL[lang]?.[key] ?? key;

  const filtered = useMemo(() => {
    return DATA.filter((d) => {
      const matchKey = matches(
        d.hewan,
        d.pemilik,
        d.dokter,
        keperluanLabel(d.keperluanKey)
      );
      const matchFilter = filter === "Semua" || d.status === filter;
      return matchKey && matchFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, filter, lang]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(
    () => ({
      total: DATA.length,
      terjadwal: DATA.filter((d) => d.status === "Terjadwal").length,
      berlangsung: DATA.filter((d) => d.status === "Berlangsung").length,
      selesai: DATA.filter((d) => d.status === "Selesai").length,
    }),
    []
  );

  const filterKeys = ["Semua", "Terjadwal", "Berlangsung", "Selesai", "Dibatalkan"];

  return (
    <div>
      <PageHeader
        title={t("jadwal.title")}
        subtitle={t("jadwal.breadcrumb")}
        actions={
          <Button variant="primary" leftIcon={<FaPlus />}>
            {t("jadwal.addBtn")}
          </Button>
        }
      />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaCalendarAlt />} color="primary" label={t("jadwal.totalJadwal")}  value={stats.total} />
        <StatCard icon={<FaClock />}       color="info"    label={t("jadwal.terjadwal")}    value={stats.terjadwal} />
        <StatCard icon={<FaClock />}       color="warning" label={t("jadwal.berlangsung")}  value={stats.berlangsung} />
        <StatCard icon={<FaCheckCircle />} color="success" label={t("jadwal.selesai")}      value={stats.selesai} />
      </div>

      {/* 🟢 Shadcn Tabs — navigasi status jadwal */}
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
            title={t("jadwal.daftarJadwal")}
            subtitle={`${t("common.showing")} ${filtered.length} ${t("common.data")}`}
          >
            <Table
              rowKey="no"
              data={pageRows}
              empty={<EmptyState title={t("common.noMatch")} />}
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
                        <b>{r.hewan}</b>
                        <small>{t(`jenis.${r.jenis}`)}</small>
                      </div>
                    </div>
                  ),
                },
                { key: "pemilik", header: t("table.pemilik") },
                { key: "dokter", header: t("table.dokter") },
                { key: "tanggalJam", header: t("table.tanggalJam"),
                  render: (r) => (
                    <div className="date-cell">
                      <FaCalendarAlt />
                      <div>
                        <b>{formatDate(r.tanggal, lang)}</b>
                        <small>{r.jam} {t("common.tz")}</small>
                      </div>
                    </div>
                  ),
                },
                { key: "keperluan", header: t("table.keperluan"),
                  render: (r) => <Tag color="brand">{keperluanLabel(r.keperluanKey)}</Tag> },
                { key: "ruang", header: t("table.ruang"),
                  render: (r) => <Tag color="default">{r.ruang}</Tag> },
                { key: "status", header: t("table.status"),
                  render: (r) => (
                    <Badge variant={STATUS_VARIANT[r.status]} dot>
                      {t(`status.${r.status}`)}
                    </Badge>
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
