"use client";
import { useEffect, useState } from "react";
import { MONTHS_UR, fmt, filterValidPayments } from "@/lib/utils";

export default function BackdatedRentPage() {
  const [shops, setShops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState({ market_name: "روشن مارکیٹ" });
  const [loading, setLoading] = useState(true);

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
  const shopMap = new Map(shops.map((s) => [String(s._id), s]));

  const backdated = filterValidPayments(payments, shops)
    .filter((p) => !(p.month === cm && p.year === cy))
    .map((p) => ({ ...p, shop: shopMap.get(String(p.shop_id)) }))
    .filter((p) => p.shop)
    .sort((a, b) => (b.year - a.year) || (b.month - a.month));

  function downloadCSV() {
    let csv = "مہینہ,سال,دکان نمبر,دکان دار,کل کرایہ,وصول شدہ,بقایا,حیثیت,تاریخ,طریقہ\n";
    backdated.forEach((p) => {
      const due = Math.max(p.total_rent - p.paid_amount, 0);
      csv += `${MONTHS_UR[p.month - 1]},${p.year},${p.shop.number},${p.shop.tenant_name},${p.total_rent},${p.paid_amount},${due},${due <= 0 ? "ادا شدہ" : "بقایا"},${p.payment_date || "—"},${p.method}\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "backdated-rent.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function printPDF() {
    const rows = backdated.map((p) => {
      const due = Math.max(p.total_rent - p.paid_amount, 0);
      return `<tr><td>${MONTHS_UR[p.month - 1]} ${p.year}</td><td>${p.shop.number}</td><td>${p.shop.tenant_name}</td><td>${fmt(p.total_rent)}</td><td>${fmt(p.paid_amount)}</td><td>${fmt(due)}</td><td>${due <= 0 ? "ادا شدہ" : "بقایا"}</td></tr>`;
    }).join("");
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html lang="ur" dir="rtl"><head><meta charset="UTF-8"><title>پرانے کرائے</title>
      <style>body{font-family:sans-serif; direction:rtl; padding:24px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ccc; padding:8px; text-align:right; font-size:13px;} th{background:#eef9f3;}</style>
      </head><body><h2>🏪 ${settings.market_name} — پرانے کرائے کا ریکارڈ</h2>
      <table><thead><tr><th>مہینہ</th><th>دکان نمبر</th><th>دکان دار</th><th>کل کرایہ</th><th>وصول شدہ</th><th>بقایا</th><th>حیثیت</th></tr></thead><tbody>${rows}</tbody></table>
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  return (
    <div>
      <h1 className="text-2xl mb-2">🗂️ پرانے کرائے (Backdated Rent)</h1>
      <p className="text-inksoft text-sm mb-5">یہاں صرف وہ کرایہ ریکارڈز نظر آتے ہیں جو موجودہ مہینے/سال کے علاوہ کسی اور مہینے کے ہیں۔</p>

      <div className="flex gap-2 mb-5">
        <button className="btn btn-primary" onClick={downloadCSV}>⬇️ Excel (CSV) ڈاؤن لوڈ</button>
        <button className="btn btn-ghost" onClick={printPDF}>🖨️ PDF (Print)</button>
      </div>

      {backdated.length === 0 ? (
        <p className="text-inksoft">ابھی تک کوئی پرانا/بیک ڈیٹ کرایہ ریکارڈ موجود نہیں۔</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-greenbg text-inksoft">
                <th className="p-2 text-right">مہینہ</th>
                <th className="p-2 text-right">دکان نمبر</th>
                <th className="p-2 text-right">دکان دار</th>
                <th className="p-2 text-right">کل کرایہ</th>
                <th className="p-2 text-right">وصول شدہ</th>
                <th className="p-2 text-right">بقایا</th>
                <th className="p-2 text-right">حیثیت</th>
                <th className="p-2 text-right">تاریخ</th>
                <th className="p-2 text-right">طریقہ</th>
              </tr>
            </thead>
            <tbody>
              {backdated.map((p) => {
                const due = Math.max(p.total_rent - p.paid_amount, 0);
                return (
                  <tr key={p._id} className="border-b border-border2">
                    <td className="p-2">{MONTHS_UR[p.month - 1]} {p.year}</td>
                    <td className="p-2 num">{p.shop.number}</td>
                    <td className="p-2">{p.shop.tenant_name}</td>
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
      )}
    </div>
  );
}
