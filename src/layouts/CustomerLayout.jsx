// src/layouts/CustomerLayout.jsx
import { Outlet } from "react-router-dom";
import CustomerNavbar from "../components/customer/CustomerNavbar";
import { CustomerDataProvider } from "../context/CustomerDataContext";
import "../pages/customer/customer.css";

export default function CustomerLayout() {
  return (
    <CustomerDataProvider>
      <div className="cust-shell">
        <div className="cust-shell-card">
          <CustomerNavbar />

          <main className="cust-shell-content">
            <Outlet />
          </main>

          <footer className="cust-shell-footer">© VetCare 2026</footer>
        </div>
      </div>
    </CustomerDataProvider>
  );
}
