import { useEffect, useMemo, useState } from "react";
import {
  FaPlus, FaUserMd, FaStar, FaStethoscope, FaClock, FaCheckCircle,
  FaEnvelope, FaPhone, FaIdCard, FaLock, FaUser,
} from "react-icons/fa";

import { useLang } from "../i18n/LanguageContext";
import { usePageSearch } from "../context/SearchContext";
import { useAuth } from "../context/AuthContext";
import { getDoctors, setDoctorActive } from "../lib/services";

import {
  PageHeader, Button, StatCard, Card, Table, Badge, Avatar, Tag,
  EmptyState, Pagination, Input,
} from "../components/ui";
import { Dialog, Tabs, TabsList, TabsTrigger, TabsContent } from "../components/shadcn";

const AVATAR_THEMES = ["purple", "teal", "orange", "blue", "pink"];
const PER_PAGE = 5;

const EMPTY_FORM = {
  fullName: "", email: "", password: "", phone: "",
  specialization: "", strNumber: "", bio: "",
};

export default function Dokter() {
  const { t } = useLang();
  const { matches } = usePageSearch(t("dokter.searchPlaceholder"));
  const { createDoctor } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");
  const [page, setPage] = useState(1);

  // Dialog tambah dokter
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState({ ok: false, text: "" });

  const change = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const rows = await getDoctors();
      setDoctors(
        rows.map((d, i) => ({
          id: d.id,
          no: i + 1,
          nama: d.profile?.full_name || "(Tanpa Nama)",
          email: d.profile?.email || "-",
          phone: d.profile?.phone || "-",
          spesialis: d.specialization || "Umum",
          str: d.str_number || "-",
          rating: Number(d.rating_avg || 0),
          status: d.is_active ? "Aktif" : "Nonaktif",
        }))
      );
    } catch (err) {
      console.error("Gagal memuat dokter:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const matchKey = matches(d.nama, d.spesialis, d.email);
      const matchFilter = filter === "Semua" || d.status === filter;
      return matchKey && matchFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, filter, doctors]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(
    () => ({
      total: doctors.length,
      aktif: doctors.filter((d) => d.status === "Aktif").length,
      nonaktif: doctors.filter((d) => d.status === "Nonaktif").length,
      avgRating: doctors.length
        ? (doctors.reduce((a, b) => a + b.rating, 0) / doctors.length).toFixed(1)
        : "0.0",
    }),
    [doctors]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMsg({ ok: false, text: "" });

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!emailOk) return setFormMsg({ ok: false, text: "Format email tidak valid." });
    if (form.password.length < 6) return setFormMsg({ ok: false, text: "Password minimal 6 karakter." });

    setSaving(true);
    const res = await createDoctor({
      email: form.email.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      specialization: form.specialization.trim(),
      strNumber: form.strNumber.trim(),
      bio: form.bio.trim(),
    });
    setSaving(false);

    if (!res.success) {
      setFormMsg({ ok: false, text: res.error || "Gagal membuat akun dokter." });
      return;
    }
    setFormMsg({ ok: true, text: "Akun dokter berhasil dibuat." });
    setForm(EMPTY_FORM);
    // Refresh daftar setelah jeda singkat (menunggu trigger DB).
    setTimeout(() => {
      loadDoctors();
      setOpenAdd(false);
      setFormMsg({ ok: false, text: "" });
    }, 1200);
  };

  const toggleActive = async (row) => {
    const next = row.status !== "Aktif";
    try {
      await setDoctorActive(row.id, next);
      setDoctors((prev) =>
        prev.map((d) => (d.id === row.id ? { ...d, status: next ? "Aktif" : "Nonaktif" } : d))
      );
    } catch (err) {
      console.error(err.message);
    }
  };

  const STATUS_VARIANT = { Aktif: "success", Nonaktif: "danger" };
  const filterKeys = ["Semua", "Aktif", "Nonaktif"];

  return (
    <div className="dokter-page">
      <PageHeader
        title={t("dokter.title")}
        subtitle={t("dokter.breadcrumb")}
        actions={
          <Button variant="primary" leftIcon={<FaPlus />} onClick={() => setOpenAdd(true)}>
            {t("dokter.addBtn")}
          </Button>
        }
      />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaUserMd />}      color="primary" label={t("dokter.totalDokter")} value={stats.total} />
        <StatCard icon={<FaCheckCircle />} color="success" label={t("dokter.sedangAktif")} value={stats.aktif} />
        <StatCard icon={<FaClock />}       color="warning" label={t("dokter.sedangCuti")}  value={stats.nonaktif} />
        <StatCard icon={<FaStar />}        color="info"    label={t("dokter.avgRating")}   value={stats.avgRating} />
      </div>

      <Tabs
        value={filter}
        onValueChange={(k) => { setFilter(k); setPage(1); }}
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
            title={t("dokter.daftarDokter")}
            subtitle={`${t("common.showing")} ${filtered.length} ${t("common.data")}`}
          >
            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat data dokter...</p>
            ) : (
              <Table
                rowKey="id"
                data={pageRows}
                empty={<EmptyState title="Belum ada dokter" description="Tambahkan akun dokter pertama." />}
                columns={[
                  { key: "no", header: t("dokter.cols.no"),
                    render: (r) => <span className="muted">#{String(r.no).padStart(2, "0")}</span> },
                  { key: "nama", header: t("dokter.cols.dokter"),
                    render: (r, i) => (
                      <div className="pet-cell">
                        <Avatar name={r.nama} theme={AVATAR_THEMES[i % AVATAR_THEMES.length]} size={40} />
                        <div>
                          <b>{r.nama}</b>
                          <small>{r.email}</small>
                        </div>
                      </div>
                    ),
                  },
                  { key: "spesialis", header: t("dokter.cols.spesialis"),
                    render: (r) => <Tag color="brand" icon={<FaStethoscope />}>{r.spesialis}</Tag> },
                  { key: "str", header: "No. STR",
                    render: (r) => <span className="muted">{r.str}</span> },
                  { key: "phone", header: "Telepon",
                    render: (r) => <span className="muted">{r.phone}</span> },
                  { key: "rating", header: t("dokter.cols.rating"),
                    render: (r) => <Tag color="amber" icon={<FaStar />}>{r.rating.toFixed(1)}</Tag> },
                  { key: "status", header: t("dokter.cols.status"),
                    render: (r) => <Badge variant={STATUS_VARIANT[r.status]} dot>{t(`status.${r.status}`)}</Badge> },
                  { key: "act", header: t("dokter.cols.aksi"), align: "right",
                    render: (r) => (
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(r)}>
                        {r.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
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

      {/* Dialog: Tambah Dokter (hanya admin) */}
      <Dialog
        open={openAdd}
        onOpenChange={setOpenAdd}
        title="Tambah Akun Dokter"
        description="Admin membuat akun login untuk dokter. Dokter dapat langsung login dengan email & password ini."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenAdd(false)}>Batal</Button>
            <Button variant="primary" loading={saving} onClick={handleSubmit}>
              {saving ? "Membuat..." : "Buat Akun Dokter"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Nama Lengkap" leftIcon={<FaUser />} placeholder="drh. Sinta Maharani"
            value={form.fullName} onChange={(e) => change("fullName", e.target.value)} required />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Email" type="email" leftIcon={<FaEnvelope />} placeholder="dokter@vetcare.id"
              value={form.email} onChange={(e) => change("email", e.target.value)} required />
            <Input label="Password" type="password" leftIcon={<FaLock />} placeholder="Min. 6 karakter"
              value={form.password} onChange={(e) => change("password", e.target.value)} required />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Telepon" leftIcon={<FaPhone />} placeholder="08xxxxxxxxxx"
              value={form.phone} onChange={(e) => change("phone", e.target.value)} />
            <Input label="No. STR" leftIcon={<FaIdCard />} placeholder="STR-xxxxxx"
              value={form.strNumber} onChange={(e) => change("strNumber", e.target.value)} />
          </div>
          <Input label="Spesialisasi" leftIcon={<FaStethoscope />} placeholder="Bedah Hewan"
            value={form.specialization} onChange={(e) => change("specialization", e.target.value)} />
          <Input label="Bio Singkat" placeholder="Pengalaman & keahlian dokter"
            value={form.bio} onChange={(e) => change("bio", e.target.value)} />

          {formMsg.text && (
            <p style={{ fontSize: 13, fontWeight: 600, color: formMsg.ok ? "#15803d" : "#dc2626" }}>
              {formMsg.text}
            </p>
          )}
        </form>
      </Dialog>
    </div>
  );
}
