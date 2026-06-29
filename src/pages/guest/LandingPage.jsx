import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaPaw, FaBars, FaTimes, FaNotesMedical, FaCalendarCheck, FaCreditCard,
  FaUsers, FaCheck, FaPlus, FaStar, FaFacebookF, FaInstagram, FaLinkedinIn,
  FaArrowRight, FaHeartbeat, FaShieldAlt, FaClinicMedical, FaStore, FaHospital,
  FaChartLine, FaReact, FaMoon, FaSun, FaUserTie, FaUserNurse, FaUserMd,
  FaBell, FaRobot, FaBrain, FaMagic, FaLightbulb, FaEnvelope, FaPhoneAlt,
  FaMapMarkerAlt, FaComments, FaCalculator, FaPaperPlane, FaGift, FaWhatsapp,
} from "react-icons/fa";
import { SiSupabase, SiPostgresql } from "react-icons/si";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, Tooltip, CartesianGrid,
} from "recharts";
import { submitLead, submitContact } from "../../lib/services";
import useReveal from "./useReveal";
import "./landing.css";

/* =====================================================================
   VetCare — Landing Page (Pemilik Hewan / Customer)
   ===================================================================== */

const NAV_LINKS = [
  { label: "Layanan", to: "#features" },
  { label: "Cara Kerja", to: "#workflow" },
  { label: "Keanggotaan", to: "#pricing" },
  { label: "FAQ", to: "#faq" },
  { label: "Kontak", to: "#contact" },
];

const FEATURES = [
  { icon: <FaPaw />, color: "#14b8a6", title: "Daftar Hewan", desc: "Daftarkan hewan peliharaan Anda dan simpan profil lengkapnya." },
  { icon: <FaCalendarCheck />, color: "#0ea5e9", title: "Booking Jadwal", desc: "Buat janji periksa dengan dokter hewan kapan saja, tanpa antri." },
  { icon: <FaNotesMedical />, color: "#f97316", title: "Rekam Medis", desc: "Lihat riwayat kesehatan & vaksinasi peliharaan kapan pun." },
  { icon: <FaCreditCard />, color: "#8b5cf6", title: "Pembayaran Online", desc: "Bayar tagihan layanan klinik dengan mudah & transparan." },
];

const WORKFLOW = [
  { icon: <FaUserTie />, color: "#14b8a6", title: "Daftar Akun", desc: "Buat akun pemilik hewan" },
  { icon: <FaPaw />, color: "#0ea5e9", title: "Tambah Hewan", desc: "Daftarkan peliharaan Anda" },
  { icon: <FaCalendarCheck />, color: "#8b5cf6", title: "Buat Janji", desc: "Pilih dokter & jadwal" },
  { icon: <FaUserMd />, color: "#f59e0b", title: "Pemeriksaan", desc: "Dokter memeriksa hewan" },
  { icon: <FaCreditCard />, color: "#f97316", title: "Pembayaran", desc: "Bayar online praktis" },
  { icon: <FaBell />, color: "#ec4899", title: "Notifikasi", desc: "Pengingat vaksin & jadwal" },
];

const AI_FEATURES = [
  { icon: <FaRobot />, title: "Rekomendasi Jadwal", desc: "Saran waktu periksa terbaik berdasarkan riwayat peliharaan Anda." },
  { icon: <FaBrain />, title: "Ringkasan Kesehatan", desc: "Rangkuman kondisi hewan agar Anda mudah memahaminya." },
  { icon: <FaBell />, title: "Pengingat Vaksin", desc: "Notifikasi otomatis saat jadwal vaksin sudah dekat." },
  { icon: <FaLightbulb />, title: "Tips Perawatan", desc: "Rekomendasi perawatan sesuai jenis & usia hewan Anda." },
];

const COMPANIES = [
  { icon: <FaClinicMedical />, name: "PetClinic" },
  { icon: <FaStore />, name: "PetShop+" },
  { icon: <FaHospital />, name: "AnimalHospital" },
  { icon: <FaPaw />, name: "CareCenter" },
  { icon: <FaHeartbeat />, name: "VetPlus" },
];

