// src/pages/customer/CustomerNotifikasi.jsx
// =====================================================================
// PUSAT NOTIFIKASI (PRD 7.9)
//   - Daftar semua notifikasi dengan filter (Semua / Belum dibaca / per jenis)
//   - Konfirmasi janji, reminder, jadwal vaksin, poin masuk, promo, tagihan
//   - Mark as read (satu / semua)
// Data nyata dari Supabase tabel `notifications`.
// =====================================================================
import { useCallback, useEffect, useState } from "react";
import {
  FaSyringe, FaCalendarCheck, FaWallet, FaBell, FaGift, FaCoins, FaCheckDouble,
} from "react-icons/fa";
import { PageHeader, Card, EmptyState } from "../../components/ui";
import { Tabs, TabsList, TabsTrigger } from "../../components/shadcn";
import { useAuth } from "../../context/AuthContext";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../lib/services";
import "./customer.css";

const ICON = {
  vaccine:     { ic: <FaSyringe />,       cls: "fi-vaccine" },
  appointment: { ic: <FaCalendarCheck />, cls: "fi-booking" },
  payment:     { ic: <FaWallet />,        cls: "fi-payment" },
  loyalty:     { ic: <FaCoins />,         cls: "fi-loyalty" },
  promo:       { ic: <FaGift />,          cls: "fi-promo" },
  info:        { ic: <FaBell />,          cls: "fi-note" },
};

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "unread", label: "Belum Dibaca" },
  { key: "appointment", label: "Janji Temu" },
  { key: "payment", label: "Pembayaran" },
  { key: "promo", label: "Promo" },
];

const relTime = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

export default function CustomerNotifikasi() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getNotifications(user.id);
      setItems(data);
    } catch (err) {
      console.error("Gagal memuat notifikasi:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const unreadCount = items.filter((n) => !n.is_read).length;

  const filtered = items.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;
    return n.type === filter;
  });

  const handleRead = async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleReadAll = async () => {
    if (unreadCount === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead(user.id);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Notifikasi"
        subtitle="Pusat pengingat vaksin, jadwal, pembayaran, dan promo."
      />

      <div className="notif-toolbar">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.key} value={f.key}>
                {f.key === "unread" && unreadCount > 0
                  ? `${f.label} (${unreadCount})`
                  : f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <button
          className="notif-readall"
          onClick={handleReadAll}
          disabled={unreadCount === 0}
        >
          <FaCheckDouble /> Tandai semua dibaca
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <Card>
          {loading ? (
            <p className="dh-empty">Memuat notifikasi...</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<FaBell />}
              title={filter === "unread" ? "Tidak ada notifikasi belum dibaca" : "Belum ada notifikasi"}
            />
          ) : (
            <ul className="feed">
              {filtered.map((n) => {
                const m = ICON[n.type] ?? ICON.info;
                return (
                  <li
                    key={n.id}
                    className={`feed-item ${n.is_read ? "" : "unread"}`}
                    onClick={() => !n.is_read && handleRead(n.id)}
                  >
                    <span className={`feed-ic ${m.cls}`}>{m.ic}</span>
                    <div className="feed-body">
                      <p className="feed-title">
                        {n.title}
                        {!n.is_read && <span className="feed-dot" />}
                      </p>
                      {n.body && <p className="feed-desc">{n.body}</p>}
                      <p className="feed-time">{relTime(n.created_at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
