// src/pages/Segmentasi.jsx
// =====================================================================
// CRM INTI — Customer Lifecycle (10.1) & RFM Segmentation (10.2)
//   - Skor R/F/M tiap member, segmen, tahap lifecycle
//   - Ringkasan segmen + tabel detail
// =====================================================================
import { useEffect, useMemo, useState } from "react";
import {
  FaLayerGroup, FaUserCheck, FaExclamationTriangle, FaSeedling,
} from "react-icons/fa";
import {
  PageHeader, StatCard, Card, Table, Tag, Badge, EmptyState,
} from "../components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/shadcn";
import { usePageSearch } from "../context/SearchContext";
import { getRfmSegmentation } from "../lib/services";
import "./doctor/doctor.css";

const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

const SEGMENT_COLOR = {
  "Champions": "#14b8a6",
  "Loyal Customers": "#0ea5e9",
  "Potential": "#a78bfa",
  "At-Risk": "#f59e0b",
  "Lost Customers": "#ef4444",
  "Prospect": "#94a3b8",
};
const LIFECYCLE_VARIANT = {
  "Prospect": "default",
  "New Member": "info",
  "Active": "success",
  "At-Risk": "warning",
  "Churned": "danger",
  "Loyal (VIP)": "success",
};

export default function Segmentasi() {
  const { matches } = usePageSearch("Cari member...");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    getRfmSegmentation()
      .then(setData)
      .catch((e) => console.error("Gagal memuat segmentasi:", e.message))
      .finally(() => setLoading(false));
  }, []);

  const rows = data?.rows || [];
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const mk = matches(r.name, r.email, r.segment, r.lifecycle);
      const mf = tab === "all" || r.segment === tab;
      return mk && mf;
    });
  }, [rows, matches, tab]);

  if (loading) {
    return <div><PageHeader title="Segmentasi RFM & Lifecycle" subtitle="Memuat data..." /></div>;
  }

  const seg = data.segmentSummary || {};
  const champions = seg["Champions"] || 0;
  const loyal = seg["Loyal Customers"] || 0;
  const atRisk = seg["At-Risk"] || 0;
  const prospect = (seg["Prospect"] || 0) + (seg["Potential"] || 0);

  const segmentTabs = ["all", ...Object.keys(seg)];

  return (
    <div>
      <PageHeader title="Segmentasi RFM & Lifecycle" subtitle="Analisis Recency, Frequency, Monetary tiap member." />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaUserCheck />} color="success" label="Champions" value={champions} />
        <StatCard icon={<FaLayerGroup />} color="info" label="Loyal Customers" value={loyal} />
        <StatCard icon={<FaExclamationTriangle />} color="warning" label="At-Risk" value={atRisk} />
        <StatCard icon={<FaSeedling />} color="primary" label="Prospect/Potensial" value={prospect} />
      </div>

      {/* Ringkasan lifecycle */}
      <Card title="Tahap Lifecycle Pelanggan" subtitle="Distribusi member per tahap (PRD 10.1)" className="doc-mt">
        <div className="seg-lifecycle">
          {Object.entries(data.lifecycleSummary).map(([stage, count]) => (
            <div key={stage} className="seg-lc-item">
              <div className="seg-lc-count">{count}</div>
              <div className="seg-lc-stage">{stage}</div>
            </div>
          ))}
          {Object.keys(data.lifecycleSummary).length === 0 && (
            <EmptyState title="Belum ada data" />
          )}
        </div>
      </Card>

      <Tabs value={tab} onValueChange={setTab} className="rekam-tabs">
        <TabsList>
          {segmentTabs.map((s) => (
            <TabsTrigger key={s} value={s}>{s === "all" ? "Semua Segmen" : s}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={tab}>
          <Card title="Detail Member (RFM)" subtitle={`Menampilkan ${filtered.length} member`}>
            <Table
              rowKey="id"
              data={filtered}
              empty={<EmptyState icon={<FaLayerGroup />} title="Belum ada member" />}
              columns={[
                { key: "name", header: "Member",
                  render: (r) => <div><b>{r.name}</b><small style={{ display: "block", color: "#94a3b8" }}>{r.email}</small></div> },
                { key: "recency", header: "Recency",
                  render: (r) => r.recencyDays == null ? "—" : `${r.recencyDays} hari` },
                { key: "frequency", header: "Frequency", render: (r) => `${r.frequency}x` },
                { key: "monetary", header: "Monetary", render: (r) => rupiah(r.monetary) },
                { key: "rfm", header: "Skor RFM",
                  render: (r) => <Tag color="brand">{r.rfm}</Tag> },
                { key: "segment", header: "Segmen",
                  render: (r) => (
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: (SEGMENT_COLOR[r.segment] || "#94a3b8") + "22",
                      color: SEGMENT_COLOR[r.segment] || "#64748b",
                    }}>{r.segment}</span>
                  ),
                },
                { key: "lifecycle", header: "Lifecycle",
                  render: (r) => <Badge variant={LIFECYCLE_VARIANT[r.lifecycle] || "default"}>{r.lifecycle}</Badge> },
              ]}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
