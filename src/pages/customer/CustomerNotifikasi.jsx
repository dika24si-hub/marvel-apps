// src/pages/customer/CustomerNotifikasi.jsx
import { FaSyringe, FaCalendarCheck, FaWallet, FaBell } from "react-icons/fa";
import { PageHeader, Card, EmptyState } from "../../components/ui";
import { dummyNotifications } from "../../data/dummyCustomer";
import "./customer.css";

const ICON = {
  vaccine:     { ic: <FaSyringe />,       cls: "fi-vaccine" },
  appointment: { ic: <FaCalendarCheck />, cls: "fi-booking" },
  payment:     { ic: <FaWallet />,        cls: "fi-payment" },
  info:        { ic: <FaBell />,          cls: "fi-note" },
};

export default function CustomerNotifikasi() {
  return (
    <>
      <PageHeader title="Notifikasi" subtitle="Pusat pengingat vaksin, jadwal, dan pembayaran." />

      <div style={{ marginTop: 8 }}>
        <Card title="Pengingat">
          {dummyNotifications.length === 0 ? (
            <EmptyState icon={<FaBell />} title="Tidak ada notifikasi" />
          ) : (
            <ul className="feed">
              {dummyNotifications.map((n) => {
                const m = ICON[n.type] ?? ICON.info;
                return (
                  <li key={n.id} className="feed-item">
                    <span className={`feed-ic ${m.cls}`}>{m.ic}</span>
                    <div>
                      <p className="feed-title">{n.title}</p>
                      {n.message && <p className="feed-desc">{n.message}</p>}
                      <p className="feed-time">{n.createdAt}</p>
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