// src/pages/LoyaltyAdmin.jsx
// =====================================================================
// LOYALTY PROGRAM MANAGEMENT — ADMIN (PRD 9.7 & 10.3)
//   - Konfigurasi tier (info), katalog reward CRUD
//   - Approval penukaran poin (redemptions): setujui / tolak
// =====================================================================
import { useCallback, useEffect, useState } from "react";
import {
  FaGift, FaPlus, FaEdit, FaTrash, FaCoins, FaCheck, FaTimes, FaMedal,
} from "react-icons/fa";
import {
  PageHeader, StatCard, Card, Table, Tag, Badge, EmptyState, Button, Input,
} from "../components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent, Dialog } from "../components/shadcn";
import {
  LOYALTY_TIERS, getAllRewards, createReward, updateReward, deleteReward,
  getRedemptions, setRedemptionStatus,
} from "../lib/services";
import "./doctor/doctor.css";

const EMPTY = { name: "", description: "", points_required: "", stock: "", is_active: true };
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";
const RED_STATUS = {
  PENDING: { label: "Menunggu", variant: "warning" },
  APPROVED: { label: "Disetujui", variant: "success" },
  REJECTED: { label: "Ditolak", variant: "danger" },
};

export default function LoyaltyAdmin() {
  const [tab, setTab] = useState("rewards");
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rw, red] = await Promise.all([getAllRewards(), getRedemptions()]);
      setRewards(rw);
      setRedemptions(red);
    } catch (e) {
      console.error("Gagal memuat loyalty:", e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(EMPTY); setEdit({}); setMsg(""); };
  const openEdit = (r) => {
    setForm({
      name: r.name || "", description: r.description || "",
      points_required: r.points_required ?? "", stock: r.stock ?? "",
      is_active: r.is_active ?? true,
    });
    setEdit(r); setMsg("");
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setMsg("Nama reward wajib diisi."); return; }
    setSaving(true);
    try {
      if (edit && edit.id) await updateReward(edit.id, form);
      else await createReward(form);
      setEdit(null);
      await load();
    } catch (err) {
      setMsg("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Hapus reward "${r.name}"?`)) return;
    try {
      await deleteReward(r.id);
      setRewards((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e) {
      alert("Gagal menghapus: " + e.message);
    }
  };

  const approve = async (red, status) => {
    setBusyId(red.id);
    try {
      await setRedemptionStatus(red, status);
      setRedemptions((prev) => prev.map((x) => (x.id === red.id ? { ...x, status } : x)));
    } catch (e) {
      alert("Gagal: " + e.message);
    } finally {
      setBusyId(null);
    }
  };

  const pendingRed = redemptions.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <PageHeader
        title="Loyalty Program"
        subtitle="Kelola reward, tier, dan penukaran poin member."
        action={tab === "rewards" ? <Button variant="primary" leftIcon={<FaPlus />} onClick={openNew}>Tambah Reward</Button> : null}
      />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaGift />} color="primary" label="Total Reward" value={rewards.length} />
        <StatCard icon={<FaCoins />} color="warning" label="Penukaran Menunggu" value={pendingRed} />
        <StatCard icon={<FaMedal />} color="info" label="Tier" value={LOYALTY_TIERS.length} />
      </div>

      {/* Konfigurasi tier (info) */}
      <Card title="Konfigurasi Tier" subtitle="Ambang poin & diskon per tier" className="doc-mt">
        <div className="loy-admin-tiers">
          {LOYALTY_TIERS.map((t) => (
            <div key={t.key} className="loy-admin-tier">
              <span className="loy-admin-dot" style={{ background: t.color }} />
              <div>
                <b>{t.label}</b>
                <small>Mulai {t.min.toLocaleString("id-ID")} poin • Diskon {t.discount}%</small>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="rekam-tabs">
        <TabsList>
          <TabsTrigger value="rewards">Katalog Reward</TabsTrigger>
          <TabsTrigger value="redemptions">Penukaran{pendingRed > 0 ? ` (${pendingRed})` : ""}</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards">
          <Card title="Katalog Reward" subtitle={`${rewards.length} reward`}>
            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat...</p>
            ) : (
              <Table
                rowKey="id"
                data={rewards}
                empty={<EmptyState icon={<FaGift />} title="Belum ada reward" />}
                columns={[
                  { key: "name", header: "Reward",
                    render: (r) => <div><b>{r.name}</b>{r.description && <small style={{ display: "block", color: "#94a3b8" }}>{r.description}</small>}</div> },
                  { key: "points", header: "Poin", render: (r) => <Tag color="brand">{r.points_required} poin</Tag> },
                  { key: "stock", header: "Stok", render: (r) => r.stock },
                  { key: "status", header: "Status",
                    render: (r) => <Badge variant={r.is_active ? "success" : "danger"} dot>{r.is_active ? "Aktif" : "Nonaktif"}</Badge> },
                  { key: "act", header: "Aksi", align: "right",
                    render: (r) => (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <Button size="sm" variant="ghost" leftIcon={<FaEdit />} onClick={() => openEdit(r)}>Edit</Button>
                        <Button size="sm" variant="danger" leftIcon={<FaTrash />} onClick={() => remove(r)}>Hapus</Button>
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="redemptions">
          <Card title="Permintaan Penukaran" subtitle={`${redemptions.length} permintaan`}>
            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat...</p>
            ) : (
              <Table
                rowKey="id"
                data={redemptions}
                empty={<EmptyState icon={<FaCoins />} title="Belum ada penukaran" />}
                columns={[
                  { key: "member", header: "Member", render: (r) => <b>{r.member_name}</b> },
                  { key: "reward", header: "Reward", render: (r) => r.reward_name },
                  { key: "points", header: "Poin", render: (r) => <Tag color="brand">{r.points_used}</Tag> },
                  { key: "date", header: "Tanggal", render: (r) => fmtDate(r.created_at) },
                  { key: "status", header: "Status",
                    render: (r) => { const m = RED_STATUS[r.status] ?? RED_STATUS.PENDING; return <Badge variant={m.variant} dot>{m.label}</Badge>; } },
                  { key: "act", header: "Aksi", align: "right",
                    render: (r) => (
                      r.status === "PENDING" ? (
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <Button size="sm" variant="primary" leftIcon={<FaCheck />} loading={busyId === r.id} onClick={() => approve(r, "APPROVED")}>Setujui</Button>
                          <Button size="sm" variant="danger" leftIcon={<FaTimes />} onClick={() => approve(r, "REJECTED")}>Tolak</Button>
                        </div>
                      ) : <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!edit}
        onOpenChange={(o) => { if (!o) setEdit(null); }}
        title={edit && edit.id ? "Edit Reward" : "Tambah Reward"}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEdit(null)}>Batal</Button>
            <Button variant="primary" loading={saving} onClick={save}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </>
        }
      >
        <form onSubmit={save} style={{ display: "grid", gap: 14 }}>
          <Input label="Nama Reward" placeholder="cth: Diskon Grooming 20%"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="ui-field">
            <label className="ui-label" style={{ fontSize: 13, fontWeight: 600 }}>Deskripsi</label>
            <textarea className="dh-textarea" rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Poin Dibutuhkan" type="number" placeholder="200"
              value={form.points_required} onChange={(e) => setForm({ ...form, points_required: e.target.value })} />
            <Input label="Stok" type="number" placeholder="100"
              value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Reward aktif
          </label>
          {msg && <p style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>{msg}</p>}
        </form>
      </Dialog>
    </div>
  );
}
