"use client";
import { useEffect, useState } from "react";
import { MONTHS_UR, fmt } from "@/lib/utils";

export default function LedgerPage() {
  const [shops, setShops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState({ market_name: "روشن مارکیٹ", collector_name: "" });
  const [loading, setLoading] = useState(true);
  const [pickerQuery, setPickerQuery] = useState("");
  const [selectedShop, setSelectedShop] = useState(null);
  const [period, setPeriod] = useState("month");
  const [docMonth, setDocMonth] = useState(new Date().getMonth() + 1);
  const [docYear, setDocYear] = useState(new Date().getFullYear());

  useEffect(() => {
    Promise.all([
      fetch("/api/shops").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([s, p, st]) => { setShops(s); setPayments(p); setSettings(st); setLoading(false); });
  }, []);

  if (loading) return <div className="text-inksoft">لوڈ ہو رہا ہے...</div>;

  const filteredShops = shops.filter((s) => {
    const q = pickerQuery.toLowerCase();
    return !q || s.number.toLowerCase().includes(q) || s.tenant_name.toLowerCase().includes(q);
  });

  const history = selectedShop
    ? payments.filter((p) => p.shop_id === String(selectedShop._id)).sort((a, b) => (b.year - a.year) || (b.month - a.month))
    : [];

  const totalRent = history.reduce((a, p) => a + p.total_rent, 0);
  const totalPaid = history.reduce((a, p) => a + p.paid_amount, 0);
  const totalDue = Math.max(totalRent - totalPaid, 0);
  const years = [...new Set(history.map((p) => p.year))].sort((a, b) => b - a);

  const today = new Date();
  const cm = today.getMonth() + 1, cy = today.getFullYear();
  const thisYearHistory = history.filter((p) => p.year === cy);
  const thisYearTotal = thisYearHistory.reduce((a, p) => a + p.total_rent, 0);
  const thisYearPaid = thisYearHistory.reduce((a, p) => a + p.paid_amount, 0);
  const currentMonthRecord = history.find((p) => p.month === cm && p.year === cy);
  const currentMonthDue = currentMonthRecord
    ? Math.max(currentMonthRecord.total_rent - currentMonthRecord.paid_amount, 0)
    : (selectedShop ? selectedShop.monthly_rent : 0);
  const currentMonthPaid = currentMonthRecord ? currentMonthRecord.paid_amount : 0;

  function downloadCSV() {
    let csv = "مہینہ,سال,کل کرایہ,وصول شدہ,بقایا,تاریخ,طریقہ\n";
    history.forEach((p) => {
      csv += `${MONTHS_UR[p.month - 1]},${p.year},${p.total_rent},${p.paid_amount},${Math.max(p.total_rent - p.paid_amount, 0)},${p.payment_date || "—"},${p.method}\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ledger_${selectedShop.number}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadDocument() {
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
<div class="info"><b>دکان نمبر:</b> ${selectedShop.number} &nbsp; | &nbsp; <b>دکان کا نام:</b> ${selectedShop.name}</div>
<div class="info"><b>دکان دار کا نام:</b> ${selectedShop.tenant_name} &nbsp; | &nbsp; <b>موبائل:</b> ${selectedShop.mobile || "—"}</div>
<div class="info"><b>ماہانہ کرایہ:</b> Rs ${fmt(selectedShop.monthly_rent)}</div>
<table><thead><tr><th>مہینہ</th><th>کل کرایہ</th><th>وصول شدہ</th><th>بقایا</th><th>تاریخ</th><th>طریقہ</th></tr></thead>
<tbody>${rowsHtml}</tbody></table>
<div class="totals">کل کرایہ: Rs ${fmt(dTotal)} &nbsp; | &nbsp; کل وصول شدہ: Rs ${fmt(dPaid)} &nbsp; | &nbsp; کل بقایا: Rs ${fmt(dDue)}</div>
<div class="stamp">کرایہ وصول کرنے والا: ${settings.collector_name}</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kata_${selectedShop.number}_${periodLabel.replace(/\s/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="text-2xl mb-5">📒 دکان دار کھاتہ</h1>

      <div className="card p-5 mb-5">
        <h3 className="text-base mb-3">دکان دار منتخب کریں</h3>
        <input className="field-input mb-4" placeholder="دکان نمبر یا نام لکھیں..." value={pickerQuery} onChange={(e) => setPickerQuery(e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredShops.map((s) => (
            <button key={s._id} onClick={() => setSelectedShop(s)}
              className={`card p-3 text-right hover:shadow-md transition ${selectedShop?._id === s._id ? "ring-2 ring-green-500" : ""}`}>
              <span className="badge bg-greenbg text-green-700 num">دکان # {s.number}</span>
              <h4 className="text-base font-bold mt-2">{s.tenant_name}</h4>
              <p className="text-inksoft text-sm">{s.name}</p>
              <p className="num text-blue-600 font-bold">Rs {fmt(s.monthly_rent)}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedShop && (
        <div className="card p-5">
          <h3 className="text-base mb-1">📒 دکان نمبر <span className="num">{selectedShop.number}</span> — {selectedShop.name}</h3>
          <p className="text-inksoft text-sm mb-4">دکان دار: <b>{selectedShop.tenant_name}</b></p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="card p-3"><div className="text-xs text-inksoft">ماہانہ کرایہ</div><div className="num font-bold">Rs {fmt(selectedShop.monthly_rent)}</div></div>
            <div className="card p-3"><div className="text-xs text-inksoft">اس سال کا کل کرایہ</div><div className="num font-bold">Rs {fmt(thisYearTotal)}</div></div>
            <div className="card p-3"><div className="text-xs text-inksoft">اس سال وصول شدہ</div><div className="num font-bold">Rs {fmt(thisYearPaid)}</div></div>
            <div className="card p-3">
              <div className="text-xs text-inksoft">موجودہ مہینے کی حیثیت</div>
              <div className="num font-bold">
                {currentMonthDue <= 0 && currentMonthRecord ? <span className="badge badge-paid">✔ ادا شدہ</span> : <span className="badge badge-due">بقایا Rs {fmt(currentMonthDue)}</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-5">
            <div className="card p-3"><div className="text-xs text-inksoft">کل وصول شدہ رقم (ہمیشہ سے)</div><div className="num font-bold text-green-600">Rs {fmt(totalPaid)}</div></div>
            <div className="card p-3"><div className="text-xs text-inksoft">کل بقایا رقم (ہمیشہ سے)</div><div className="num font-bold text-red2">Rs {fmt(totalDue)}</div></div>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead><tr className="bg-greenbg text-inksoft"><th className="p-2 text-right">مہینہ</th><th className="p-2 text-right">کل کرایہ</th><th className="p-2 text-right">وصول شدہ</th><th className="p-2 text-right">بقایا</th><th className="p-2 text-right">تاریخ</th><th className="p-2 text-right">طریقہ</th></tr></thead>
              <tbody>
                {history.length === 0 && <tr><td colSpan={6} className="text-center p-4 text-inksoft">ابھی تک کوئی ادائیگی درج نہیں ہوئی۔</td></tr>}
                {history.map((p) => {
                  const due = Math.max(p.total_rent - p.paid_amount, 0);
                  return (
                    <tr key={p._id} className="border-b border-border2">
                      <td className="p-2">{MONTHS_UR[p.month - 1]} {p.year}</td>
                      <td className="p-2 num">Rs {fmt(p.total_rent)}</td>
                      <td className="p-2 num">Rs {fmt(p.paid_amount)}</td>
                      <td className="p-2 num">Rs {fmt(due)}</td>
                      <td className="p-2">{p.payment_date || "—"}</td>
                      <td className="p-2">{p.method}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {history.length > 0 && (
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
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              )}
              {period === "year" && (
                <select className="field-input mb-3" value={docYear} onChange={(e) => setDocYear(Number(e.target.value))}>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              )}
              <button className="btn btn-primary" onClick={downloadDocument}>⬇️ دستاویز (PDF) ڈاؤن لوڈ کریں</button>
              <button className="btn btn-ghost ml-2" onClick={downloadCSV}>⬇️ Excel (CSV) ڈاؤن لوڈ کریں</button>
              <p className="text-[12px] text-inksoft mt-2">فائل کھلنے کے بعد براؤزر میں Print کریں اور 'Save as PDF' منتخب کریں۔</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
