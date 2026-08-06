// src/pages/Appointment.jsx
// =====================================================================
// MANAJEMEN APPOINTMENT — ADMIN (PRD 9.4)
//   - Semua janji temu, filter multi-parameter (status), pencarian
//   - Lihat detail; konfirmasi/batalkan manual
// =====================================================================
import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt, FaHourglassHalf, FaClock, FaCheckCircle, FaPaw,
  FaCheck, FaTimes,
} from "react-icons/fa";
import {
  PageHeader, StatCard, Card, Table, Badge, Tag, EmptyState, Pagination, Button,
} from "../components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/shadcn";
import { usePageSearch } from "../context/SearchContext";
import { getAdminAppointments, updateAppointmentStatus } from "../lib/services";
import { supabase } from "../lib/supabase";

const STATUS_META = {
  PENDING:   { label: "Menunggu",    variant: "warning" },
  CONFIRMED: { label: "Dikonfirmasi", variant: "info" },
  COMPLETED: { label: "Selesai",     variant: "success" },
  CANCELLED: { label: "Dibatalkan",  variant: "danger" },
  NO_SHOW:   { label: "Tidak Hadir", variant: "danger" },
};
const PER_PAGE = 8;
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";
const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "";

export default function Appointment() {
  const { matches } = usePageSearch("Cari hewan, dokter, atau keperluan...");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await getAdminAppointments());
    } catch (e) {
      console.error("Gagal memuat appointment:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel("admin-appointments-sync")
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
    } catch (e) {
      alert("Gagal memperbarui status: " + e.message);
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => rows.filter((r) => {
    const mk = matches(r.pet_name, r.doctor_name, r.complaint);
    const mf = filter === "Semua" || r.status === filter;
    return mk && mf;
  }), [rows, matches, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(() => ({
    total: rows.length,
    pending: rows.filter((r) => r.status === "PENDING").length,
    confirmed: rows.filter((r) => r.status === "CONFIRMED").length,
    completed: rows.filter((r) => r.status === "COMPLETED").length,
  }), [rows]);

  const filterKeys = ["Semua", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

  return (
    <div>
      <PageHeader title="Manajemen Appointment" subtitle="Pantau semua janji temu klinik." />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaCalendarAlt />} color="primary" label="Total Janji" value={stats.total} />
        <StatCard icon={<FaHourglassHalf />} color="warning" label="Menunggu" value={stats.pending} />
        <StatCard icon={<FaClock />} color="info" label="Dikonfirmasi" value={stats.confirmed} />
        <StatCard icon={<FaCheckCircle />} color="success" label="Selesai" value={stats.completed} />
      </div>

      <Tabs value={filter} onValueChange={(k) => { setFilter(k); setPage(1); }} className="rekam-tabs">
        <TabsList>
          {filterKeys.map((f) => (
            <TabsTrigger key={f} value={f}>{f === "Semua" ? "Semua" : STATUS_META[f]?.label ?? f}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={filter}>
          <Card title="Daftar Janji Temu" subtitle={`Menampilkan ${filtered.length} jadwal`}>
            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat data...</p>
            ) : (
              <Table
                rowKey="id"
                data={pageRows}
                empty={<EmptyState title="Belum ada janji temu" />}
                columns={[
                  { key: "pet", header: "Hewan",
                    render: (r) => (
                      <div className="pet-cell">
                        <div className="pet-thumb blue"><FaPaw /></div>
                        <div><b>{r.pet_name || "-"}</b><small>{r.complaint || "Pemeriksaan"}</small></div>
                      </div>
                    ),
                  },
                  { key: "doctor_name", header: "Dokter", render: (r) => r.doctor_name || "-" },
                  { key: "sched", header: "Tanggal & Jam",
                    render: (r) => (
                      <div className="date-cell">
                        <FaCalendarAlt />
                        <div><b>{fmtDate(r.scheduled_at)}</b><small>{fmtTime(r.scheduled_at)} WIB</small></div>
                      </div>
                    ),
                  },
                  { key: "status", header: "Status",
                    render: (r) => {
                      const m = STATUS_META[r.status] ?? { label: r.status, variant: "info" };
                      return <Badge variant={m.variant} dot>{m.label}</Badge>;
                    },
                  },
                  { key: "act", header: "Aksi", align: "right",
                    render: (r) => (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        {r.status === "PENDING" && (
                          <>
                            <Button size="sm" variant="primary" leftIcon={<FaCheck />}
                              loading={busyId === r.id} onClick={() => act(r.id, "CONFIRMED")}>Konfirmasi</Button>
                            <Button size="sm" variant="danger" leftIcon={<FaTimes />}
                              onClick={() => act(r.id, "CANCELLED")}>Tolak</Button>
                          </>
                        )}
                        {r.status !== "PENDING" && <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>}
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
    </div>
  );
}
