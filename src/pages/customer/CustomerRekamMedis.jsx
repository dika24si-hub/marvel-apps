// src/pages/customer/CustomerRekamMedis.jsx
import { FaNotesMedical } from "react-icons/fa";
import { PageHeader, Card, Table, EmptyState } from "../../components/ui";
import { dummyMedicalRecords } from "../../data/dummyCustomer";
import "./customer.css";

export default function CustomerRekamMedis() {
  const columns = [
    { key: "visitDate", label: "Tanggal" },
    { key: "petName", label: "Hewan" },
    { key: "doctorName", label: "Dokter" },
    { key: "complaint", label: "Keluhan" },
    { key: "diagnosis", label: "Diagnosis" },
    { key: "treatment", label: "Tindakan" },
    { key: "medicine", label: "Obat" },
  ];

  return (
    <>
      <PageHeader title="Rekam Medis" subtitle="Riwayat kesehatan lengkap hewan peliharaanmu." />

      <div style={{ marginTop: 8 }}>
        <Card title="Riwayat Pemeriksaan">
          {dummyMedicalRecords.length === 0 ? (
            <EmptyState icon={<FaNotesMedical />} title="Belum ada rekam medis" />
          ) : (
            <Table columns={columns} data={dummyMedicalRecords} />
          )}
        </Card>
      </div>
    </>
  );
}