const PLANS = [
  { name: "Basic", desc: "Untuk yang baru bergabung", price: "Gratis", period: "",
    features: ["1 hewan terdaftar", "Booking jadwal", "Lihat rekam medis", "Notifikasi vaksin"], cta: "Daftar Gratis", featured: false },
  { name: "Silver", desc: "Paling populer untuk pemilik aktif", price: "Otomatis", period: "",
    features: ["Hewan tak terbatas", "Prioritas booking", "Riwayat lengkap", "Diskon layanan", "Reminder pintar"], cta: "Mulai Sekarang", featured: true },
  { name: "Gold", desc: "Benefit eksklusif member setia", price: "Eksklusif", period: "",
    features: ["Semua benefit Silver", "Promo khusus member", "Konsultasi prioritas", "Poin reward", "Layanan VIP"], cta: "Lihat Keanggotaan", featured: false },
];

const TESTIMONIALS = [
  { name: "Dika Pratama", role: "Pemilik Momo (Kucing), Jakarta", text: "Booking jadwal periksa jadi gampang banget, tinggal pilih dokter dan jam. Rekam medis Momo juga lengkap." },
  { name: "Sari Indah", role: "Pemilik Luna (Kucing), Bandung", text: "Notifikasi vaksin sangat membantu, saya jadi tidak pernah lupa jadwal vaksin Luna lagi." },
  { name: "Andi Wijaya", role: "Pemilik Bruno (Anjing), Surabaya", text: "Bayar tagihan online praktis, riwayat perawatan Bruno semua tersimpan rapi di satu aplikasi." },
];

const FAQS = [
  { q: "Apakah pendaftaran VetCare gratis?", a: "Ya. Anda bisa membuat akun pemilik hewan secara gratis dan langsung mendaftarkan peliharaan Anda." },
  { q: "Apakah data hewan saya aman?", a: "Sangat aman. Data terenkripsi & disimpan di Supabase dengan Row Level Security — hanya Anda yang bisa mengaksesnya." },
  { q: "Bagaimana cara booking jadwal periksa?", a: "Setelah login, pilih hewan, pilih dokter dan jadwal yang tersedia, lalu konfirmasi. Selesai." },
  { q: "Apakah ada login Google?", a: "Ya, Anda bisa masuk via Google atau email melalui Supabase Auth." },
  { q: "Bisa daftar lebih dari satu hewan?", a: "Bisa. Anda dapat mendaftarkan beberapa hewan peliharaan dalam satu akun." },
  { q: "Bagaimana cara membayar tagihan?", a: "Pembayaran dilakukan online melalui aplikasi — transfer bank, kartu, atau QRIS." },
  { q: "Apakah saya akan diingatkan jadwal vaksin?", a: "Ya, sistem mengirim notifikasi otomatis saat jadwal vaksin peliharaan Anda sudah dekat." },
  { q: "Apakah ada mode gelap?", a: "Ya, seluruh aplikasi & halaman ini mendukung dark mode." },
];

// Estimasi biaya layanan (untuk kalkulator) — angka ilustrasi.
const SERVICE_PRICES = [
  { key: "periksa", label: "Pemeriksaan Umum", price: 80000 },
  { key: "vaksin", label: "Vaksinasi", price: 150000 },
  { key: "grooming", label: "Grooming", price: 100000 },
  { key: "operasi", label: "Operasi Ringan", price: 750000 },
  { key: "lab", label: "Tes Laboratorium", price: 200000 },
];
const ANIMAL_FACTOR = [
  { key: "kucing", label: "Kucing", factor: 1 },
  { key: "anjing", label: "Anjing", factor: 1.3 },
  { key: "kelinci", label: "Kelinci", factor: 0.9 },
  { key: "burung", label: "Burung", factor: 0.8 },
];
const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const revenueData = [
  { m: "Jan", v: 12 }, { m: "Feb", v: 18 }, { m: "Mar", v: 15 }, { m: "Apr", v: 22 },
  { m: "Mei", v: 28 }, { m: "Jun", v: 24 }, { m: "Jul", v: 32 }, { m: "Agu", v: 38 },
];
const serviceData = [
  { s: "Vaksin", v: 40 }, { s: "Periksa", v: 32 }, { s: "Operasi", v: 18 },
  { s: "Grooming", v: 26 }, { s: "Lab", v: 14 },
];

