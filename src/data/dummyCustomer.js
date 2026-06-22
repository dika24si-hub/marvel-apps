// src/data/dummyCustomer.js
// Sumber data dummy. Nanti tinggal ganti tiap export ini dengan
// pemanggilan Supabase di lib/services.js tanpa mengubah komponen.

export const dummyPets = [
  {
    id: "p1",
    name: "Momo",
    species: "Kucing",
    breed: "Persian",
    ageText: "2 Tahun",
    weightKg: 4.2,
    photo: "https://placekitten.com/300/300",
    vaccineStatus: "lengkap", // lengkap | parsial | belum
    healthStatus: "healthy",  // healthy | sick | recovery
  },
  {
    id: "p2",
    name: "Bruno",
    species: "Anjing",
    breed: "Golden Retriever",
    ageText: "3 Tahun",
    weightKg: 28.5,
    photo: "https://placedog.net/300/300?id=1",
    vaccineStatus: "parsial",
    healthStatus: "recovery",
  },
  {
    id: "p3",
    name: "Kiki",
    species: "Kucing",
    breed: "Anggora",
    ageText: "1 Tahun",
    weightKg: 3.1,
    photo: "https://placekitten.com/301/301",
    vaccineStatus: "belum",
    healthStatus: "healthy",
  },
];

export const dummyAppointments = [
  {
    id: "a1",
    petName: "Momo",
    doctorName: "drh. Sari",
    dateTime: "2026-06-22T10:00:00",
    reason: "Vaksin tahunan",
    status: "upcoming",
  },
  {
    id: "a2",
    petName: "Bruno",
    doctorName: "drh. Andi",
    dateTime: "2026-06-25T14:30:00",
    reason: "Kontrol pasca operasi",
    status: "upcoming",
  },
];

export const dummyActivities = [
  { id: "ac1", type: "payment",  title: "Pembayaran berhasil", desc: "INV-20260615 • Rp 350.000", at: "2026-06-16T09:12:00" },
  { id: "ac2", type: "exam_done", title: "Pemeriksaan selesai", desc: "Momo • drh. Sari", at: "2026-06-15T11:00:00" },
  { id: "ac3", type: "booking",  title: "Jadwal dibuat", desc: "Bruno • Kontrol", at: "2026-06-14T16:40:00" },
  { id: "ac4", type: "vaccine",  title: "Vaksin Rabies dilakukan", desc: "Kiki", at: "2026-06-10T10:30:00" },
];

export const dummyPayments = [
  { id: "pay1", invoiceNo: "INV-2026-001", petName: "Momo", service: "Vaksin + Konsultasi", amount: 250000, status: "paid",    date: "2026-06-15" },
  { id: "pay2", invoiceNo: "INV-2026-002", petName: "Bruno", service: "Kontrol pasca operasi", amount: 200000, status: "paid",    date: "2026-05-20" },
  { id: "pay3", invoiceNo: "INV-2026-003", petName: "Kiki",  service: "Grooming",             amount: 150000, status: "paid",    date: "2026-04-20" },
  { id: "pay4", invoiceNo: "INV-2026-004", petName: "Momo",  service: "Pemeriksaan Umum",      amount: 180000, status: "paid",    date: "2026-03-12" },
];

export const dummyPromos = [
  { id: "promo1", title: "Diskon Grooming 20%",      desc: "Untuk semua paket grooming",       discount: 20, validUntil: "2026-07-31" },
  { id: "promo2", title: "Paket Vaksin Tahunan",     desc: "Hemat untuk vaksinasi lengkap",    discount: 0,  validUntil: "2026-08-31" },
  { id: "promo3", title: "Promo Khusus Gold Member", desc: "Benefit eksklusif tier Gold",      discount: 0,  validUntil: "2026-12-31" },
];

