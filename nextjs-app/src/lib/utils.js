export const MONTHS_UR = [
  "جنوری", "فروری", "مارچ", "اپریل", "مئی", "جون",
  "جولائی", "اگست", "ستمبر", "اکتوبر", "نومبر", "دسمبر",
];

export function fmt(n) {
  return Math.round(Number(n) || 0).toLocaleString("en-US");
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function monthSummary(month, year, shops, paymentsByKey) {
  let total = 0, collected = 0;
  for (const s of shops) {
    if (s.status !== "rented") continue;
    const p = paymentsByKey.get(`${s._id}_${month}_${year}`);
    total += p ? p.total_rent : s.monthly_rent;
    collected += p ? p.paid_amount : 0;
  }
  return { total, collected, due: Math.max(total - collected, 0) };
}

export function yearSummary(year, shops, paymentsByKey) {
  let total = 0, collected = 0;
  for (let m = 1; m <= 12; m++) {
    const s = monthSummary(m, year, shops, paymentsByKey);
    total += s.total;
    collected += s.collected;
  }
  return { total, collected, due: Math.max(total - collected, 0) };
}

export function buildPaymentIndex(payments) {
  const map = new Map();
  for (const p of payments) {
    map.set(`${p.shop_id}_${p.month}_${p.year}`, p);
  }
  return map;
}

// صرف وہ payment records رکھیں جن کی دکان اب بھی موجود ہے — حذف شدہ دکانوں کے
// پرانے (orphan) ریکارڈز کبھی بھی ٹوٹل میں شامل نہ ہوں، چاہے وہ database میں
// کسی وجہ سے رہ گئے ہوں۔
export function filterValidPayments(payments, shops) {
  const validIds = new Set(shops.map((s) => String(s._id)));
  return payments.filter((p) => validIds.has(String(p.shop_id)));
}
