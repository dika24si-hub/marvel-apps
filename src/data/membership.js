// src/data/membership.js
// =====================================================================
// LOGIKA MEMBERSHIP (Basic / Silver / Gold)
//
// Tier dihitung otomatis dari statistik akun (lama keanggotaan, jumlah
// pemeriksaan, total transaksi). Seorang member menempati tier TERTINGGI
// yang SEMUA syaratnya terpenuhi. Karena syarat Gold lebih berat daripada
// Silver, kualifikasi bersifat bertingkat (memenuhi Gold pasti memenuhi
// Silver), sehingga tier saat ini = tier kualifikasi tertinggi berturut-turut.
// =====================================================================

const RP_500K = 500_000;
const RP_2JT = 2_000_000;

// Selisih bulan penuh antara joinDate dan sekarang.
export function monthsSince(iso, now = new Date()) {
  const d = new Date(iso);
  let months =
    (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months -= 1;
  return Math.max(0, months);
}

// Setiap requirement punya `check(stats)` -> boolean dan `progress(stats)`
// -> teks "X / Y" untuk ditampilkan di UI.
export const MEMBERSHIP_TIERS = [
  {
    key: "basic",
    label: "Basic Member",
    medal: "🥉",
    priceText: "Gratis",
    color: "#b08d57",
    tint: "#f6efe6",
    discount: 0,
    requirements: [
      { key: "account", text: "Membuat akun", check: (s) => !!s.hasAccount },
      {
        key: "verified",
        text: "Verifikasi email / nomor HP",
        check: (s) => !!(s.emailVerified || s.phoneVerified),
      },
      {
        key: "pet",
        text: "Mendaftarkan minimal 1 hewan peliharaan",
        check: (s) => (s.petCount ?? 0) >= 1,
        progress: (s) => `${s.petCount ?? 0} / 1 hewan`,
      },
    ],
    benefits: [
      "Daftar hewan peliharaan",
      "Booking pemeriksaan",
      "Melihat rekam medis",
      "Riwayat pembayaran",
    ],
  },
  {
    key: "silver",
    label: "Silver Member",
    medal: "🥈",
    priceText: null,
    color: "#8a93a0",
    tint: "#eef1f4",
    discount: 5,
    requirements: [
      {
        key: "tenure3",
        text: "Menjadi member minimal 3 bulan",
        check: (s) => monthsSince(s.joinDate) >= 3,
        progress: (s) => `${monthsSince(s.joinDate)} / 3 bulan`,
      },
      {
        key: "exam3",
        text: "Melakukan minimal 3 kali pemeriksaan",
        check: (s) => (s.examCount ?? 0) >= 3,
        progress: (s) => `${s.examCount ?? 0} / 3 pemeriksaan`,
      },
      {
        key: "spend500",
        text: "Total transaksi minimal Rp500.000",
        check: (s) => (s.totalSpent ?? 0) >= RP_500K,
        progress: (s) => `${rupiah(s.totalSpent ?? 0)} / ${rupiah(RP_500K)}`,
      },
    ],
    benefits: [
      "Semua fitur Basic",
      "Reminder vaksin otomatis",
      "Diskon layanan 5%",
      "Prioritas booking",
      "Promo bulanan member",
    ],
  },
  {
    key: "gold",
    label: "Gold Member",
    medal: "🥇",
    priceText: null,
    color: "#e0a72e",
    tint: "#fbf2dc",
    discount: 10,
    requirements: [
      {
        key: "tenure6",
        text: "Menjadi member minimal 6 bulan",
        check: (s) => monthsSince(s.joinDate) >= 6,
        progress: (s) => `${monthsSince(s.joinDate)} / 6 bulan`,
      },
      {
        key: "exam10",
        text: "Melakukan minimal 10 kali pemeriksaan",
        check: (s) => (s.examCount ?? 0) >= 10,
        progress: (s) => `${s.examCount ?? 0} / 10 pemeriksaan`,
      },
      {
        key: "spend2jt",
        text: "Total transaksi minimal Rp2.000.000",
        check: (s) => (s.totalSpent ?? 0) >= RP_2JT,
        progress: (s) => `${rupiah(s.totalSpent ?? 0)} / ${rupiah(RP_2JT)}`,
      },
    ],
    benefits: [
      "Semua fitur Silver",
      "Diskon layanan 10%",
      "Konsultasi online",
      "Promo eksklusif member",
      "Prioritas layanan klinik",
    ],
  },
];

function rupiah(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Evaluasi tier membership dari statistik akun.
 * @param {object} stats - lihat dummyMemberStats
 * @returns {{
 *   tiers: Array,        // semua tier + status requirement-nya
 *   current: object|null,// tier saat ini (null bila syarat Basic belum lengkap)
 *   currentIndex: number,// -1 bila belum jadi member
 *   next: object|null,   // tier berikutnya yang bisa dikejar
 *   nextMetCount: number,// jumlah syarat next yang sudah terpenuhi
 * }}
 */
export function evaluateMembership(stats = {}) {
  const tiers = MEMBERSHIP_TIERS.map((tier) => {
    const requirements = tier.requirements.map((r) => ({
      key: r.key,
      text: r.text,
      met: !!r.check(stats),
      progress: r.progress ? r.progress(stats) : null,
    }));
    const metCount = requirements.filter((r) => r.met).length;
    return {
      ...tier,
      requirements,
      qualified: metCount === requirements.length,
      metCount,
    };
  });

  // Tier saat ini = indeks tertinggi yang qualified secara berturut-turut.
  let currentIndex = -1;
  for (let i = 0; i < tiers.length; i++) {
    if (tiers[i].qualified) currentIndex = i;
    else break;
  }

  const current = currentIndex >= 0 ? tiers[currentIndex] : null;
  const next = tiers[currentIndex + 1] ?? null;

  return {
    tiers,
    current,
    currentIndex,
    next,
    nextMetCount: next ? next.metCount : 0,
  };
}
