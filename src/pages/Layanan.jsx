// src/pages/Layanan.jsx
// =====================================================================
// MANAJEMEN LAYANAN & HARGA — ADMIN (PRD 9.5)
//   - CRUD layanan: nama, kategori, harga dasar, durasi, status aktif
//   - Filter kategori, pencarian
// =====================================================================
import { useEffect, useMemo, useState } from "react";
import {
  FaConciergeBell, FaPlus, FaEdit, FaTrash, FaTags, FaClock, FaCheckCircle,
} from "react-icons/fa";
import {
  PageHeader, StatCard, Card, Table, Tag, Badge, EmptyState, Button, Input,
} from "../components/ui";
import { Dialog } from "../components/shadcn";
import { usePageSearch } from "../context/SearchContext";
import { getServices, createService, updateService, deleteService } from "../lib/services";
import { supabase } from "../lib/supabase";
import "./doctor/doctor.css";

const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

const EMPTY = { name: "", category: "", base_price: "", duration_minutes: "30", description: "", is_active: true };
const CATEGORIES = ["Medis", "Grooming", "Bedah", "Diagnostik", "Rawat Inap", "Lainnya"];

export default function Layanan() {
  const { matches } = usePageSearch("Cari layanan atau kategori...");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [edit, setEdit] = useState(null);   // service yg diedit (atau {} untuk baru)
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setServices(await getServices());
    } catch (e) {
      console.error("Gagal memuat layanan:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel("admin-services-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => load())
      .subscribe();

    const handleFocus = () => load();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, []);

  const openNew = () => { setForm(EMPTY); setEdit({}); setMsg(""); };
  const openEdit = (s) => {
    setForm({
      name: s.name || "", category: s.category || "", base_price: s.base_price ?? "",
      duration_minutes: s.duration_minutes ?? "30", description: s.description || "",
      is_active: s.is_active ?? true,
    });
    setEdit(s); setMsg("");
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setMsg("Nama layanan wajib diisi."); return; }
    setSaving(true);
    try {
      if (edit && edit.id) await updateService(edit.id, form);
      else await createService(form);
      setEdit(null);
      await load();
    } catch (err) {
      setMsg("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Hapus layanan "${s.name}"?`)) return;
    try {
      await deleteService(s.id);
      setServices((prev) => prev.filter((x) => x.id !== s.id));
    } catch (e) {
      alert("Gagal menghapus: " + e.message);
    }
  };

  const toggleActive = async (s) => {
    try {
      await updateService(s.id, { is_active: !s.is_active });
      setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, is_active: !s.is_active } : x)));
    } catch (e) {
      alert("Gagal: " + e.message);
    }
  };

  const filtered = useMemo(
    () => services.filter((s) => matches(s.name, s.category, s.description)),
    [services, matches]
  );

  const activeCount = services.filter((s) => s.is_active).length;
  const categoryCount = new Set(services.map((s) => s.category).filter(Boolean)).size;

  return (
    <div>
      <PageHeader
        title="Layanan & Harga"
        subtitle="Kelola katalog layanan klinik dan tarifnya."
        action={<Button variant="primary" leftIcon={<FaPlus />} onClick={openNew}>Tambah Layanan</Button>}
      />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaConciergeBell />} color="primary" label="Total Layanan" value={services.length} />
        <StatCard icon={<FaCheckCircle />} color="success" label="Aktif" value={activeCount} />
        <StatCard icon={<FaTags />} color="info" label="Kategori" value={categoryCount} />
      </div>

      <Card title="Daftar Layanan" subtitle={`Menampilkan ${filtered.length} layanan`} className="doc-mt">
        {loading ? (
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat layanan...</p>
        ) : (
          <Table
            rowKey="id"
            data={filtered}
            empty={<EmptyState icon={<FaConciergeBell />} title="Belum ada layanan" description="Tambah layanan baru lewat tombol di atas." />}
            columns={[
              { key: "name", header: "Layanan",
                render: (s) => (
                  <div><b>{s.name}</b>{s.description && <small style={{ display: "block", color: "#94a3b8" }}>{s.description}</small>}</div>
                ),
              },
              { key: "category", header: "Kategori",
                render: (s) => s.category ? <Tag color="brand">{s.category}</Tag> : "-" },
              { key: "price", header: "Harga Dasar", render: (s) => <b>{rupiah(s.base_price)}</b> },
              { key: "duration", header: "Durasi",
                render: (s) => <span><FaClock style={{ marginRight: 4 }} />{s.duration_minutes} mnt</span> },
              { key: "status", header: "Status",
                render: (s) => (
                  <button onClick={() => toggleActive(s)} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                    <Badge variant={s.is_active ? "success" : "danger"} dot>{s.is_active ? "Aktif" : "Nonaktif"}</Badge>
                  </button>
                ),
              },
              { key: "act", header: "Aksi", align: "right",
                render: (s) => (
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <Button size="sm" variant="ghost" leftIcon={<FaEdit />} onClick={() => openEdit(s)}>Edit</Button>
                    <Button size="sm" variant="danger" leftIcon={<FaTrash />} onClick={() => remove(s)}>Hapus</Button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Dialog
        open={!!edit}
        onOpenChange={(o) => { if (!o) setEdit(null); }}
        title={edit && edit.id ? "Edit Layanan" : "Tambah Layanan"}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEdit(null)}>Batal</Button>
            <Button variant="primary" loading={saving} onClick={save}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </>
        }
      >
        <form onSubmit={save} style={{ display: "grid", gap: 14 }}>
          <Input label="Nama Layanan" placeholder="cth: Vaksinasi Rabies"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="ui-field">
            <label className="ui-label" style={{ fontSize: 13, fontWeight: 600 }}>Kategori</label>
            <select className="dh-select" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">— Pilih kategori —</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Harga Dasar (Rp)" type="number" placeholder="150000"
              value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} />
            <Input label="Durasi (menit)" type="number" placeholder="30"
              value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
          </div>
          <div className="ui-field">
            <label className="ui-label" style={{ fontSize: 13, fontWeight: 600 }}>Deskripsi</label>
            <textarea className="dh-textarea" rows={2} placeholder="Keterangan layanan..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Layanan aktif
          </label>
          {msg && <p style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>{msg}</p>}
        </form>
      </Dialog>
    </div>
  );
}
