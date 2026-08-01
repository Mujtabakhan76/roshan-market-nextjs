"use client";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { BarChartCard, DoughnutCard, CHART_COLORS } from "@/components/Charts";
import { MONTHS_UR, fmt, monthSummary, yearSummary, buildPaymentIndex, filterValidPayments } from "@/lib/utils";

export default function DashboardPage() {
  const [shops, setShops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [marketName, setMarketName] = useState("روشن مارکیٹ");
  const [loading, setLoading] = useState(true);
  const [reportScope, setReportScope] = useState("all");
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  useEffect(() => {
    Promise.all([
      fetch("/api/shops").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/expenses").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([s, p, e, settings]) => {
      setShops(s); setPayments(p); setExpenses(e);
      setMarketName(settings.market_name);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-inksoft">لوڈ ہو رہا ہے...</div>;

  const validPayments = filterValidPayments(payments, shops);
  const payIdx = buildPaymentIndex(validPayments);
  const today = new Date();
  const cm = today.getMonth() + 1, cy = today.getFullYear();
  const totalShops = shops.length;
  const rented = shops.filter((s) => s.status === "rented").length;
  const empty = totalShops - rented;
  const ms = monthSummary(cm, cy, shops, payIdx);
  const ys = yearSummary(cy, shops, payIdx);
  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
  const totalCollectedAllTime = validPayments.reduce((a, p) => a + p.paid_amount, 0);
  const net = totalCollectedAllTime - totalExpenses;

  const monthlyData = [];
  for (let i = 11; i >= 0; i--) {
    let mm = cm - i, yy = cy;
    while (mm <= 0) { mm += 12; yy -= 1; }
    const s = monthSummary(mm, yy, shops, payIdx);
    monthlyData.push({ label: MONTHS_UR[mm - 1], value: s.collected });
  }

  const yearlyData = [];
  for (let y = cy - 4; y <= cy; y++) {
    yearlyData.push({ label: String(y), value: yearSummary(y, shops, payIdx).collected });
  }

  const shopMap = new Map(shops.map((s) => [String(s._id), s]));
  const reportRows = validPayments
    .filter((p) => {
      if (reportScope === "month") return p.month === reportMonth && p.year === reportYear;
      if (reportScope === "year") return p.year === reportYear;
      return true;
    })
    .map((p) => ({ ...p, shop: shopMap.get(String(p.shop_id)) }))
    .filter((p) => p.shop)
    .sort((a, b) => (b.year - a.year) || (b.month - a.month) || a.shop.number.localeCompare(b.shop.number));

  function downloadReportCSV() {
    let csv = "دکان نمبر,دکان کا نام,دکان دار,مہینہ,سال,کل کرایہ,وصول شدہ,بقایا,حیثیت,تاریخ,طریقہ\n";
    reportRows.forEach((p) => {
      const due = Math.max(p.total_rent - p.paid_amount, 0);
      csv += `${p.shop.number},${p.shop.name},${p.shop.tenant_name},${MONTHS_UR[p.month - 1]},${p.year},${p.total_rent},${p.paid_amount},${due},${due <= 0 ? "ادا شدہ" : "بقایا"},${p.payment_date || "—"},${p.method}\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "market-rent-report.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function downloadReportPDF() {
    const rows = reportRows.map((p) => {
      const due = Math.max(p.total_rent - p.paid_amount, 0);
      return `<tr><td>${p.shop.number}</td><td>${p.shop.tenant_name}</td><td>${MONTHS_UR[p.month - 1]} ${p.year}</td><td>${fmt(p.total_rent)}</td><td>${fmt(p.paid_amount)}</td><td>${fmt(due)}</td><td>${due <= 0 ? "ادا شدہ" : "بقایا"}</td></tr>`;
    }).join("");
    const scopeLabel = reportScope === "month" ? `${MONTHS_UR[reportMonth - 1]} ${reportYear}` : reportScope === "year" ? `سال ${reportYear}` : "تمام ریکارڈ";
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html lang="ur" dir="rtl"><head><meta charset="UTF-8"><title>رپورٹ</title>
      <style>body{font-family:sans-serif; direction:rtl; padding:24px;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ccc; padding:8px; text-align:right; font-size:12px;} th{background:#eef9f3;} @page{size:A4;}</style>
      </head><body><h2>🏪 ${marketName} — مکمل کرایہ رپورٹ</h2><p>مدت: ${scopeLabel}</p>
      <table><thead><tr><th>دکان نمبر</th><th>دکان دار</th><th>مہینہ</th><th>کل کرایہ</th><th>وصول شدہ</th><th>بقایا</th><th>حیثیت</th></tr></thead><tbody>${rows}</tbody></table>
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  return (
    <div>
      <h1 className="text-2xl mb-1">🏠 {marketName} — ڈیش بورڈ</h1>
      <p className="text-inksoft text-sm mb-5">آج کی تاریخ: <span className="num">{today.toLocaleDateString("en-GB")}</span></p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon="🏬" label="کل دکانیں" value={totalShops} tone="gr" />
        <StatCard icon="✅" label="کرایہ پر دی گئی دکانیں" value={rented} tone="bl" />
        <StatCard icon="🕳️" label="خالی دکانیں" value={empty} tone="rd" />
        <StatCard icon="🧾" label="اس ماہ کا کل کرایہ" value={`Rs ${fmt(ms.total)}`} tone="bl" />
        <StatCard icon="💵" label="اس ماہ وصول شدہ" value={`Rs ${fmt(ms.collected)}`} tone="gr" />
        <StatCard icon="⏳" label="اس ماہ بقایا" value={`Rs ${fmt(ms.due)}`} tone="rd" />
        <StatCard icon="📅" label="اس سال کا کل کرایہ" value={`Rs ${fmt(ys.total)}`} tone="bl" />
        <StatCard icon="📈" label="اس سال وصول شدہ" value={`Rs ${fmt(ys.collected)}`} tone="gr" />
        <StatCard icon="📉" label="اس سال بقایا" value={`Rs ${fmt(ys.due)}`} tone="rd" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatCard icon="💸" label="کل اخراجات (ہمیشہ سے)" value={`Rs ${fmt(totalExpenses)}`} tone="rd" />
        <StatCard icon="💰" label="خالص بچت (وصولی - اخراجات)" value={`Rs ${fmt(net)}`} tone="gr" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="text-base mb-3">📈 ماہانہ آمدنی (پچھلے 12 مہینے)</h3>
          <BarChartCard data={monthlyData} dataKey="value" color={CHART_COLORS.GREEN} />
        </div>
        <div className="card p-5">
          <h3 className="text-base mb-3">💠 وصول شدہ بمقابلہ بقایا (اس ماہ)</h3>
          <DoughnutCard data={[{ name: "وصول شدہ", value: ms.collected }, { name: "بقایا", value: ms.due }]} colors={[CHART_COLORS.GREEN, CHART_COLORS.RED]} />
        </div>
        <div className="card p-5">
          <h3 className="text-base mb-3">📊 سالانہ آمدنی</h3>
          <BarChartCard data={yearlyData} dataKey="value" color={CHART_COLORS.BLUE} />
        </div>
        <div className="card p-5">
          <h3 className="text-base mb-3">🏬 کرایہ پر بمقابلہ خالی</h3>
          <DoughnutCard data={[{ name: "کرایہ پر", value: rented }, { name: "خالی", value: empty }]} colors={[CHART_COLORS.BLUE, CHART_COLORS.GREY]} />
        </div>
      </div>

      <div className="card p-5 mt-5">
        <h3 className="text-base mb-3">📥 تمام دکانداروں کی رپورٹ ڈاؤن لوڈ کریں</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {[["all", "تمام ریکارڈ"], ["month", "مخصوص مہینہ"], ["year", "مخصوص سال"]].map(([val, label]) => (
            <button key={val} onClick={() => setReportScope(val)} className={`btn ${reportScope === val ? "btn-primary" : "btn-ghost"}`}>{label}</button>
          ))}
        </div>
        {reportScope === "month" && (
          <div className="flex gap-2 mb-3">
            <select className="field-input" value={reportMonth} onChange={(e) => setReportMonth(Number(e.target.value))}>
              {MONTHS_UR.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select className="field-input" value={reportYear} onChange={(e) => setReportYear(Number(e.target.value))}>
              {Array.from({ length: 6 }, (_, i) => cy - 3 + i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
        {reportScope === "year" && (
          <select className="field-input mb-3" value={reportYear} onChange={(e) => setReportYear(Number(e.target.value))}>
            {Array.from({ length: 6 }, (_, i) => cy - 3 + i).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        <p className="text-inksoft text-xs mb-3">اس فلٹر میں کل <span className="num">{reportRows.length}</span> ریکارڈز شامل ہیں۔</p>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={downloadReportPDF}>🖨️ PDF ڈاؤن لوڈ (Print)</button>
          <button className="btn btn-ghost" onClick={downloadReportCSV}>⬇️ Excel (CSV) ڈاؤن لوڈ</button>
        </div>
      </div>
    </div>
  );
}
