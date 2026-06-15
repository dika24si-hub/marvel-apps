import { useEffect, useState } from "react";
import {
  FaPaw,
  FaDog,
  FaCheckCircle,
  FaNotesMedical,
  FaTrash,
  FaExclamationCircle,
} from "react-icons/fa";

import { useLang } from "../../i18n/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import {
  getPetsByOwner,
  createPet,
  deletePet,
} from "../../lib/services";

import {
  PageHeader,
  Card,
  Input,
  Button,
  Badge,
  Table,
  EmptyState,
  Tag,
} from "../../components/ui";

const STATUS_VARIANT = {
  Pending: "warning",
  Diterima: "info",
  Selesai: "success",
  Dibatalkan: "danger",
};

export default function CustomerDaftarHewan() {
  const { t } = useLang();
  const { user } = useAuth();

  const [form, setForm] = useState({
    nama: "",
    jenis: "Kucing",
    ras: "",
    umur: "",
    keluhan: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ==========================
  // LOAD DATA
  // ==========================
  const loadPets = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getPetsByOwner(user.id);
      setList(data);
    } catch (err) {
      setError(err.message || "Gagal memuat data hewan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ==========================
  // CREATE
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const created = await createPet({
        owner_id: user.id,
        nama: form.nama,
        jenis: form.jenis,
        ras: form.ras,
        umur: form.umur,
        keluhan: form.keluhan,
        status: "Pending",
      });

      setList((prev) => [created, ...prev]);

      setSuccess(
        `Pendaftaran "${form.nama}" berhasil dikirim. Tim klinik akan menghubungi Anda.`
      );

      setForm({
        nama: "",
        jenis: "Kucing",
        ras: "",
        umur: "",
        keluhan: "",
      });

      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Gagal mendaftarkan hewan");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================
  // DELETE
  // ==========================
  const handleDelete = async (id) => {
    setError("");
    setDeletingId(id);
    try {
      await deletePet(id);
      setList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message || "Gagal menghapus data");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title={t("sidebar.menu.daftarHewan")}
        subtitle={t("sidebar.tip.daftarHewan")}
      />

      {success && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: 10,
            background: "#dcfce7",
            color: "#15803d",
            fontSize: 13,
            margin: "14px 0",
          }}
        >
          <FaCheckCircle />
          <span>{success}</span>
        </div>
      )}

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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 16,
          marginTop: 14,
        }}
      >
        <Card
          title="Form Pendaftaran Hewan Sakit"
          subtitle="Isi data hewan peliharaan Anda yang membutuhkan perawatan."
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14,
              }}
            >
              <Input
                label="Nama Hewan"
                placeholder="Mis. Milo"
                value={form.nama}
                onChange={(e) => handleChange("nama", e.target.value)}
                leftIcon={<FaPaw />}
                required
              />

              <div className="ui-field">
                <label className="ui-label">{t("table.jenis")}</label>
                <select
                  className="ui-input"
                  value={form.jenis}
                  onChange={(e) => handleChange("jenis", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #e5e9e2",
                    fontSize: 13,
                  }}
                >
                  <option value="Kucing">{t("jenis.Kucing")}</option>
                  <option value="Anjing">{t("jenis.Anjing")}</option>
                </select>
              </div>

              <Input
                label={t("table.jenisRas")}
                placeholder="Mis. Persia"
                value={form.ras}
                onChange={(e) => handleChange("ras", e.target.value)}
                leftIcon={<FaDog />}
              />

              <Input
                label={t("table.umur")}
                placeholder="Mis. 2 tahun"
                value={form.umur}
                onChange={(e) => handleChange("umur", e.target.value)}
              />
            </div>

            <div className="ui-field">
              <label className="ui-label">Keluhan / Gejala</label>
              <textarea
                value={form.keluhan}
                onChange={(e) => handleChange("keluhan", e.target.value)}
                placeholder="Ceritakan kondisi atau gejala yang dialami hewan Anda..."
                required
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e9e2",
                  fontSize: 13,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                leftIcon={<FaNotesMedical />}
                loading={submitting}
              >
                {submitting ? "Menyimpan..." : "Daftarkan Hewan"}
              </Button>
            </div>
          </form>
        </Card>

        <Card
          title="Riwayat Pendaftaran"
          subtitle={`${list.length} ${t("common.data")}`}
        >
          <Table
            rowKey="id"
            data={list}
            empty={
              <EmptyState
                title={loading ? "Memuat data..." : "Belum ada pendaftaran"}
                description={
                  loading
                    ? "Mohon tunggu sebentar."
                    : "Hewan yang Anda daftarkan akan muncul di sini."
                }
              />
            }
            columns={[
              {
                key: "nama",
                header: t("table.hewan"),
                render: (r) => <b>{r.nama}</b>,
              },
              {
                key: "jenis",
                header: t("table.jenis"),
                render: (r) => (
                  <Tag color="brand">{t(`jenis.${r.jenis}`)}</Tag>
                ),
              },
              { key: "ras", header: t("table.jenisRas") },
              { key: "keluhan", header: "Keluhan" },
              {
                key: "status",
                header: t("table.status"),
                render: (r) => (
                  <Badge variant={STATUS_VARIANT[r.status] || "warning"}>
                    {t(`status.${r.status}`)}
                  </Badge>
                ),
              },
              {
                key: "act",
                header: t("common.action"),
                align: "right",
                render: (r) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<FaTrash />}
                    loading={deletingId === r.id}
                    onClick={() => handleDelete(r.id)}
                  >
                    Hapus
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
