/**
 * Format helper untuk tanggal & mata uang yang ikut bahasa.
 *
 * Tanggal di data ditulis dalam format Indonesia ("10 Mei 2026").
 * Saat lang === "en", kita konversi ke "10 May 2026".
 */

const MONTH_ID_TO_EN = {
  Jan: "Jan",
  Feb: "Feb",
  Mar: "Mar",
  Apr: "Apr",
  Mei: "May",
  Jun: "Jun",
  Jul: "Jul",
  Agu: "Aug",
  Agust: "Aug",
  Agus: "Aug",
  Agust: "Aug",
  Sep: "Sep",
  Okt: "Oct",
  Nov: "Nov",
  Des: "Dec",
};

const MONTH_EN_TO_ID = {
  Jan: "Jan",
  Feb: "Feb",
  Mar: "Mar",
  Apr: "Apr",
  May: "Mei",
  Jun: "Jun",
  Jul: "Jul",
  Aug: "Agu",
  Sep: "Sep",
  Oct: "Okt",
  Nov: "Nov",
  Dec: "Des",
};

/**
 * Konversi tanggal "DD MMM YYYY" antara ID dan EN.
 * Kalau format tidak dikenali, kembalikan apa adanya.
 */
export function formatDate(value, lang = "id") {
  if (!value || typeof value !== "string") return value ?? "";

  const parts = value.trim().split(/\s+/);
  if (parts.length !== 3) return value;

  const [day, monthRaw, year] = parts;
  let month = monthRaw;

  if (lang === "en") {
    month = MONTH_ID_TO_EN[monthRaw] ?? MONTH_EN_TO_ID[monthRaw] ?? monthRaw;
  } else {
    month = MONTH_EN_TO_ID[monthRaw] ?? monthRaw;
  }

  return `${day} ${month} ${year}`;
}

/**
 * Format angka jadi mata uang.
 *  - id: "Rp 1.500.000"
 *  - en: "$ 1,500,000"  (estimasi sederhana, tetap pakai jumlah Rupiah)
 */
export function formatCurrency(value, lang = "id") {
  if (typeof value !== "number") return value;

  const formatter = new Intl.NumberFormat(lang === "en" ? "en-US" : "id-ID");
  const symbol = lang === "en" ? "Rp" : "Rp"; // tetap Rupiah karena ini klinik di ID
  return `${symbol} ${formatter.format(value)}`;
}
