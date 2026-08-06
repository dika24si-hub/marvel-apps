import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt, FaCheckCircle, FaClock, FaPaw, FaHourglassHalf,
  FaCheck, FaTimes, FaNotesMedical,
} from "react-icons/fa";

import { useLang } from "../i18n/LanguageContext";
import { usePageSearch } from "../context/SearchContext";

import {
  PageHeader, StatCard, Card, Table, Badge, Tag, EmptyState, Pagination, Button, Input,
} from "../components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent, Dialog } from "../components/shadcn";
import {
  getAllAppointments, updateAppointmentStatus, createMedicalRecord,
} from "../lib/services";
import { supabase } from "../lib/supabase";

// Map status DB -> label & varian badge
const STATUS_META = {
  PENDING:     { label: "Menunggu",    variant: "warning" },
  CONFIRMED:   { label: "Dikonfirmasi", variant: "info" },
  COMPLETED:   { label: "Selesai",     variant: "success" },
  CANCELLED:   { label: "Dibatalkan",  variant: "danger" },
  NO_SHOW:     { label: "Tidak Hadir", variant: "danger" },
};

const PER_PAGE = 6;

const EMPTY_MR = {
  diagnosis: "", examNotes: "", actions: "", weight: "", temperature: "",
  followUpDate: "", drugName: "", dosage: "", frequency: "", durationDays: "",
  billService: "", billServicePrice: "", billDrug: "", billDrugPrice: "",
};

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";
const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "";

