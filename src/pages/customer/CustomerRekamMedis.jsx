// src/pages/customer/CustomerRekamMedis.jsx
// =====================================================================
// REKAM MEDIS per MEMBER (PRD 7.5)
//   - Lihat semua kunjungan, filter per hewan
//   - Detail kunjungan: keluhan, pemeriksaan fisik, diagnosis, tindakan,
//     resep obat, kontrol berikutnya
// Data nyata dari Supabase (medical_records + prescriptions).
// =====================================================================
import { useCallback, useEffect, useState } from "react";
import {
  FaNotesMedical, FaChevronDown, FaWeight, FaThermometerHalf,
  FaStethoscope, FaPrescriptionBottleAlt, FaCalendarPlus,
} from "react-icons/fa";
import { PageHeader, Card, EmptyState } from "../../components/ui";
import { Tabs, TabsList, TabsTrigger } from "../../components/shadcn";
import { useAuth } from "../../context/AuthContext";
import { useCustomerData } from "../../context/CustomerDataContext";
import { getMedicalRecordsByOwner } from "../../lib/services";
import "./customer.css";

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export default function CustomerRekamMedis() {
  const { user } = useAuth();
  const { pets } = useCustomerData();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [petFilter, setPetFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getMedicalRecordsByOwner(user.id);
      setRecords(data);
    } catch (err) {
      console.error("Gagal memuat rekam medis:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = records.filter((r) =>
    petFilter === "all" ? true : r.animal_id === petFilter
  );

  const petTabs = [
    { value: "all", label: "Semua Hewan" },
    ...pets.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <>
      <PageHeader
        title="Rekam Medis"
        subtitle="Riwayat kesehatan lengkap hewan peliharaanmu."
      />

      {pets.length > 0 && (
        <Tabs value={petFilter} onValueChange={setPetFilter}>
          <TabsList>
            {petTabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div style={{ marginTop: 12 }}>
        <Card title="Riwayat Pemeriksaan">
          {loading ? (
            <p className="dh-empty">Memuat rekam medis...</p>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<FaNotesMedical />} title="Belum ada rekam medis" />
          ) : (
            <div className="mr-list">
              {filtered.map((r) => {
                const open = openId === r.id;
                return (
                  <div key={r.id} className={`mr-item ${open ? "open" : ""}`}>
                    <button
                      className="mr-head"
                      onClick={() => setOpenId(open ? null : r.id)}
                    >
                      <span className="mr-head-ic"><FaNotesMedical /></span>
                      <div className="mr-head-info">
                        <div className="mr-head-title">
                          {r.diagnosis || "Pemeriksaan"}
                        </div>
                        <div className="mr-head-sub">
                          {r.animal?.name || "Hewan"} • {fmtDate(r.created_at)}
                        </div>
                      </div>
                      <FaChevronDown className="mr-head-arrow" />
                    </button>

                    {open && (
                      <div className="mr-body">
                        <div className="mr-vitals">
                          {r.weight_at_visit != null && (
                            <span><FaWeight /> {r.weight_at_visit} kg</span>
                          )}
                          {r.temperature != null && (
                            <span><FaThermometerHalf /> {r.temperature}°C</span>
                          )}
                        </div>

                        {r.physical_exam_notes && (
                          <MrRow icon={<FaStethoscope />} label="Pemeriksaan Fisik" value={r.physical_exam_notes} />
                        )}
                        {r.diagnosis && (
                          <MrRow icon={<FaNotesMedical />} label="Diagnosis" value={r.diagnosis} />
                        )}
                        {r.actions_taken && (
                          <MrRow icon={<FaStethoscope />} label="Tindakan" value={r.actions_taken} />
                        )}

                        {r.prescriptions && r.prescriptions.length > 0 && (
                          <div className="mr-detail-row">
                            <div className="mr-detail-label">
                              <FaPrescriptionBottleAlt /> Resep Obat
                            </div>
                            <ul className="mr-rx">
                              {r.prescriptions.map((rx) => (
                                <li key={rx.id}>
                                  <b>{rx.drug_name}</b>
                                  {rx.dosage && ` • ${rx.dosage}`}
                                  {rx.frequency && ` • ${rx.frequency}`}
                                  {rx.duration_days && ` • ${rx.duration_days} hari`}
                                  {rx.notes && <span className="mr-rx-note"> ({rx.notes})</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {r.follow_up_date && (
                          <MrRow
                            icon={<FaCalendarPlus />}
                            label="Kontrol Berikutnya"
                            value={fmtDate(r.follow_up_date)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function MrRow({ icon, label, value }) {
  return (
    <div className="mr-detail-row">
      <div className="mr-detail-label">{icon} {label}</div>
      <div className="mr-detail-value">{value}</div>
    </div>
  );
}
