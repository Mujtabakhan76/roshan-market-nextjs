"use client";
import { useEffect, useState } from "react";
import { MONTHS_UR, fmt, filterValidPayments } from "@/lib/utils";

export default function BackdatedRentPage() {
  const [shops, setShops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState({ market_name: "روشن مارکیٹ" });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedShop, setSelectedShop] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/shops").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([s, p, st]) => { setShops(s); setPayments(p); setSettings(st); setLoading(false); });
  }, []);

  if (loading) return <div className="text-inksoft">لوڈ ہو رہا ہے...</div>;

  const today = new Date();
  const cm = today.getMonth() + 1, cy = today.getFullYear();
  const validPayments = filterValidPayments(payments, shops);
  const allBackdated = validPayments.filter((p) => !(p.month === cm && p.year === cy));

  const shopsWithBackdated = shops
    .map((s) => ({ shop: s, count: allBackdated.filter((p) => String(p.shop_id) === String(s._id)).length }))
    .filter((x) => x.count > 0)
    .filter((x) => {
      const q = query.toLowerCase();
      return !q || x.shop.number.toLowerCase().includes(q) || x.shop.tenant_name.toLowerCase().includes(q) || (x.shop.mobile || "").includes(q);
    });

  const tenantRecords = selectedShop
    ? allBackdated.filter((p) => String(p.shop_id) === String(selectedShop._id)).sort((a, b) => (b.year - a.year) || (b.month - a.month))
    : [];

  function exportRows(rows, filename) {
    let csv = "دکان نمبر,دکان دار,مہینہ,سال,کل کرایہ,وصول شدہ,بقایا,حیثیت,تاریخ,طریقہ\n";
    rows.forEach((p) => {
      const shop = shops.find((s) => String(s._id) === String(p.shop_id));
      const due = Math.max(p.total_rent - p.paid_amount, 0);
      csv += `${shop?.number || "—"},${shop?.tenant_name || "—"},${MONTHS_UR[p.month - 1]},${p.year},${p.total_rent},${p.paid_amount},${due},${due <= 0 ? "ادا شدہ" : "بقایا"},${p.payment_date || "—"},${p.method}\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  function printRows(rows, title) {
    const html = rows.map((p) => {
      const shop = shops.find((s) => String(s._id) === String(p.shop_id));
      const due = Math.max(p.total_rent - p.paid_amount, 0);
      return `<tr><td>${shop?.number || "—"}</td><td>${shop?.tenant_name || "—"}</td><td>${MONTHS_UR[p.month - 1]} ${p.year}</td><td>${fmt(p.total_rent)}</td><td>${fmt(p.paid_amount)}</td><td>${fmt(due)}</td><td>${due <= 0 ? "ادا شدہ" : "بقایا"}</td></tr>`;
    }).join("");
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html lang="ur" dir="rtl"><head><meta charset="UTF-8"><title>${title}</title>
      <style>body{font-family:sans-serif; direction:rtl; padding:24px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ccc; padding:8px; text-align:right; font-size:13px;} th{background:#eef9f3;}</style>
      </head><body><h2>🏪 ${settings.market_name} — ${title}</h2>
      <table><thead><tr><th>دکان نمبر</th><th>دکان دار</th><th>مہینہ</th><th>کل کرایہ</th><th>وصول شدہ</th><th>بقایا</th><th>حیثیت</th></tr></thead><tbody>${html}</tbody></table>
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  return (
    <div>
      <h1 className="text-2xl mb-2">🗂️ پرانے کرائے (Backdated Rent)</h1>
      <p className="text-inksoft text-sm mb-5">ہر دکاندار کا پرانا کرایہ الگ الگ دیکھیں — موجودہ مہینے کا ریکارڈ یہاں شامل نہیں۔</p>

      <div className="flex flex-wrap gap-2 mb-5">
        <button className="btn btn-ghost" onClick={() => exportRows(allBackdated, "all-backdated-rent.csv")}>⬇️ سب کی مشترکہ رپورٹ (Excel)</button>
        <button className="btn btn-ghost" onClick={() => printRows(allBackdated, "پرانے کرائے — مکمل رپورٹ")}>🖨️ سب کی مشترکہ رپورٹ (PDF)</button>
      </div>

      <div className="card p-5 mb-5">
        <h3 className="text-base mb-3">دکاندار تلاش کریں</h3>
        <input className="field-input mb-4" placeholder="🔎 نام، دکان نمبر یا موبائل نمبر لکھیں..." value={query} onChange={(e) => setQuery(e.target.value)} />
        {shopsWithBackdated.length === 0 ? (
          <p className="text-inksoft text-sm">کسی بھی دکاندار کا پرانا/بیک ڈیٹ کرایہ ریکارڈ موجود نہیں۔</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shopsWithBackdated.map(({ shop, count }) => (
              <button key={shop._id} onClick={() => setSelectedShop(shop)}
                className={`card p-3 text-right hover:shadow-md transition ${selectedShop?._id === shop._id ? "ring-2 ring-green-500" : ""}`}>
                <span className="badge bg-greenbg text-green-700 num">دکان # {shop.number}</span>
                <h4 className="text-base font-bold mt-2">{shop.tenant_name}</h4>
                <p className="text-inksoft text-sm">📱 {shop.mobile || "—"}</p>
                <p className="text-blue-600 text-sm font-bold">{count} پرانے ریکارڈز</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedShop && (
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 className="text-base">📒 دکان # {selectedShop.number} — {selectedShop.tenant_name} کا پرانا کرایہ</h3>
            <div className="flex gap-2">
              <button className="btn btn-ghost" onClick={() => exportRows(tenantRecords, `backdated_${selectedShop.number}.csv`)}>⬇️ Excel</button>
              <button className="btn btn-ghost" onClick={() => printRows(tenantRecords, `${selectedShop.tenant_name} — پرانا کرایہ`)}>🖨️ PDF</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-greenbg text-inksoft">
                  <th className="p-2 text-right">مہینہ</th>
                  <th className="p-2 text-right">کل کرایہ</th>
                  <th className="p-2 text-right">وصول شدہ</th>
                  <th className="p-2 text-right">بقایا</th>
                  <th className="p-2 text-right">حیثیت</th>
                  <th className="p-2 text-right">تاریخ</th>
                  <th className="p-2 text-right">طریقہ</th>
                </tr>
              </thead>
              <tbody>
                {tenantRecords.map((p) => {
                  const due = Math.max(p.total_rent - p.paid_amount, 0);
                  return (
                    <tr key={p._id} className="border-b border-border2">
                      <td className="p-2">{MONTHS_UR[p.month - 1]} {p.year}</td>
                      <td className="p-2 num">Rs {fmt(p.total_rent)}</td>
                      <td className="p-2 num">Rs {fmt(p.paid_amount)}</td>
                      <td className="p-2 num">Rs {fmt(due)}</td>
                      <td className="p-2">{due <= 0 ? <span className="badge badge-paid">✔ ادا شدہ</span> : <span className="badge badge-due">بقایا</span>}</td>
                      <td className="p-2">{p.payment_date || "—"}</td>
                      <td className="p-2">{p.method}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