export default function Jadwal() {
  const { t } = useLang();
  const { matches } = usePageSearch("Cari hewan, pemilik, atau keperluan...");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);

  // Dialog rekam medis
  const [mrTarget, setMrTarget] = useState(null); // appointment row
  const [mr, setMr] = useState(EMPTY_MR);
  const [savingMr, setSavingMr] = useState(false);
  const [mrMsg, setMrMsg] = useState("");

  const changeMr = (k, v) => setMr((p) => ({ ...p, [k]: v }));

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllAppointments();
      setRows(data);
    } catch (err) {
      console.error("Gagal memuat jadwal:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel("admin-jadwal-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => load())
      .subscribe();

    const handleFocus = () => load();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, []);

  const act = async (id, status) => {
    setBusyId(id);
    try {
      await updateAppointmentStatus(id, status);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      console.error(err.message);
      alert("Gagal memperbarui status: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  // Simpan rekam medis + tandai COMPLETED.
  const saveMedicalRecord = async (e) => {
    e.preventDefault();
    if (!mrTarget) return;
    setMrMsg("");
    if (!mr.diagnosis.trim()) {
      setMrMsg("Diagnosis wajib diisi.");
      return;
    }
    setSavingMr(true);
    try {
      await createMedicalRecord({
        appointmentId: mrTarget.id,
        animalId: mrTarget.animal_id,
        weight: mr.weight,
        temperature: mr.temperature,
        examNotes: mr.examNotes,
        diagnosis: mr.diagnosis,
        actions: mr.actions,
        followUpDate: mr.followUpDate,
        drugName: mr.drugName,
        dosage: mr.dosage,
        frequency: mr.frequency,
        durationDays: mr.durationDays,
        invoiceItems: [
          { name: mr.billService || "Pemeriksaan", qty: 1, price: mr.billServicePrice },
          { name: mr.billDrug, qty: 1, price: mr.billDrugPrice },
        ],
      });
      // update lokal: appointment jadi COMPLETED
      setRows((prev) =>
        prev.map((r) => (r.id === mrTarget.id ? { ...r, status: "COMPLETED" } : r))
      );
      setMrTarget(null);
      setMr(EMPTY_MR);
    } catch (err) {
      setMrMsg("Gagal menyimpan: " + err.message);
    } finally {
      setSavingMr(false);
    }
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchKey = matches(r.pet_name, r.doctor_name, r.complaint);
      const matchFilter = filter === "Semua" || r.status === filter;
      return matchKey && matchFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, filter, rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(
    () => ({
      total: rows.length,
      pending: rows.filter((r) => r.status === "PENDING").length,
      confirmed: rows.filter((r) => r.status === "CONFIRMED").length,
      completed: rows.filter((r) => r.status === "COMPLETED").length,
    }),
    [rows]
  );

  const filterKeys = ["Semua", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

  return (
    <div>
      <PageHeader
        title="Jadwal Periksa"
        subtitle="Kelola & konfirmasi janji temu pasien."
      />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaCalendarAlt />}   color="primary" label="Total Jadwal"  value={stats.total} />
        <StatCard icon={<FaHourglassHalf />} color="warning" label="Menunggu"      value={stats.pending} />
        <StatCard icon={<FaClock />}         color="info"    label="Dikonfirmasi"  value={stats.confirmed} />
        <StatCard icon={<FaCheckCircle />}   color="success" label="Selesai"       value={stats.completed} />
      </div>

      <Tabs
        value={filter}
        onValueChange={(k) => { setFilter(k); setPage(1); }}
        className="rekam-tabs"
      >
        <TabsList>
          {filterKeys.map((f) => (
            <TabsTrigger key={f} value={f}>
              {f === "Semua" ? "Semua" : STATUS_META[f]?.label ?? f}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filter}>
          <Card title="Daftar Janji Temu" subtitle={`Menampilkan ${filtered.length} jadwal`}>
            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat jadwal...</p>
            ) : (
              <Table
                rowKey="id"
                data={pageRows}
                empty={<EmptyState title="Belum ada jadwal" description="Janji dari pasien akan muncul di sini." />}
                columns={[
                  { key: "pet", header: "Hewan",
                    render: (r) => (
                      <div className="pet-cell">
                        <div className="pet-thumb blue"><FaPaw /></div>
                        <div>
                          <b>{r.pet_name || "-"}</b>
                          <small>{r.complaint || "Pemeriksaan"}</small>
                        </div>
                      </div>
                    ),
                  },
                  { key: "doctor_name", header: "Dokter",
                    render: (r) => r.doctor_name || "-" },
                  { key: "sched", header: "Tanggal & Jam",
                    render: (r) => (
                      <div className="date-cell">
                        <FaCalendarAlt />
                        <div>
                          <b>{fmtDate(r.scheduled_at)}</b>
                          <small>{fmtTime(r.scheduled_at)} WIB</small>
                        </div>
                      </div>
                    ),
                  },
                  { key: "complaint", header: "Keperluan",
                    render: (r) => <Tag color="brand">{r.complaint || "Pemeriksaan"}</Tag> },
                  { key: "status", header: "Status",
                    render: (r) => {
                      const m = STATUS_META[r.status] ?? { label: r.status, variant: "info" };
                      return <Badge variant={m.variant} dot>{m.label}</Badge>;
                    },
                  },
                  { key: "act", header: "Aksi", align: "right",
                    render: (r) => (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {r.status === "PENDING" && (
                          <>
                            <Button size="sm" variant="primary" leftIcon={<FaCheck />}
                              loading={busyId === r.id} onClick={() => act(r.id, "CONFIRMED")}>
                              Konfirmasi
                            </Button>
                            <Button size="sm" variant="danger" leftIcon={<FaTimes />}
                              onClick={() => act(r.id, "CANCELLED")}>
                              Tolak
                            </Button>
                          </>
                        )}
                        {r.status === "CONFIRMED" && (
                          <Button size="sm" variant="primary" leftIcon={<FaNotesMedical />}
                            onClick={() => { setMrTarget(r); setMr(EMPTY_MR); setMrMsg(""); }}>
                            Selesai & Rekam Medis
                          </Button>
                        )}
                        {(r.status === "COMPLETED" || r.status === "CANCELLED" || r.status === "NO_SHOW") && (
                          <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>
                        )}
                      </div>
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

      {/* Dialog: Buat Rekam Medis (dokter) */}
      <Dialog
        open={!!mrTarget}
        onOpenChange={(o) => { if (!o) setMrTarget(null); }}
        title={mrTarget ? `Rekam Medis — ${mrTarget.pet_name || "Hewan"}` : ""}
        description="Catat hasil pemeriksaan. Menyimpan akan menandai janji sebagai Selesai."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setMrTarget(null)}>Batal</Button>
            <Button variant="primary" loading={savingMr} onClick={saveMedicalRecord}>
              {savingMr ? "Menyimpan..." : "Simpan & Selesaikan"}
            </Button>
          </>
        }
      >
        <form onSubmit={saveMedicalRecord} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Diagnosis" placeholder="Mis. Infeksi kulit ringan"
            value={mr.diagnosis} onChange={(e) => changeMr("diagnosis", e.target.value)} required />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Input label="Berat (kg)" type="number" placeholder="4.2"
              value={mr.weight} onChange={(e) => changeMr("weight", e.target.value)} />
            <Input label="Suhu (°C)" type="number" placeholder="38.5"
              value={mr.temperature} onChange={(e) => changeMr("temperature", e.target.value)} />
            <Input label="Kontrol Berikutnya" type="date"
              value={mr.followUpDate} onChange={(e) => changeMr("followUpDate", e.target.value)} />
          </div>

          <div className="ui-field">
            <label className="ui-label" style={{ fontSize: 13, fontWeight: 600 }}>Pemeriksaan Fisik</label>
            <textarea className="dh-textarea" rows={2} placeholder="Kondisi mata, telinga, kulit..."
              value={mr.examNotes} onChange={(e) => changeMr("examNotes", e.target.value)} />
          </div>

          <div className="ui-field">
            <label className="ui-label" style={{ fontSize: 13, fontWeight: 600 }}>Tindakan</label>
            <textarea className="dh-textarea" rows={2} placeholder="Mis. Pemberian salep, injeksi..."
              value={mr.actions} onChange={(e) => changeMr("actions", e.target.value)} />
          </div>

          <div style={{ borderTop: "1px dashed #e5e9e2", paddingTop: 12 }}>
            <b style={{ fontSize: 13, color: "#0f172a" }}>Resep Obat (opsional)</b>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
              <Input label="Nama Obat" placeholder="Amoxicillin"
                value={mr.drugName} onChange={(e) => changeMr("drugName", e.target.value)} />
              <Input label="Dosis" placeholder="250mg"
                value={mr.dosage} onChange={(e) => changeMr("dosage", e.target.value)} />
              <Input label="Frekuensi" placeholder="2x sehari"
                value={mr.frequency} onChange={(e) => changeMr("frequency", e.target.value)} />
              <Input label="Durasi (hari)" type="number" placeholder="5"
                value={mr.durationDays} onChange={(e) => changeMr("durationDays", e.target.value)} />
            </div>
          </div>

          <div style={{ borderTop: "1px dashed #e5e9e2", paddingTop: 12 }}>
            <b style={{ fontSize: 13, color: "#0f172a" }}>Tagihan / Invoice (opsional)</b>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 10px" }}>
              Invoice dibuat otomatis. Diskon tier member diterapkan otomatis.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <Input label="Layanan" placeholder="Pemeriksaan + Konsultasi"
                value={mr.billService} onChange={(e) => changeMr("billService", e.target.value)} />
              <Input label="Biaya Layanan (Rp)" type="number" placeholder="150000"
                value={mr.billServicePrice} onChange={(e) => changeMr("billServicePrice", e.target.value)} />
              <Input label="Obat / Item Lain" placeholder="Amoxicillin"
                value={mr.billDrug} onChange={(e) => changeMr("billDrug", e.target.value)} />
              <Input label="Biaya Obat (Rp)" type="number" placeholder="50000"
                value={mr.billDrugPrice} onChange={(e) => changeMr("billDrugPrice", e.target.value)} />
            </div>
          </div>

          {mrMsg && <p style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>{mrMsg}</p>}
        </form>
      </Dialog>
    </div>
  );
}
