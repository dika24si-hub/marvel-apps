import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEye,
  FaUserMd,
  FaStar,
  FaStethoscope,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

import { useLang } from "../i18n/LanguageContext";
import { usePageSearch } from "../context/SearchContext";

import {
  PageHeader,
  Button,
  StatCard,
  Card,
  Table,
  Badge,
  Avatar,
  Tag,
  EmptyState,
  Pagination,
} from "../components/ui";
import { Tooltip as ScTooltip, Tabs, TabsList, TabsTrigger, TabsContent } from "../components/shadcn";

const DATA = [
  { no: 1, nama: "Dr. Dika Pratama",     spesialisKey: "bedah",        pendidikan: "Universitas Gadjah Mada",  pengalaman: 8,  rating: 4.9, jadwalKey: "senJum",     status: "Aktif", pasien: 124 },
  { no: 2, nama: "Dr. Clara Wijayanti",  spesialisKey: "grooming",     pendidikan: "Institut Pertanian Bogor", pengalaman: 5,  rating: 4.7, jadwalKey: "senKamSab",  status: "Aktif", pasien: 86  },
  { no: 3, nama: "Dr. Felix Hartanto",   spesialisKey: "bedahTrauma",  pendidikan: "Universitas Airlangga",    pengalaman: 10, rating: 5.0, jadwalKey: "selJum",     status: "Aktif", pasien: 210 },
  { no: 4, nama: "Dr. Kiran Nugraha",    spesialisKey: "vaksin",       pendidikan: "Universitas Brawijaya",    pengalaman: 6,  rating: 4.8, jadwalKey: "rabMin",     status: "Aktif", pasien: 97  },
  { no: 5, nama: "Dr. Joseph Lim",       spesialisKey: "internal",     pendidikan: "Universitas Indonesia",    pengalaman: 12, rating: 4.9, jadwalKey: "senKam",     status: "Cuti",  pasien: 180 },
];

const SPECIALIST = {
  id: { bedah: "Bedah Hewan", grooming: "Perawatan & Grooming", bedahTrauma: "Bedah & Trauma", vaksin: "Vaksinasi & Imunologi", internal: "Internal Medicine" },
  en: { bedah: "Veterinary Surgery", grooming: "Grooming & Wellness", bedahTrauma: "Surgery & Trauma", vaksin: "Vaccination & Immunology", internal: "Internal Medicine" },
};

const SCHEDULE_LABEL = {
  id: { senJum: "Senin - Jumat", senKamSab: "Senin, Kamis, Sabtu", selJum: "Selasa - Jumat", rabMin: "Rabu - Minggu", senKam: "Senin - Kamis" },
  en: { senJum: "Mon - Fri", senKamSab: "Mon, Thu, Sat", selJum: "Tue - Fri", rabMin: "Wed - Sun", senKam: "Mon - Thu" },
};

const STATUS_VARIANT = {
  Aktif: "success",
  Cuti: "warning",
  Nonaktif: "danger",
};

const AVATAR_THEMES = ["purple", "teal", "orange", "blue", "pink"];
const PER_PAGE = 3;

