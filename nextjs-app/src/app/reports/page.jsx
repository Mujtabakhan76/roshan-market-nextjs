"use client";
import { useEffect, useState } from "react";
import { fmt, monthSummary, yearSummary, buildPaymentIndex } from "@/lib/utils";

export default function ReportsPage() {
  const [shops, setShops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("month");

  useEffect(() => {
    Promise.all([
      fetch("/api/shops").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
    ]).then(([s, p]) => { setShops(s); setPayments(p); setLoading(false); });
  }, []);

  if (loading) return <div className="text-inksoft">لوڈ ہو رہا ہے...</div>;

  const payIdx = buildPaymentIndex(payments);
  const today = new Date();
  const cm = today.getMonth() + 1, cy = today.getFullYear();
  const summary = filter === "month" ? monthSummary(cm, cy, shops, payIdx) : yearSummary(cy, shops, payIdx);

  const defaulters = [], paidUp = [];
  shops.filter((s) => s.status === "rented").forEach((s) => {
    const p = payIdx.get(`${s._id}_${cm}_${cy}`);
    const total = p ? p.total_rent : s.monthly_rent;
    const paid = p ? p.paid_amount : 0;
    const due = Math.max(total - paid, 0);
    if (due > 0) defaulters.push({ s, due });
    else if (p) paidUp.push({ s, paid });
  });

  return (
    <div>
      <h1 className="text-2xl mb-5">📊 رپورٹس</h1>

      <div className="flex gap-2 mb-5">
        <button className={`btn ${filter === "month" ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter("month")}>اس مہینے</button>
        <button className={`btn ${filter === "year" ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter("year")}>اس سال</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4"><div className="text-xs text-inksoft">کل بننے والا کرایہ</div><div className="text-xl font-bold num">Rs {fmt(summary.total)}</div></div>
        <div className="card p-4"><div className="text-xs text-inksoft">کل وصول شدہ</div><div className="text-xl font-bold num">Rs {fmt(summary.collected)}</div></div>
        <div className="card p-4"><div className="text-xs text-inksoft">کل بقایا</div><div className="text-xl font-bold num">Rs {fmt(summary.due)}</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-4">
          <h3 className="text-base mb-3">🔴 کرایہ نہ دینے والے</h3>
          {defaulters.length === 0 ? <p className="text-inksoft text-sm">کوئی بقایا دار نہیں 🎉</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-inksoft text-right"><th className="p-1">دکان</th><th className="p-1">نام</th><th className="p-1">موبائل</th><th className="p-1">بقایا</th></tr></thead>
              <tbody>
                {defaulters.map(({ s, due }) => (
                  <tr key={s._id} className="border-b border-border2">
                    <td className="p-1 num">{s.number}</td><td className="p-1">{s.tenant_name}</td>
                    <td className="p-1 num">{s.mobile || "—"}</td><td className="p-1 num text-red2 font-bold">Rs {fmt(due)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card p-4">
          <h3 className="text-base mb-3">🟢 مکمل ادائیگی کرنے والے</h3>
          {paidUp.length === 0 ? <p className="text-inksoft text-sm">ابھی تک کوئی نہیں</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-inksoft text-right"><th className="p-1">دکان</th><th className="p-1">نام</th><th className="p-1">موبائل</th><th className="p-1">وصول شدہ</th></tr></thead>
              <tbody>
                {paidUp.map(({ s, paid }) => (
                  <tr key={s._id} className="border-b border-border2">
                    <td className="p-1 num">{s.number}</td><td className="p-1">{s.tenant_name}</td>
                    <td className="p-1 num">{s.mobile || "—"}</td><td className="p-1 num text-green-600 font-bold">Rs {fmt(paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
