"use client";
import { useEffect, useState } from "react";
import { MONTHS_UR, fmt } from "@/lib/utils";

export default function LedgerPage() {
  const [shops, setShops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState({ market_name: "روشن مارکیٹ", collector_name: "" });
  const [loading, setLoading] = useState(true);
  const [pickerQuery, setPickerQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [period, setPeriod] = useState("month");
  const [docMonth, setDocMonth] = useState(new Date().getMonth() + 1);
  const [docYear, setDocYear] = useState(new Date().getFullYear());
  const [deletingId, setDeletingId] = useState(null);

  function load() {
    Promise.all([
      fetch("/api/shops").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([s, p, st]) => { setShops(s); setPayments(p); setSettings(st); setLoading(false); });
  }
  useEffect(load, []);

  if (loading) return <div className="text-inksoft">لوڈ ہو رہا ہے...</div>;

  const filteredShops = shops.filter((s) => {
    const q = pickerQuery.toLowerCase();
    return !q || s.number.toLowerCase().includes(q) || s.tenant_name.toLowerCase().includes(q);
  });

  async function handleDeletePayment(payment, shop) {
    if (!confirm(`کیا آپ ${shop.tenant_name} کی ${MONTHS_UR[payment.month - 1]} ${payment.year} کی وصولی حذف کرنا چاہتے ہیں؟`)) return;
    setDeletingId(payment._id);
    try {
      const res = await fetch(`/api/payments/${payment._id}`, { method: "DELETE" });
      if (res.ok) {
        setPayments((prev) => prev.filter((p) => p._id !== payment._id));
      } else {
        alert("حذف کرنے میں خرابی ہوئی۔");
      }
    } finally {
      setDeletingId(null);
    }
  }

  function buildTenantData(shop) {
    const history = payments.filter((p) => p.shop_id === String(shop._id)).sort((a, b) => (b.year - a.year) || (b.month - a.month));
    const totalPaid = history.reduce((a, p) => a + p.paid_amount, 0);
    const totalRentAllTime = history.reduce((a, p) => a + p.total_rent, 0);
    const totalDue = Math.max(totalRentAllTime - totalPaid, 0);
    const years = [...new Set(history.map((p) => p.year))].sort((a, b) => b - a);

    const today = new Date();
    const cm = today.getMonth() + 1, cy = today.getFullYear();
    // سالانہ کرایہ ہمیشہ ماہانہ کرایہ × 12 کے حساب سے (نہ کہ صرف موجود ریکارڈز کا مجموعہ)
    const thisYearTotal = (shop.monthly_rent || 0) * 12;
    const thisYearPaid = history.filter((p) => p.year === cy).reduce((a, p) => a + p.paid_amount, 0);
    const thisYearDue = Math.max(thisYearTotal - thisYearPaid, 0);
    const currentMonthRecord = history.find((p) => p.month === cm && p.year === cy);
    const currentMonthDue = currentMonthRecord
      ? Math.max(currentMonthRecord.total_rent - currentMonthRecord.paid_amount, 0)
      : shop.monthly_rent;

    return { history, totalPaid, totalDue, years, thisYearTotal, thisYearPaid, thisYearDue, currentMonthRecord, currentMonthDue };
  }

  function downloadCSV(shop, history) {
    let csv = "مہینہ,سال,کل کرایہ,وصول شدہ,بقایا,تاریخ,طریقہ\n";
    history.forEach((p) => {
      csv += `${MONTHS_UR[p.month - 1]},${p.year},${p.total_rent},${p.paid_amount},${Math.max(p.total_rent - p.paid_amount, 0)},${p.payment_date || "—"},${p.method}\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ledger_${shop.number}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadDocument(shop, history, years) {
    let docRows = history, periodLabel = "مکمل کھاتہ";
    if (period === "month") {
      docRows = history.filter((p) => p.month === docMonth && p.year === docYear);
      periodLabel = `${MONTHS_UR[docMonth - 1]} ${docYear}`;
    } else if (period === "year") {
      docRows = history.filter((p) => p.year === docYear);
      periodLabel = `سال ${docYear}`;
    }
    const sorted = [...docRows].sort((a, b) => (a.year - b.year) || (a.month - b.month));
    const rowsHtml = sorted.length
      ? sorted.map((p) => `<tr><td>${MONTHS_UR[p.month - 1]} ${p.year}</td><td>${fmt(p.total_rent)}</td><td>${fmt(p.paid_amount)}</td><td>${fmt(Math.max(p.total_rent - p.paid_amount, 0))}</td><td>${p.payment_date || "—"}</td><td>${p.method}</td></tr>`).join("")
      : `<tr><td colspan="6" style="text-align:center;">اس مدت میں کوئی ریکارڈ نہیں</td></tr>`;
    const dTotal = sorted.reduce((a, p) => a + p.total_rent, 0);
    const dPaid = sorted.reduce((a, p) => a + p.paid_amount, 0);
    const dDue = Math.max(dTotal - dPaid, 0);

    const html = `<!DOCTYPE html><html lang="ur" dir="rtl"><head><meta charset="UTF-8"><style>
@page{size:A4; margin:18mm;}
body{font-family:'Noto Naskh Arabic','Segoe UI',sans-serif; direction:rtl; padding:30px; color:#173226;}
h1{color:#2f8a60; font-size:22px; margin-bottom:2px;}
.sub{color:#666; margin-bottom:18px;}
table{width:100%; border-collapse:collapse; margin-top:16px;}
th,td{border:1px solid #ccc; padding:8px 10px; text-align:right; font-size:13px;}
th{background:#eef9f3;}
.info{margin-bottom:6px; font-size:14px;}
.totals{margin-top:18px; font-size:15px; font-weight:bold;}
.stamp{margin-top:40px; font-size:13px; color:#666;}
</style></head><body>
<h1>🏪 ${settings.market_name} — دکان دار کھاتہ</h1>
<div class="sub">مدت: ${periodLabel} — بنایا گیا: ${new Date().toLocaleDateString("en-GB")}</div>
<div class="info"><b>دکان نمبر:</b> ${shop.number} &nbsp; | &nbsp; <b>دکان کا نام:</b> ${shop.name}</div>
<div class="info"><b>دکان دار کا نام:</b> ${shop.tenant_name} &nbsp; | &nbsp; <b>موبائل:</b> ${shop.mobile || "—"}</div>
<div class="info"><b>ماہانہ کرایہ:</b> Rs ${fmt(shop.monthly_rent)}</div>
<table><thead><tr><th>مہینہ</th><th>کل کرایہ</th><th>وصول شدہ</th><th>بقایا</th><th>تاریخ</th><th>طریقہ</th></tr></thead>
<tbody>${rowsHtml}</tbody></table>
<div class="totals">کل کرایہ: Rs ${fmt(dTotal)} &nbsp; | &nbsp; کل وصول شدہ: Rs ${fmt(dPaid)} &nbsp; | &nbsp; کل بقایا: Rs ${fmt(dDue)}</div>
<div class="stamp">کرایہ وصول کرنے والا: ${settings.collector_name}</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kata_${shop.number}_${periodLabel.replace(/\s/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="text-2xl mb-5">📒 دکان دار کھاتہ</h1>
      <input className="field-input mb-4" placeholder="🔎 دکان نمبر یا نام لکھیں..." value={pickerQuery} onChange={(e) => setPickerQuery(e.target.value)} />

      <div className="space-y-3">
        {filteredShops.map((shop) => {
          const isOpen = expandedId === shop._id;
          const data = isOpen ? buildTenantData(shop) : null;

          return (
            <div key={shop._id} className="card overflow-hidden">
              <button
                onClick={() => setExpandedId(isOpen ? null : shop._id)}
                className={`w-full p-4 text-right flex justify-between items-center ${isOpen ? "bg-greenbg" : ""}`}
              >
                <div>
                  <span className="badge bg-greenbg text-green-700 num ml-2">دکان # {shop.number}</span>
                  <b>{shop.tenant_name}</b>
                  <span className="text-inksoft text-sm"> — {shop.name}</span>
                </div>
                <span className="num text-blue-600 font-bold">{isOpen ? "▲ بند کریں" : `Rs ${fmt(shop.monthly_rent)} ▼`}</span>
              </button>

              {isOpen && data && (
                <div className="p-5 border-t border-border2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="card p-3"><div className="text-xs text-inksoft">ماہانہ کرایہ</div><div className="num font-bold">Rs {fmt(shop.monthly_rent)}</div></div>
                    <div className="card p-3"><div className="text-xs text-inksoft">اس سال کا کل کرایہ (12 مہینے)</div><div className="num font-bold">Rs {fmt(data.thisYearTotal)}</div></div>
                    <div className="card p-3"><div className="text-xs text-inksoft">اس سال وصول شدہ</div><div className="num font-bold text-green-600">Rs {fmt(data.thisYearPaid)}</div></div>
                    <div className="card p-3"><div className="text-xs text-inksoft">اس سال بقایا</div><div className="num font-bold text-red2">Rs {fmt(data.thisYearDue)}</div></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                    <div className="card p-3">
                      <div className="text-xs text-inksoft">موجودہ مہینے کی حیثیت</div>
                      <div className="num font-bold">
                        {data.currentMonthDue <= 0 && data.currentMonthRecord ? <span className="badge badge-paid">✔ ادا شدہ</span> : <span className="badge badge-due">بقایا Rs {fmt(data.currentMonthDue)}</span>}
                      </div>
                    </div>
                    <div className="card p-3"><div className="text-xs text-inksoft">کل وصول شدہ (ہمیشہ سے)</div><div className="num font-bold text-green-600">Rs {fmt(data.totalPaid)}</div></div>
                    <div className="card p-3"><div className="text-xs text-inksoft">کل بقایا (ہمیشہ سے)</div><div className="num font-bold text-red2">Rs {fmt(data.totalDue)}</div></div>
                  </div>

                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-greenbg text-inksoft"><th className="p-2 text-right">مہینہ</th><th className="p-2 text-right">کل کرایہ</th><th className="p-2 text-right">وصول شدہ</th><th className="p-2 text-right">بقایا</th><th className="p-2 text-right">تاریخ</th><th className="p-2 text-right">طریقہ</th><th className="p-2 text-right">عمل</th></tr></thead>
                      <tbody>
                        {data.history.length === 0 && <tr><td colSpan={7} className="text-center p-4 text-inksoft">ابھی تک کوئی ادائیگی درج نہیں ہوئی۔</td></tr>}
                        {data.history.map((p) => {
                          const due = Math.max(p.total_rent - p.paid_amount, 0);
                          return (
                            <tr key={p._id} className="border-b border-border2">
                              <td className="p-2">{MONTHS_UR[p.month - 1]} {p.year}</td>
                              <td className="p-2 num">Rs {fmt(p.total_rent)}</td>
                              <td className="p-2 num">Rs {fmt(p.paid_amount)}</td>
                              <td className="p-2 num">Rs {fmt(due)}</td>
                              <td className="p-2">{p.payment_date || "—"}</td>
                              <td className="p-2">{p.method}</td>
                              <td className="p-2">
                                <button
                                  className="btn btn-danger px-3 py-1"
                                  disabled={deletingId === p._id}
                                  onClick={() => handleDeletePayment(p, shop)}
                                >
                                  {deletingId === p._id ? "..." : "🗑️"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {data.history.length > 0 && (
                    <>
                      <h3 className="text-base mb-3">📄 دستاویز (Document) ڈاؤن لوڈ کریں</h3>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {[["month", "ایک مہینہ"], ["year", "پورا سال"], ["all", "مکمل کھاتہ"]].map(([val, label]) => (
                          <button key={val} onClick={() => setPeriod(val)} className={`btn ${period === val ? "btn-primary" : "btn-ghost"}`}>{label}</button>
                        ))}
                      </div>
                      {period === "month" && (
                        <div className="flex gap-2 mb-3">
                          <select className="field-input" value={docMonth} onChange={(e) => setDocMonth(Number(e.target.value))}>
                            {MONTHS_UR.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                          </select>
                          <select className="field-input" value={docYear} onChange={(e) => setDocYear(Number(e.target.value))}>
                            {data.years.map((y) => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      )}
                      {period === "year" && (
                        <select className="field-input mb-3" value={docYear} onChange={(e) => setDocYear(Number(e.target.value))}>
                          {data.years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <button className="btn btn-primary" onClick={() => downloadDocument(shop, data.history, data.years)}>⬇️ دستاویز (PDF) ڈاؤن لوڈ کریں</button>
                        <button className="btn btn-ghost" onClick={() => downloadCSV(shop, data.history)}>⬇️ Excel (CSV) ڈاؤن لوڈ کریں</button>
                      </div>
                      <p className="text-[12px] text-inksoft mt-2">فائل کھلنے کے بعد براؤزر میں Print کریں اور 'Save as PDF' منتخب کریں۔</p>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
