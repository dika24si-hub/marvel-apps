// src/pages/Kampanye.jsx
// =====================================================================
// KAMPANYE & CRM AUTOMATION — ADMIN (PRD 9.8)
//   - Email/blast campaign per segmen (buat, kirim simulasi, riwayat)
//   - Manajemen voucher/promo code
// =====================================================================
import { useCallback, useEffect, useState } from "react";
import {
  FaBullhorn, FaPlus, FaPaperPlane, FaTrash, FaTicketAlt, FaUsers, FaCheckCircle,
} from "react-icons/fa";
import {
  PageHeader, StatCard, Card, Table, Tag, Badge, EmptyState, Button, Input,
} from "../components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent, Dialog } from "../components/shadcn";
import {
  getCampaigns, createCampaign, sendCampaign, deleteCampaign,
  getVouchers, createVoucher, deleteVoucher,
} from "../lib/services";
import "./doctor/doctor.css";

const SEGMENTS = ["Semua Member", "Champions", "Loyal Customers", "At-Risk", "New Member", "Prospect"];
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

const EMPTY_C = { name: "", target_segment: "Semua Member", message_template: "", total_recipients: "" };
const EMPTY_V = { code: "", discount_type: "percent", discount_value: "", min_purchase: "", max_use: "", expires_at: "", is_active: true };