export default function LandingPage() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics");
  const [openFaq, setOpenFaq] = useState(0);

  useReveal();

  // Newsletter
  const [news, setNews] = useState("");
  const [newsState, setNewsState] = useState({ loading: false, msg: "", ok: false });
  // Contact
  const [contact, setContact] = useState({ name: "", email: "", message: "" });
  const [contactState, setContactState] = useState({ loading: false, msg: "", ok: false });

  // Live Chat Widget
  const [chatOpen, setChatOpen] = useState(false);

  // Kalkulator Estimasi Biaya
  const [calcService, setCalcService] = useState("periksa");
  const [calcAnimal, setCalcAnimal] = useState("kucing");
  const calcResult = (() => {
    const svc = SERVICE_PRICES.find((s) => s.key === calcService);
    const anm = ANIMAL_FACTOR.find((a) => a.key === calcAnimal);
    if (!svc || !anm) return 0;
    return Math.round((svc.price * anm.factor) / 1000) * 1000;
  })();

  // Form Konsultasi Awal (tanpa login)
  const [consult, setConsult] = useState({ name: "", email: "", animal: "Kucing", message: "" });
  const [consultState, setConsultState] = useState({ loading: false, msg: "", ok: false });

  // Modal Promo (muncul setelah 5 detik)
  const [promoOpen, setPromoOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("vc_theme");
    if (saved === "dark") setDark(true);
  }, []);
  useEffect(() => {
    localStorage.setItem("vc_theme", dark ? "dark" : "light");
  }, [dark]);

  const handleNews = async (e) => {
    e.preventDefault();
    setNewsState({ loading: true, msg: "", ok: false });
    try {
      await submitLead({ type: "newsletter", email: news });
      setNews("");
      setNewsState({ loading: false, ok: true, msg: "Terima kasih! Anda telah berlangganan." });
    } catch (err) {
      setNewsState({ loading: false, ok: false, msg: err?.message || "Gagal mengirim." });
    }
  };

  const handleContact = async (e) => {
    e.preventDefault();
    setContactState({ loading: true, msg: "", ok: false });
    try {
      await submitContact(contact);
      setContact({ name: "", email: "", message: "" });
      setContactState({ loading: false, ok: true, msg: "Pesan terkirim! Tim kami akan menghubungi Anda." });
    } catch (err) {
      setContactState({ loading: false, ok: false, msg: err?.message || "Gagal mengirim pesan." });
    }
  };

  // Promo pop-up muncul setelah 5 detik (sekali per sesi).
  useEffect(() => {
    if (sessionStorage.getItem("vc_promo_shown")) return;
    const t = setTimeout(() => {
      setPromoOpen(true);
      sessionStorage.setItem("vc_promo_shown", "1");
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  const handleConsult = async (e) => {
    e.preventDefault();
    setConsultState({ loading: true, msg: "", ok: false });
    try {
      await submitLead({
        type: "contact",
        name: consult.name,
        email: consult.email,
        message: `[Konsultasi Awal - ${consult.animal}] ${consult.message}`,
      });
      setConsult({ name: "", email: "", animal: "Kucing", message: "" });
      setConsultState({ loading: false, ok: true, msg: "Konsultasi terkirim! Dokter kami akan menghubungi Anda." });
    } catch (err) {
      setConsultState({ loading: false, ok: false, msg: err?.message || "Gagal mengirim konsultasi." });
    }
  };

  return (
    <div className={`vc-landing ${dark ? "vc-dark" : ""}`}>
      {/* ============ NAVBAR ============ */}
      <nav className="vc-nav">
        <div className="vc-container vc-nav-inner">
          <a href="#home" className="vc-logo">
            <span className="vc-logo-mark"><FaPaw /></span>
            <span className="vc-logo-text"><b>VetCare</b><span>Perawatan Hewan Kesayangan</span></span>
          </a>
          <ul className={`vc-nav-links ${open ? "open" : ""}`}>
            {NAV_LINKS.map((l) => (
              <li key={l.label}><a href={l.to} onClick={() => setOpen(false)}>{l.label}</a></li>
            ))}
          </ul>
          <div className="vc-nav-actions">
            <button className="vc-theme-toggle" onClick={() => setDark((d) => !d)} aria-label="Toggle dark mode">
              {dark ? <FaSun /> : <FaMoon />}
            </button>
            <Link to="/login" className="vc-btn vc-btn-outline vc-btn-sm">Login</Link>
            <Link to="/register" className="vc-btn vc-btn-primary vc-btn-sm">Try Free</Link>
          </div>
          <button className="vc-nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <header id="home" className="vc-hero">
        <div className="vc-hero-orbs"><i /><i /><i /></div>
        <div className="vc-container vc-hero-inner">
          <div className="vc-hero-text">
            <span className="vc-badge"><FaPaw /> Aplikasi Perawatan Hewan Kesayangan</span>
            <h1>Rawat Hewan Kesayangan <span className="vc-grad">Lebih Mudah</span></h1>
            <p className="vc-sub">
              Daftarkan peliharaan, buat janji periksa, pantau rekam medis, dan
              bayar tagihan — semua dalam satu aplikasi. Praktis, cepat, dan terpercaya.
            </p>
            <div className="vc-hero-actions">
              <Link to="/register" className="vc-btn vc-btn-primary vc-btn-lg">Daftar Gratis <FaArrowRight /></Link>
              <a href="#preview" className="vc-btn vc-btn-outline vc-btn-lg">Lihat Aplikasi</a>
            </div>
            <div className="vc-hero-trust">
              <div className="item"><b>12rb+</b><span>Hewan Terdaftar</span></div>
              <div className="item"><b>50+</b><span>Dokter Hewan</span></div>
              <div className="item"><b>98%</b><span>Kepuasan Pemilik</span></div>
            </div>
          </div>

          <div className="vc-hero-visual">
            <div className="vc-mock vc-glass">
              <div className="vc-mock-bar"><i /><i /><i /></div>
              <div className="vc-mock-body">
                <div className="vc-mock-stats">
                  <div className="vc-mock-stat"><b>248</b><span>Pasien</span></div>
                  <div className="vc-mock-stat"><b>36</b><span>Jadwal</span></div>
                  <div className="vc-mock-stat"><b>12</b><span>Dokter</span></div>
                </div>
                <div className="vc-mock-chart">
                  {[55, 80, 40, 95, 65, 78, 50].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
                </div>
              </div>
            </div>
            <div className="vc-hero-pill top vc-glass">
              <span className="ic" style={{ background: "#14b8a6" }}><FaHeartbeat /></span>
              <div><b>Pantau Pasien</b><span>Real-time</span></div>
            </div>
            <div className="vc-hero-pill bottom vc-glass">
              <span className="ic" style={{ background: "#f97316" }}><FaShieldAlt /></span>
              <div><b>Data Aman</b><span>Terenkripsi</span></div>
            </div>
          </div>
        </div>
      </header>

      {/* ============ TRUSTED ============ */}
      <section className="vc-trusted">
        <div className="vc-container">
          <p>Dipercaya oleh ribuan pemilik hewan di seluruh Indonesia</p>
          <div className="vc-trusted-logos">
            {COMPANIES.map((c) => (
              <div key={c.name} className="vc-trusted-logo">{c.icon} {c.name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DASHBOARD PREVIEW ============ */}
      <section id="preview" className="vc-section vc-preview">
        <div className="vc-container">
          <div className="vc-section-head vc-reveal">
            <span className="vc-eyebrow">Aplikasi Pemilik Hewan</span>
            <h2>Pantau peliharaan dari satu aplikasi</h2>
            <p>Contoh tampilan aplikasi VetCare. Angka di bawah hanya ilustrasi.</p>
          </div>
          <div className="vc-preview-tabs vc-reveal">
            {[
              { k: "analytics", label: "Hewan Saya", icon: <FaPaw /> },
              { k: "appointment", label: "Jadwal", icon: <FaCalendarCheck /> },
              { k: "revenue", label: "Pembayaran", icon: <FaCreditCard /> },
            ].map((tab) => (
              <button key={tab.k} className={`vc-preview-tab ${activeTab === tab.k ? "active" : ""}`} onClick={() => setActiveTab(tab.k)}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          <div className="vc-preview-window vc-reveal">
            <div className="vc-preview-head"><i /><i /><i /><span>app.vetcare.id/{activeTab}</span></div>
            <div className="vc-preview-body">
              <div className="vc-preview-row">
                {activeTab === "analytics" && (<>
                  <div className="vc-preview-kpi"><b>3</b><span>Hewan Saya</span> <em>aktif</em></div>
                  <div className="vc-preview-kpi"><b>12</b><span>Kunjungan</span> <em>total</em></div>
                  <div className="vc-preview-kpi"><b>4</b><span>Vaksin Lengkap</span> <em>✓</em></div>
                  <div className="vc-preview-kpi"><b>Sehat</b><span>Status Umum</span> <em>baik</em></div>
                </>)}
                {activeTab === "appointment" && (<>
                  <div className="vc-preview-kpi"><b>2</b><span>Jadwal Aktif</span> <em>upcoming</em></div>
                  <div className="vc-preview-kpi"><b>1</b><span>Hari Ini</span> <em>siap</em></div>
                  <div className="vc-preview-kpi"><b>50+</b><span>Dokter</span> <em>tersedia</em></div>
                  <div className="vc-preview-kpi"><b>0</b><span>Bentrok</span> <em>✓</em></div>
                </>)}
                {activeTab === "revenue" && (<>
                  <div className="vc-preview-kpi"><b>Lunas</b><span>Tagihan</span> <em>✓</em></div>
                  <div className="vc-preview-kpi"><b>QRIS</b><span>Metode</span> <em>cepat</em></div>
                  <div className="vc-preview-kpi"><b>Gold</b><span>Member</span> <em>aktif</em></div>
                  <div className="vc-preview-kpi"><b>1.250</b><span>Poin Reward</span> <em>★</em></div>
                </>)}
              </div>
              <div className="vc-preview-graph">
                {[60, 80, 45, 90, 70, 85, 55, 95, 65, 78, 50, 88].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="vc-section">
        <div className="vc-container">
          <div className="vc-section-head vc-reveal">
            <span className="vc-eyebrow">Layanan</span>
            <h2>Semua kebutuhan peliharaan Anda</h2>
            <p>Kelola perawatan hewan kesayangan dengan mudah, dari satu aplikasi.</p>
          </div>
          <div className="vc-features-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="vc-feature vc-reveal">
                <div className="vc-feature-ic" style={{ background: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WORKFLOW ============ */}
      <section id="workflow" className="vc-section alt">
        <div className="vc-container">
          <div className="vc-section-head vc-reveal">
            <span className="vc-eyebrow">Cara Kerja</span>
            <h2>Mulai dalam 6 langkah mudah</h2>
            <p>Dari mendaftar akun hingga mendapat pengingat — semua simpel dan cepat.</p>
          </div>
          <div className="vc-wf">
            {WORKFLOW.map((w, i) => (
              <div key={w.title} className="vc-wf-step vc-reveal">
                <span className="step-no">{i + 1}</span>
                <span className="ic" style={{ background: w.color }}>{w.icon}</span>
                <b>{w.title}</b>
                <span>{w.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ANALYTICS ============ */}
      <section className="vc-section">
        <div className="vc-container">
          <div className="vc-section-head vc-reveal">
            <span className="vc-eyebrow">Riwayat & Statistik</span>
            <h2>Pantau kesehatan peliharaan Anda</h2>
            <p>Lihat tren kunjungan, layanan yang sering dipakai, dan riwayat perawatan. Data di bawah hanya contoh ilustrasi.</p>
          </div>
          <div className="vc-analytics-grid vc-reveal">
            <div className="vc-analytics-card">
              <h3>Riwayat Kunjungan</h3>
              <p className="sub">Contoh frekuensi kunjungan (12 bulan)</p>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="vcArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="m" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Area type="monotone" dataKey="v" stroke="#14b8a6" strokeWidth={3} fill="url(#vcArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "grid", gap: 24 }}>
              <div className="vc-analytics-card">
                <h3>Top Services</h3>
                <p className="sub">Layanan paling diminati</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={serviceData}>
                    <XAxis dataKey="s" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    <Bar dataKey="v" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="vc-analytics-mini">
                <div className="vc-mini-stat"><b>12rb+</b><span>Hewan Terdaftar</span> <em>aktif</em></div>
                <div className="vc-mini-stat"><b>4.9★</b><span>Rating Layanan</span> <em>baik</em></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ AI FEATURES ============ */}
      <section className="vc-section vc-ai">
        <div className="vc-container">
          <div className="vc-section-head vc-reveal">
            <span className="vc-eyebrow" style={{ color: "#5eead4" }}>Fitur Pintar</span>
            <h2>Bantuan cerdas untuk Anda</h2>
            <p>Fitur pintar yang membantu Anda merawat peliharaan lebih baik — segera hadir.</p>
          </div>
          <div className="vc-ai-grid">
            {AI_FEATURES.map((a) => (
              <article key={a.title} className="vc-ai-card vc-reveal">
                <div className="vc-ai-ic">{a.icon}</div>
                <span className="vc-ai-badge">AI</span>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="vc-section alt">
        <div className="vc-container">
          <div className="vc-section-head vc-reveal">
            <span className="vc-eyebrow">Keanggotaan</span>
            <h2>Keuntungan jadi member VetCare</h2>
            <p>Tingkatkan keanggotaan otomatis & nikmati benefit eksklusif. Tanpa biaya tersembunyi.</p>
          </div>
          <div className="vc-pricing-grid">
            {PLANS.map((p) => (
              <div key={p.name} className={`vc-plan vc-reveal ${p.featured ? "featured" : ""}`}>
                {p.featured && <span className="vc-plan-tag">Paling Populer</span>}
                <h3>{p.name}</h3>
                <p className="vc-plan-desc">{p.desc}</p>
                <div className="vc-plan-price"><b>{p.price}</b><span>{p.period}</span></div>
                <ul>{p.features.map((f) => <li key={f}><FaCheck /> {f}</li>)}</ul>
                <Link to="/register" className={`vc-btn ${p.featured ? "vc-btn-primary" : "vc-btn-outline"} vc-btn-lg`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section id="testimonials" className="vc-section">
        <div className="vc-container">
          <div className="vc-section-head vc-reveal">
            <span className="vc-eyebrow">Testimoni</span>
            <h2>Kata para pemilik hewan</h2>
            <p>Pengalaman pemilik hewan yang sudah memakai VetCare.</p>
          </div>
          <div className="vc-testi-grid">
            {TESTIMONIALS.map((tm) => (
              <article key={tm.name} className="vc-testi vc-reveal">
                <div className="vc-testi-stars">{Array.from({ length: 5 }).map((_, i) => <FaStar key={i} />)}</div>
                <p>"{tm.text}"</p>
                <div className="vc-testi-user">
                  <div className="vc-testi-ava">{tm.name.charAt(0)}</div>
                  <div><b>{tm.name}</b><span>{tm.role}</span></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="vc-section alt">
        <div className="vc-container">
          <div className="vc-section-head vc-reveal">
            <span className="vc-eyebrow">FAQ</span>
            <h2>Pertanyaan yang sering diajukan</h2>
            <p>Belum menemukan jawaban? Hubungi kami di bawah.</p>
          </div>
          <div className="vc-faq-list">
            {FAQS.map((item, i) => (
              <div key={i} className={`vc-faq-item ${openFaq === i ? "open" : ""}`}>
                <button className="vc-faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {item.q}<FaPlus />
                </button>
                <div className="vc-faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ESTIMASI BIAYA + KONSULTASI AWAL ============ */}
      <section id="estimasi" className="vc-section">
        <div className="vc-container">
          <div className="vc-section-head vc-reveal">
            <span className="vc-eyebrow">Estimasi & Konsultasi</span>
            <h2>Hitung biaya & konsultasi gratis</h2>
            <p>Perkirakan biaya layanan dan kirim pertanyaan awal — tanpa perlu login.</p>
          </div>
          <div className="vc-est-grid">
            {/* Kalkulator Estimasi Biaya */}
            <div className="vc-est-card vc-reveal">
              <div className="vc-est-head"><FaCalculator /> Kalkulator Estimasi Biaya</div>
              <div className="vc-field">
                <label>Jenis Layanan</label>
                <select value={calcService} onChange={(e) => setCalcService(e.target.value)}>
                  {SERVICE_PRICES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div className="vc-field">
                <label>Jenis Hewan</label>
                <select value={calcAnimal} onChange={(e) => setCalcAnimal(e.target.value)}>
                  {ANIMAL_FACTOR.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                </select>
              </div>
              <div className="vc-est-result">
                <span>Estimasi Biaya</span>
                <b>{rupiah(calcResult)}</b>
                <em>*Harga ilustrasi, dapat berbeda sesuai kondisi hewan.</em>
              </div>
            </div>

            {/* Form Konsultasi Awal (tanpa login) */}
            <form className="vc-est-card vc-reveal" onSubmit={handleConsult}>
              <div className="vc-est-head"><FaComments /> Konsultasi Awal Gratis</div>
              <div className="vc-field">
                <label>Nama</label>
                <input type="text" placeholder="Nama Anda" value={consult.name}
                  onChange={(e) => setConsult({ ...consult, name: e.target.value })} required />
              </div>
              <div className="vc-field">
                <label>Email</label>
                <input type="email" placeholder="email@anda.com" value={consult.email}
                  onChange={(e) => setConsult({ ...consult, email: e.target.value })} required />
              </div>
              <div className="vc-field">
                <label>Jenis Hewan</label>
                <select value={consult.animal} onChange={(e) => setConsult({ ...consult, animal: e.target.value })}>
                  <option>Kucing</option><option>Anjing</option><option>Kelinci</option><option>Burung</option><option>Lainnya</option>
                </select>
              </div>
              <div className="vc-field">
                <label>Pertanyaan</label>
                <textarea placeholder="Ceritakan keluhan peliharaan Anda..." value={consult.message}
                  onChange={(e) => setConsult({ ...consult, message: e.target.value })} required />
              </div>
              <button type="submit" className="vc-btn vc-btn-primary vc-btn-lg" style={{ width: "100%" }} disabled={consultState.loading}>
                {consultState.loading ? "Mengirim..." : <>Kirim Konsultasi <FaPaperPlane /></>}
              </button>
              {consultState.msg && <div className={`vc-form-msg ${consultState.ok ? "ok" : "err"}`}>{consultState.msg}</div>}
            </form>
          </div>
        </div>
      </section>

      {/* ============ NEWSLETTER (CTA) ============ */}
      <section id="cta" className="vc-cta">
        <div className="vc-container">
          <div className="vc-cta-box">
            <h2>Mulai Rawat Peliharaan Anda Hari Ini</h2>
            <p>Berlangganan untuk update layanan, tips perawatan & promo menarik.</p>
            <form className="vc-news" onSubmit={handleNews}>
              <input type="email" placeholder="Masukkan email Anda" value={news} onChange={(e) => setNews(e.target.value)} required />
              <button type="submit" className="vc-btn vc-btn-accent vc-btn-lg" disabled={newsState.loading}>
                {newsState.loading ? "Mengirim..." : "Subscribe"}
              </button>
            </form>
            {newsState.msg && <div className={`vc-news-msg ${newsState.ok ? "ok" : "err"}`}>{newsState.msg}</div>}
            <div className="vc-tech">
              <span><FaReact /> Frontend: <b>React 19</b></span>
              <span><SiSupabase /> Backend: <b>Supabase</b></span>
              <span><SiPostgresql /> Database: <b>PostgreSQL</b></span>
              <span><FaShieldAlt /> Auth: <b>Supabase Auth</b></span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section id="contact" className="vc-section">
        <div className="vc-container">
          <div className="vc-contact-grid">
            <div className="vc-contact-info vc-reveal">
              <span className="vc-eyebrow">Kontak</span>
              <h2>Hubungi kami</h2>
              <p>Punya pertanyaan seputar layanan atau peliharaan Anda? Kirim pesan, kami balas secepatnya.</p>
              <ul className="vc-contact-list">
                <li><span className="ic"><FaEnvelope /></span><div><b>Email</b><span>hello@vetcare.id</span></div></li>
                <li><span className="ic"><FaPhoneAlt /></span><div><b>Telepon</b><span>+62 21 1234 5678</span></div></li>
                <li><span className="ic"><FaMapMarkerAlt /></span><div><b>Lokasi</b><span>Jakarta, Indonesia</span></div></li>
              </ul>
            </div>

            <form className="vc-contact-card vc-reveal" onSubmit={handleContact}>
              <div className="vc-field">
                <label>Nama</label>
                <input type="text" placeholder="Nama Anda" value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })} required />
              </div>
              <div className="vc-field">
                <label>Email</label>
                <input type="email" placeholder="email@anda.com" value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })} required />
              </div>
              <div className="vc-field">
                <label>Pesan</label>
                <textarea placeholder="Tulis pesan Anda..." value={contact.message}
                  onChange={(e) => setContact({ ...contact, message: e.target.value })} required />
              </div>
              <button type="submit" className="vc-btn vc-btn-primary vc-btn-lg" style={{ width: "100%" }} disabled={contactState.loading}>
                {contactState.loading ? "Mengirim..." : "Kirim Pesan"}
              </button>
              {contactState.msg && <div className={`vc-form-msg ${contactState.ok ? "ok" : "err"}`}>{contactState.msg}</div>}
            </form>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="vc-footer">
        <div className="vc-container">
          <div className="vc-footer-grid">
            <div className="vc-footer-about">
              <a href="#home" className="vc-logo">
                <span className="vc-logo-mark"><FaPaw /></span>
                <span className="vc-logo-text"><b>VetCare</b><span>Perawatan Hewan Kesayangan</span></span>
              </a>
              <p>Rawat hewan kesayangan lebih mudah, cepat, dan terpercaya. Daftarkan peliharaan, booking jadwal, pantau rekam medis, dan bayar online dalam satu aplikasi.</p>
              <div className="vc-footer-socials">
                <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                <a href="#" aria-label="Instagram"><FaInstagram /></a>
                <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
              </div>
            </div>
            <div className="vc-footer-col">
              <h4>Layanan</h4>
              <ul>
                <li><a href="#features">Layanan</a></li>
                <li><a href="#workflow">Cara Kerja</a></li>
                <li><a href="#pricing">Keanggotaan</a></li>
              </ul>
            </div>
            <div className="vc-footer-col">
              <h4>Kontak</h4>
              <ul>
                <li><a href="mailto:hello@vetcare.id">hello@vetcare.id</a></li>
                <li><a href="tel:+622112345678">+62 21 1234 5678</a></li>
                <li><a href="#contact">Form Kontak</a></li>
              </ul>
            </div>
            <div className="vc-footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="vc-footer-bottom">© 2026 VetCare. All rights reserved.</div>
        </div>
      </footer>

      {/* ============ LIVE CHAT WIDGET ============ */}
      <div className="vc-chat">
        {chatOpen && (
          <div className="vc-chat-box vc-glass">
            <div className="vc-chat-head">
              <span className="vc-chat-ava"><FaPaw /></span>
              <div>
                <b>VetCare Assistant</b>
                <span className="vc-chat-status">● Online</span>
              </div>
              <button className="vc-chat-close" onClick={() => setChatOpen(false)} aria-label="Tutup chat"><FaTimes /></button>
            </div>
            <div className="vc-chat-body">
              <div className="vc-chat-bubble bot">Halo! 👋 Ada yang bisa kami bantu soal perawatan hewan kesayangan Anda?</div>
              <div className="vc-chat-bubble bot">Anda bisa booking jadwal, tanya layanan, atau konsultasi awal gratis.</div>
            </div>
            <div className="vc-chat-actions">
              <a className="vc-btn vc-btn-primary vc-btn-sm" href="#estimasi" onClick={() => setChatOpen(false)}>
                <FaComments /> Konsultasi Gratis
              </a>
              <a className="vc-chat-wa" href="https://wa.me/622112345678" target="_blank" rel="noreferrer">
                <FaWhatsapp /> Chat WhatsApp
              </a>
            </div>
          </div>
        )}
        <button className={`vc-chat-fab ${chatOpen ? "open" : ""}`} onClick={() => setChatOpen((o) => !o)} aria-label="Buka live chat">
          {chatOpen ? <FaTimes /> : <FaComments />}
        </button>
      </div>

      {/* ============ PROMO MODAL (muncul setelah 5 detik) ============ */}
      {promoOpen && (
        <div className="vc-promo-overlay" onClick={() => setPromoOpen(false)}>
          <div className="vc-promo vc-glass" onClick={(e) => e.stopPropagation()}>
            <button className="vc-promo-close" onClick={() => setPromoOpen(false)} aria-label="Tutup promo"><FaTimes /></button>
            <span className="vc-promo-ic"><FaGift /></span>
            <span className="vc-promo-tag">Khusus Member Baru</span>
            <h3>Diskon 20% Pemeriksaan Pertama</h3>
            <p>Daftar sekarang dan dapatkan potongan untuk kunjungan pertama peliharaan Anda.</p>
            <Link to="/register" className="vc-btn vc-btn-primary vc-btn-lg" onClick={() => setPromoOpen(false)}>
              Klaim Sekarang <FaArrowRight />
            </Link>
            <button className="vc-promo-skip" onClick={() => setPromoOpen(false)}>Nanti saja</button>
          </div>
        </div>
      )}
    </div>
  );
}
