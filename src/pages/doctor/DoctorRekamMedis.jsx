// src/pages/doctor/DoctorRekamMedis.jsx
// =====================================================================
// REKAM MEDIS — DOKTER (PRD 8.4)
//   - Daftar semua rekam medis yang dibuat, pencarian, filter
//   - Lihat detail lengkap (vitals, diagnosis, tindakan, resep)
// Pembuatan rekam medis baru ada di alur Jadwal (Selesai & Rekam Medis).
// =====================================================================
import { useEffect, useMemo, useState } from "react";
import {
  FaNotesMedical, FaWeight, FaThermometerHalf, FaPrescriptionBottleAlt,
  FaCalendarPlus, FaStethoscope,
} from "react-icons/fa";
import {
  PageHeader, StatCard, Card, Table, Tag, EmptyState, Pagination, Button,
} from "../../components/ui";
import { Dialog } from "../../components/shadcn";
import { usePageSearch } from "../../context/SearchContext";
import { useAuth } from "../../context/AuthContext";
import { getAllMedicalRecords } from "../../lib/services";
import { supabase } from "../../lib/supabase";
import "./doctor.css";

const PER_PAGE = 8;
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";

export default function DoctorRekamMedis() {
  const { matches } = usePageSearch("Cari diagnosis atau tindakan...");
  const { profile } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);

  const loadRecords = () => {
    if (!profile?.id) return;
    getAllMedicalRecords(profile.id)
      .then(setRecords)
      .catch((e) => console.error("Gagal memuat rekam medis:", e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!profile?.id) return;
    loadRecords();

    const channel = supabase
      .channel(`doctor-records-${profile.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "medical_records", filter: `doctor_id=eq.${profile.id}` }, () => loadRecords())
      .subscribe();

    const handleFocus = () => loadRecords();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const filtered = useMemo(
    () => records.filter((r) => matches(r.diagnosis, r.actions_taken, r.physical_exam_notes)),
    [records, matches]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const withFollowUp = records.filter((r) => r.follow_up_date).length;

  return (
    <div>
      <PageHeader title="Rekam Medis" subtitle="Arsip seluruh hasil pemeriksaan klinik." />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaNotesMedical />} color="primary" label="Total Rekam Medis" value={records.length} />
        <StatCard icon={<FaCalendarPlus />} color="warning" label="Perlu Kontrol" value={withFollowUp} />
        <StatCard icon={<FaStethoscope />} color="info" label="Hasil Pencarian" value={filtered.length} />
      </div>

      <Card title="Daftar Rekam Medis" subtitle={`Menampilkan ${filtered.length} catatan`} className="doc-mt">
        {loading ? (
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat rekam medis...</p>
        ) : (
          <Table
            rowKey="id"
            data={pageRows}
            empty={<EmptyState title="Belum ada rekam medis" description="Selesaikan pemeriksaan dari menu Jadwal." />}
            columns={[
              { key: "date", header: "Tanggal", render: (r) => fmtDate(r.created_at) },
              { key: "diagnosis", header: "Diagnosis",
                render: (r) => <b>{r.diagnosis || "Pemeriksaan"}</b> },
              { key: "actions", header: "Tindakan",
                render: (r) => r.actions_taken || "-" },
              { key: "rx", header: "Resep",
                render: (r) => <Tag color="brand">{r.prescriptions?.length || 0} obat</Tag> },
              { key: "act", header: "Aksi", align: "right",
                render: (r) => (
                  <Button size="sm" variant="primary" onClick={() => setDetail(r)}>Detail</Button>
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

      <Dialog
        open={!!detail}
        onOpenChange={(o) => { if (!o) setDetail(null); }}
        title="Detail Rekam Medis"
        size="lg"
      >
        {detail && (
          <div className="doc-rec-detail">
            <div className="doc-patient-info">
              <div>Tanggal: <b>{fmtDate(detail.created_at)}</b></div>
              {detail.weight_at_visit != null && <div><FaWeight /> {detail.weight_at_visit} kg</div>}
              {detail.temperature != null && <div><FaThermometerHalf /> {detail.temperature}°C</div>}
            </div>

            {detail.physical_exam_notes && <RecRow label="Pemeriksaan Fisik" value={detail.physical_exam_notes} />}
            {detail.diagnosis && <RecRow label="Diagnosis" value={detail.diagnosis} />}
            {detail.actions_taken && <RecRow label="Tindakan" value={detail.actions_taken} />}

            {detail.prescriptions?.length > 0 && (
              <div className="mr-detail-row">
                <div className="mr-detail-label"><FaPrescriptionBottleAlt /> Resep Obat</div>
                <ul className="mr-rx">
                  {detail.prescriptions.map((rx) => (
                    <li key={rx.id}>
                      <b>{rx.drug_name}</b>
                      {rx.dosage && ` • ${rx.dosage}`}
                      {rx.frequency && ` • ${rx.frequency}`}
                      {rx.duration_days && ` • ${rx.duration_days} hari`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detail.follow_up_date && <RecRow label="Kontrol Berikutnya" value={fmtDate(detail.follow_up_date)} />}
          </div>
        )}
      </Dialog>
    </div>
  );
}

function RecRow({ label, value }) {
  return (
    <div className="mr-detail-row">
      <div className="mr-detail-label">{label}</div>
      <div className="mr-detail-value">{value}</div>
    </div>
  );
}