export default function Kampanye() {
  const [tab, setTab] = useState("campaigns");
  const [campaigns, setCampaigns] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showC, setShowC] = useState(false);
  const [formC, setFormC] = useState(EMPTY_C);
  const [showV, setShowV] = useState(false);
  const [formV, setFormV] = useState(EMPTY_V);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, v] = await Promise.all([getCampaigns(), getVouchers()]);
      setCampaigns(c);
      setVouchers(v);
    } catch (e) {
      console.error("Gagal memuat kampanye:", e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const saveCampaign = async (e) => {
    e.preventDefault();
    if (!formC.name.trim()) { setMsg("Nama kampanye wajib diisi."); return; }
    setSaving(true);
    try {
      await createCampaign(formC);
      setShowC(false); setFormC(EMPTY_C); setMsg("");
      await load();
    } catch (err) {
      setMsg("Gagal: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const blast = async (c) => {
    setBusyId(c.id);
    try {
      const recipients = c.total_recipients || Math.floor(Math.random() * 50) + 10;
      await sendCampaign(c.id, recipients);
      setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, sent_at: new Date().toISOString(), total_recipients: recipients } : x)));
    } catch (e) {
      alert("Gagal mengirim: " + e.message);
    } finally {
      setBusyId(null);
    }
  };

  const removeCampaign = async (c) => {
    if (!window.confirm(`Hapus kampanye "${c.name}"?`)) return;
    try { await deleteCampaign(c.id); setCampaigns((prev) => prev.filter((x) => x.id !== c.id)); }
    catch (e) { alert("Gagal: " + e.message); }
  };

  const saveVoucher = async (e) => {
    e.preventDefault();
    if (!formV.code.trim()) { setMsg("Kode voucher wajib diisi."); return; }
    setSaving(true);
    try {
      await createVoucher(formV);
      setShowV(false); setFormV(EMPTY_V); setMsg("");
      await load();
    } catch (err) {
      setMsg("Gagal: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeVoucher = async (v) => {
    if (!window.confirm(`Hapus voucher "${v.code}"?`)) return;
    try { await deleteVoucher(v.id); setVouchers((prev) => prev.filter((x) => x.id !== v.id)); }
    catch (e) { alert("Gagal: " + e.message); }
  };

  const sentCount = campaigns.filter((c) => c.sent_at).length;

  return (
    <div>
      <PageHeader
        title="Kampanye & Automation"
        subtitle="Email campaign per segmen dan manajemen voucher promo."
        action={
          tab === "campaigns"
            ? <Button variant="primary" leftIcon={<FaPlus />} onClick={() => { setFormC(EMPTY_C); setShowC(true); setMsg(""); }}>Buat Kampanye</Button>
            : <Button variant="primary" leftIcon={<FaPlus />} onClick={() => { setFormV(EMPTY_V); setShowV(true); setMsg(""); }}>Buat Voucher</Button>
        }
      />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaBullhorn />} color="primary" label="Total Kampanye" value={campaigns.length} />
        <StatCard icon={<FaCheckCircle />} color="success" label="Terkirim" value={sentCount} />
        <StatCard icon={<FaTicketAlt />} color="info" label="Voucher" value={vouchers.length} />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="rekam-tabs">
        <TabsList>
          <TabsTrigger value="campaigns">Kampanye Email</TabsTrigger>
          <TabsTrigger value="vouchers">Voucher & Promo</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card title="Riwayat Kampanye" subtitle={`${campaigns.length} kampanye`}>
            {loading ? <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat...</p> : (
              <Table
                rowKey="id"
                data={campaigns}
                empty={<EmptyState icon={<FaBullhorn />} title="Belum ada kampanye" />}
                columns={[
                  { key: "name", header: "Kampanye", render: (c) => <b>{c.name}</b> },
                  { key: "segment", header: "Target", render: (c) => <Tag color="brand">{c.target_segment || "Semua"}</Tag> },
                  { key: "recipients", header: "Penerima", render: (c) => <span><FaUsers style={{ marginRight: 4 }} />{c.total_recipients || 0}</span> },
                  { key: "status", header: "Status",
                    render: (c) => c.sent_at ? <Badge variant="success" dot>Terkirim {fmtDate(c.sent_at)}</Badge> : <Badge variant="warning" dot>Draft</Badge> },
                  { key: "act", header: "Aksi", align: "right",
                    render: (c) => (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        {!c.sent_at && <Button size="sm" variant="primary" leftIcon={<FaPaperPlane />} loading={busyId === c.id} onClick={() => blast(c)}>Kirim</Button>}
                        <Button size="sm" variant="danger" leftIcon={<FaTrash />} onClick={() => removeCampaign(c)}>Hapus</Button>
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="vouchers">
          <Card title="Daftar Voucher" subtitle={`${vouchers.length} voucher`}>
            {loading ? <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat...</p> : (
              <Table
                rowKey="id"
                data={vouchers}
                empty={<EmptyState icon={<FaTicketAlt />} title="Belum ada voucher" />}
                columns={[
                  { key: "code", header: "Kode", render: (v) => <b style={{ fontFamily: "monospace" }}>{v.code}</b> },
                  { key: "disc", header: "Diskon",
                    render: (v) => v.discount_type === "percent" ? `${v.discount_value}%` : `Rp${Number(v.discount_value).toLocaleString("id-ID")}` },
                  { key: "use", header: "Pemakaian", render: (v) => `${v.used_count || 0}/${v.max_use || "∞"}` },
                  { key: "exp", header: "Kedaluwarsa", render: (v) => fmtDate(v.expires_at) },
                  { key: "status", header: "Status",
                    render: (v) => <Badge variant={v.is_active ? "success" : "danger"} dot>{v.is_active ? "Aktif" : "Nonaktif"}</Badge> },
                  { key: "act", header: "Aksi", align: "right",
                    render: (v) => <Button size="sm" variant="danger" leftIcon={<FaTrash />} onClick={() => removeVoucher(v)}>Hapus</Button> },
                ]}
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog buat kampanye */}
      <Dialog open={showC} onOpenChange={setShowC} title="Buat Kampanye" size="md"
        footer={<><Button variant="ghost" onClick={() => setShowC(false)}>Batal</Button><Button variant="primary" loading={saving} onClick={saveCampaign}>Simpan</Button></>}>
        <form onSubmit={saveCampaign} style={{ display: "grid", gap: 14 }}>
          <Input label="Nama Kampanye" placeholder="cth: Promo Vaksin Juli"
            value={formC.name} onChange={(e) => setFormC({ ...formC, name: e.target.value })} required />
          <div className="ui-field">
            <label className="ui-label" style={{ fontSize: 13, fontWeight: 600 }}>Target Segmen</label>
            <select className="dh-select" value={formC.target_segment}
              onChange={(e) => setFormC({ ...formC, target_segment: e.target.value })}>
              {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="ui-field">
            <label className="ui-label" style={{ fontSize: 13, fontWeight: 600 }}>Template Pesan</label>
            <textarea className="dh-textarea" rows={3} placeholder="Halo {nama}, dapatkan promo spesial..."
              value={formC.message_template} onChange={(e) => setFormC({ ...formC, message_template: e.target.value })} />
          </div>
          {msg && <p style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>{msg}</p>}
        </form>
      </Dialog>

      {/* Dialog buat voucher */}
      <Dialog open={showV} onOpenChange={setShowV} title="Buat Voucher" size="md"
        footer={<><Button variant="ghost" onClick={() => setShowV(false)}>Batal</Button><Button variant="primary" loading={saving} onClick={saveVoucher}>Simpan</Button></>}>
        <form onSubmit={saveVoucher} style={{ display: "grid", gap: 14 }}>
          <Input label="Kode Voucher" placeholder="cth: VETCARE20"
            value={formV.code} onChange={(e) => setFormV({ ...formV, code: e.target.value })} required />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="ui-field">
              <label className="ui-label" style={{ fontSize: 13, fontWeight: 600 }}>Tipe Diskon</label>
              <select className="dh-select" value={formV.discount_type}
                onChange={(e) => setFormV({ ...formV, discount_type: e.target.value })}>
                <option value="percent">Persen (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </div>
            <Input label="Nilai Diskon" type="number" placeholder="20"
              value={formV.discount_value} onChange={(e) => setFormV({ ...formV, discount_value: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Min. Pembelian" type="number" placeholder="0"
              value={formV.min_purchase} onChange={(e) => setFormV({ ...formV, min_purchase: e.target.value })} />
            <Input label="Maks. Pemakaian" type="number" placeholder="100"
              value={formV.max_use} onChange={(e) => setFormV({ ...formV, max_use: e.target.value })} />
          </div>
          <Input label="Kedaluwarsa" type="date"
            value={formV.expires_at} onChange={(e) => setFormV({ ...formV, expires_at: e.target.value })} />
          {msg && <p style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>{msg}</p>}
        </form>
      </Dialog>
    </div>
  );
}