// Helper ringkasan untuk stat cards
export const dummyStats = {
  totalPets: dummyPets.length,
  upcomingVisits: dummyAppointments.filter((a) => a.status === "upcoming").length,
  pendingBills: dummyPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0),
  activePromos: dummyPromos.length,
};
export const dummyMedicalRecords = [
  {
    id: "mr1", visitDate: "2026-06-15", petName: "Momo", doctorName: "drh. Sari",
    complaint: "Nafsu makan turun", diagnosis: "Infeksi ringan",
    treatment: "Injeksi antibiotik", medicine: "Amoxicillin 250mg",
  },
  {
    id: "mr2", visitDate: "2026-05-20", petName: "Bruno", doctorName: "drh. Andi",
    complaint: "Pincang kaki belakang", diagnosis: "Cedera otot",
    treatment: "Terapi & istirahat", medicine: "Anti-inflamasi",
  },
];

export const dummyNotifications = [
  { id: "n1", type: "vaccine",     title: "Vaksin akan jatuh tempo", message: "Vaksin Momo jatuh tempo 5 hari lagi", createdAt: "2026-06-20" },
  { id: "n2", type: "appointment", title: "Jadwal pemeriksaan besok", message: "Bruno • drh. Andi • 14:30", createdAt: "2026-06-19" },
  { id: "n3", type: "payment",     title: "Pembayaran belum selesai", message: "INV-20260620 menunggu pembayaran", createdAt: "2026-06-18" },
];
// Statistik akun yang dipakai untuk MENGHITUNG tier membership otomatis
// (lihat src/data/membership.js -> evaluateMembership). Nanti tinggal
// diganti dengan data nyata dari Supabase tanpa mengubah komponen.
export const dummyMemberStats = {
  hasAccount: true,
  emailVerified: true,
  phoneVerified: true,
  petCount: dummyPets.length,        // syarat Basic: minimal 1 hewan
  joinDate: "2025-09-15",            // ~9 bulan lalu (per 2026-06): lolos Gold
  examCount: 12,                     // minimal 3 (Silver) / 10 (Gold)
  totalSpent: 2350000,               // minimal Rp500rb (Silver) / Rp2jt (Gold)
};

export const dummyMembership = {
  // tier kini DIHITUNG dari dummyMemberStats; field ini hanya fallback.
  tier: "gold",
  points: 1250,
  activeUntil: "2026-12-31",         // masa aktif keanggotaan
  nextRewardAt: 2000,                // ambang poin untuk reward berikutnya
  payment: { method: "Visa", last4: "0341", expiry: "07/28" },
  billing: {
    name: "Dika Pratama",
    address: "Jl. Merdeka No. 10, Jakarta 10110",
  },
};

// Daftar dokter untuk pilihan booking pemeriksaan.
export const dummyDoctors = ["drh. Sari", "drh. Andi", "drh. Sarah", "drh. Budi"];

// Pengingat vaksin yang akan datang (dipakai untuk notifikasi & reminder).
export const dummyVaccineReminders = [
  { id: "vr1", vaccine: "Rabies", petName: "Bruno", dueDate: "2026-06-30" },
];

// Timeline rekam medis ringkas (3 entri terbaru untuk dashboard).
export const dummyTimeline = [
  { id: "t1", date: "2026-06-15", title: "Vaksin Rabies",    petName: "Momo" },
  { id: "t2", date: "2026-05-10", title: "Pemeriksaan Umum", petName: "Bruno" },
  { id: "t3", date: "2026-04-20", title: "Grooming",         petName: "Kiki" },
];

// Artikel edukasi untuk pemilik hewan.
export const dummyArticles = [
  { id: "art1", title: "Cara Menjaga Kesehatan Kucing", category: "Kucing", emoji: "🐱" },
  { id: "art2", title: "Pentingnya Vaksin Rabies",      category: "Vaksin", emoji: "💉" },
  { id: "art3", title: "Tips Merawat Anak Anjing",      category: "Anjing", emoji: "🐶" },
];