export default function Dokter() {
  const { t, lang } = useLang();
  const { matches } = usePageSearch(t("dokter.searchPlaceholder"));
  const [filter, setFilter] = useState("Semua");
  const [page, setPage] = useState(1);

  const specLabel = (key) => SPECIALIST[lang]?.[key] ?? key;
  const scheduleLabel = (key) => SCHEDULE_LABEL[lang]?.[key] ?? key;
  const expLabel = (n) => (lang === "en" ? `${n} years` : `${n} Tahun`);

  const spesialisList = useMemo(() => {
    const uniq = Array.from(new Set(DATA.map((d) => d.spesialisKey)));
    return ["Semua", ...uniq];
  }, []);

  const filtered = useMemo(() => {
    return DATA.filter((d) => {
      const matchKey = matches(d.nama, specLabel(d.spesialisKey), d.pendidikan);
      const matchFilter = filter === "Semua" || d.spesialisKey === filter;
      return matchKey && matchFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, filter, lang]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(
    () => ({
      total: DATA.length,
      aktif: DATA.filter((d) => d.status === "Aktif").length,
      cuti: DATA.filter((d) => d.status === "Cuti").length,
      avgRating: (DATA.reduce((a, b) => a + b.rating, 0) / DATA.length).toFixed(1),
    }),
    []
  );

  return (
    <div className="dokter-page">
      <PageHeader
        title={t("dokter.title")}
        subtitle={t("dokter.breadcrumb")}
        actions={
          <Button variant="primary" leftIcon={<FaPlus />}>
            {t("dokter.addBtn")}
          </Button>
        }
      />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaUserMd />}      color="primary" label={t("dokter.totalDokter")}  value={stats.total} />
        <StatCard icon={<FaCheckCircle />} color="success" label={t("dokter.sedangAktif")}  value={stats.aktif} />
        <StatCard icon={<FaClock />}       color="warning" label={t("dokter.sedangCuti")}   value={stats.cuti} />
        <StatCard icon={<FaStar />}        color="info"    label={t("dokter.avgRating")}    value={stats.avgRating} />
      </div>

      {/* 🟢 Shadcn Tabs — navigasi spesialis dokter */}
      <Tabs
        value={filter}
        onValueChange={(k) => {
          setFilter(k);
          setPage(1);
        }}
        className="rekam-tabs"
      >
        <TabsList>
          {spesialisList.map((f) => (
            <TabsTrigger key={f} value={f}>
              {f === "Semua" ? t("common.all") : specLabel(f)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filter}>
          <Card
            title={t("dokter.daftarDokter")}
            subtitle={`${t("common.showing")} ${filtered.length} ${t("common.data")}`}
          >
            <Table
              rowKey="no"
              data={pageRows}
              empty={<EmptyState title={t("common.noMatch")} />}
              columns={[
                { key: "no", header: t("dokter.cols.no"),
                  render: (r) => <span className="muted">#{String(r.no).padStart(2, "0")}</span> },
                { key: "nama", header: t("dokter.cols.dokter"),
                  render: (r, i) => (
                    <div className="pet-cell">
                      <Avatar
                        name={r.nama}
                        theme={AVATAR_THEMES[i % AVATAR_THEMES.length]}
                        size={40}
                      />
                      <div>
                        <b>{r.nama}</b>
                        <small>ID-DR{String(r.no).padStart(3, "0")}</small>
                      </div>
                    </div>
                  ),
                },
                { key: "spesialis", header: t("dokter.cols.spesialis"),
                  render: (r) => (
                    <Tag color="brand" icon={<FaStethoscope />}>
                      {specLabel(r.spesialisKey)}
                    </Tag>
                  ),
                },
                { key: "pendidikan", header: t("dokter.cols.pendidikan"),
                  render: (r) => <span className="muted">{r.pendidikan}</span> },
                { key: "pengalaman", header: t("dokter.cols.pengalaman"),
                  render: (r) => expLabel(r.pengalaman) },
                { key: "rating", header: t("dokter.cols.rating"),
                  render: (r) => (
                    <Tag color="amber" icon={<FaStar />}>
                      {r.rating.toFixed(1)}
                    </Tag>
                  ),
                },
                { key: "jadwal", header: t("dokter.cols.jadwal"),
                  render: (r) => scheduleLabel(r.jadwalKey) },
                { key: "status", header: t("dokter.cols.status"),
                  render: (r) => (
                    <Badge variant={STATUS_VARIANT[r.status]} dot>
                      {t(`status.${r.status}`)}
                    </Badge>
                  ),
                },
                { key: "act", header: t("dokter.cols.aksi"), align: "right",
                  render: (r) => (
                    <ScTooltip content={`Lihat profil ${r.nama}`} side="left">
                      <Link to={`/dokter/${r.no}`}>
                        <Button variant="ghost" size="sm" leftIcon={<FaEye />}>
                          {t("common.detail")}
                        </Button>
                      </Link>
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
    </div>
  );
}
