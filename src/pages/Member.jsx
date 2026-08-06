import { useEffect, useMemo, useState } from "react";
import {
  FaUsers, FaUserCheck, FaUserSlash, FaPaw,
} from "react-icons/fa";

import { usePageSearch } from "../context/SearchContext";
import { getMembers, setMemberActive } from "../lib/services";
import { supabase } from "../lib/supabase";

import {
  PageHeader, StatCard, Card, Table, Badge, Avatar, EmptyState, Pagination, Button,
} from "../components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/shadcn";

const AVATAR_THEMES = ["purple", "teal", "orange", "blue", "pink"];
const PER_PAGE = 8;

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

const memberName = (m) => m.full_name || m.email || "-";

export default function Member() {
  const { matches } = usePageSearch("Cari nama atau email member...");

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      setMembers(await getMembers());
    } catch (err) {
      console.error("Gagal memuat member:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel("admin-members-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "animals" }, () => load())
      .subscribe();

    const handleFocus = () => load();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleActive = async (m) => {
    const next = !m.is_active;
    try {
      await setMemberActive(m.id, next);
      setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_active: next } : x)));
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  };

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchKey = matches(m.full_name, m.email);
      const matchFilter =
        filter === "Semua" ||
        (filter === "Aktif" && m.is_active) ||
        (filter === "Nonaktif" && !m.is_active);
      return matchKey && matchFilter;
    });
  }, [matches, filter, members]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageRows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(
    () => ({
      total: members.length,
      aktif: members.filter((m) => m.is_active).length,
      nonaktif: members.filter((m) => !m.is_active).length,
      totalPets: members.reduce((a, m) => a + (m.petCount || 0), 0),
    }),
    [members]
  );

  return (
    <div>
      <PageHeader title="Manajemen Member" subtitle="Kelola akun pemilik hewan." />

      <div className="mini-stats" style={{ marginTop: 14 }}>
        <StatCard icon={<FaUsers />}     color="primary" label="Total Member" value={stats.total} />
        <StatCard icon={<FaUserCheck />} color="success" label="Aktif"        value={stats.aktif} />
        <StatCard icon={<FaUserSlash />} color="warning" label="Nonaktif"     value={stats.nonaktif} />
        <StatCard icon={<FaPaw />}       color="info"    label="Total Hewan"  value={stats.totalPets} />
      </div>

      <Tabs value={filter} onValueChange={(k) => { setFilter(k); setPage(1); }} className="rekam-tabs">
        <TabsList>
          {["Semua", "Aktif", "Nonaktif"].map((f) => (
            <TabsTrigger key={f} value={f}>{f}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filter}>
          <Card title="Daftar Member" subtitle={`Menampilkan ${filtered.length} member`}>
            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Memuat member...</p>
            ) : (
              <Table
                rowKey="id"
                data={pageRows}
                empty={<EmptyState title="Belum ada member" description="Member yang mendaftar akan muncul di sini." />}
                columns={[
                  { key: "nama", header: "Nama",
                    render: (m, i) => (
                      <div className="pet-cell">
                        <Avatar name={memberName(m)} theme={AVATAR_THEMES[i % AVATAR_THEMES.length]} size={40} />
                        <div>
                          <b>{memberName(m)}</b>
                        </div>
                      </div>
                    ),
                  },
                  { key: "email", header: "Email", render: (m) => <span className="muted">{m.email || "-"}</span> },
                  { key: "pets", header: "Hewan", render: (m) => <Badge variant="info">{m.petCount} ekor</Badge> },
                  { key: "joined", header: "Bergabung", render: (m) => <span className="muted">{fmtDate(m.created_at)}</span> },
                  { key: "status", header: "Status",
                    render: (m) => <Badge variant={m.is_active ? "success" : "danger"} dot>{m.is_active ? "Aktif" : "Nonaktif"}</Badge> },
                  { key: "act", header: "Aksi", align: "right",
                    render: (m) => (
                      <Button size="sm" variant={m.is_active ? "danger" : "primary"} onClick={() => toggleActive(m)}>
                        {m.is_active ? "Nonaktifkan" : "Aktifkan"}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
