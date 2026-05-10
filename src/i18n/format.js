/**
 * Helper formatting yang ikut bahasa aktif.
 * - formatDate: terima "10 Mei 2026" → terjemahkan nama bulan
 * - formatDay: terima "Sen"/"Senin" → terjemahkan
 * - formatAmount: Rupiah dengan locale yang cocok
 */

// Peta bulan ID ↔ panjang & singkatan
const MONTH_MAP = {
  id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/**
 * Terima string tanggal format "DD MMM YYYY" versi ID (mis: "10 Mei 2026")
 * lalu kembalikan versi yang sesuai bahasa `lang`.
 */
export function formatDate(str, lang = "id") {
  if (!str) return str;
  const parts = str.trim().split(/\s+/);
  if (parts.length !== 3) return str;

  const [day, monthId, year] = parts;
  const idx = MONTH_MAP.id.indexOf(monthId);
  if (idx === -1) return str;

  const monthOut = MONTH_MAP[lang]?.[idx] ?? monthId;
  return `${day} ${monthOut} ${year}`;
}

/**
 * Format mata uang (default Rupiah karena semua harga dummy dalam IDR).
 */
export function formatCurrency(n, lang = "id") {
  try {
    const locale = lang === "en" ? "en-US" : "id-ID";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return "Rp " + n.toLocaleString("id-ID");
  }
}

/**
 * Format angka umum.
 */
export function formatNumber(n, lang = "id") {
  const locale = lang === "en" ? "en-US" : "id-ID";
  return new Intl.NumberFormat(locale).format(n);
}
