// src/pages/doctor/DoctorPasien.jsx
// =====================================================================
// MANAJEMEN PASIEN (PRD 8.3)
//   - Daftar semua hewan + pemilik, pencarian, jumlah kunjungan
//   - Lihat detail + riwayat rekam medis pasien
// =====================================================================
import { useEffect, useMemo, useState } from "react";
import {
  FaPaw, FaNotesMedical, FaWeight, FaThermometerHalf, FaUser, FaPhone,
} from "react-icons/fa";
import {
  PageHeader, StatCard, Card, Table, Tag, EmptyState, Pagination, Button,
} from "../../components/ui";
import { Dialog } from "../../components/shadcn";
import { usePageSearch } from "../../context/SearchContext";
import { getAllPatients, getMedicalRecordsByAnimal } from "../../lib/services";
import "./doctor.css";

const PER_PAGE = 8;
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";

export default function DoctorPasien() {
  const { matches } = usePageSearch("Cari nama hewan, pemilik, atau jenis...");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [detail, setDetail] = useState(null);
  const [records, setRecords] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    getAllPatients()
      .then(setPatients)
      .catch((e) => console.error("Gagal memuat pasien:", e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => patients.filter((p) => matches(p.name, p.owner?.full_name, p.species, p.breed)),
    [patients, matches]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openDetail = async (p) => {
    setDetail(p);
    setRecLoading(true);
    setRecords([]);
    try {
      const recs = await getMedicalRecordsByAnimal(p.id);
      setRecords(recs);
    } catch (e) {
      console.error(e.message);
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Manajemen Pasien" subtitle="Data hewan, pemilik, dan riwayat medis." />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaPaw />} color="primary" label="Total Pasien" value={patients.length} />
        <StatCard icon={<FaNotesMedical />} color="info" label="Hasil Pencarian" value={filtered.length} />
      </div>

      <Card title="Daftar Pasien" subtitle={`Menampilkan ${filtered.length} hewan`} className="doc-mt">
        {loading ? (
          <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat pasien...</p>
        ) : (
          <Table
            rowKey="id"
            data={pageRows}
            empty={<EmptyState title="Belum ada pasien" description="Data hewan dari pemilik akan muncul di sini." />}
            columns={[
              { key: "pet", header: "Hewan",
                render: (r) => (
                  <div className="pet-cell">
                    <div className="pet-thumb blue"><FaPaw /></div>
                    <div>
                      <b>{r.name}</b>
                      <small>{r.species}{r.breed ? ` • ${r.breed}` : ""}</small>
                    </div>
                  </div>
                ),
              },
              { key: "owner", header: "Pemilik",
                render: (r) => r.owner?.full_name || "-" },
              { key: "phone", header: "Kontak",
                render: (r) => r.owner?.phone || "-" },
              { key: "visits", header: "Kunjungan",
                render: (r) => <Tag color="brand">{r.visitCount}x</Tag> },
              { key: "act", header: "Aksi", align: "right",
                render: (r) => (
                  <Button size="sm" variant="primary" leftIcon={<FaNotesMedical />} onClick={() => openDetail(r)}>
                    Detail
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

      {/* Dialog detail pasien + riwayat medis */}
      <Dialog
        open={!!detail}
        onOpenChange={(o) => { if (!o) setDetail(null); }}
        title={detail ? `Pasien — ${detail.name}` : ""}
        size="lg"
      >
        {detail && (
          <div className="doc-patient">
            <div className="doc-patient-head">
              <div className="doc-patient-ava"><FaPaw /></div>
              <div>
                <h3>{detail.name}</h3>
                <p>{detail.species}{detail.breed ? ` • ${detail.breed}` : ""}{detail.gender ? ` • ${detail.gender}` : ""}</p>
              </div>
            </div>

            <div className="doc-patient-info">
              <div><FaUser /> Pemilik: <b>{detail.owner?.full_name || "-"}</b></div>
              <div><FaPhone /> {detail.owner?.phone || "-"}</div>
              {detail.weight != null && <div><FaWeight /> {detail.weight} kg</div>}
            </div>

            <h4 className="doc-patient-sub">Riwayat Rekam Medis</h4>
            {recLoading ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat riwayat...</p>
            ) : records.length === 0 ? (
              <EmptyState icon={<FaNotesMedical />} title="Belum ada rekam medis" />
            ) : (
              <div className="doc-rec-list">
                {records.map((r) => (
                  <div key={r.id} className="doc-rec-item">
                    <div className="doc-rec-date">{fmtDate(r.created_at)}</div>
                    <div className="doc-rec-body">
                      <b>{r.diagnosis || "Pemeriksaan"}</b>
                      <div className="doc-rec-vitals">
                        {r.weight_at_visit != null && <span><FaWeight /> {r.weight_at_visit}kg</span>}
                        {r.temperature != null && <span><FaThermometerHalf /> {r.temperature}°C</span>}
                      </div>
                      {r.actions_taken && <p>{r.actions_taken}</p>}
                      {r.prescriptions?.length > 0 && (
                        <ul className="doc-rec-rx">
                          {r.prescriptions.map((rx) => (
                            <li key={rx.id}>{rx.drug_name} {rx.dosage && `• ${rx.dosage}`} {rx.frequency && `• ${rx.frequency}`}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
