"use client";
import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import { BarChartCard, DoughnutCard, CHART_COLORS } from "@/components/Charts";
import { MONTHS_UR, fmt, monthSummary, yearSummary, buildPaymentIndex } from "@/lib/utils";

export default function DashboardPage() {
  const [shops, setShops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [marketName, setMarketName] = useState("روشن مارکیٹ");
  const [loading, setLoading] = useState(true);

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

  const payIdx = buildPaymentIndex(payments);
  const today = new Date();
  const cm = today.getMonth() + 1, cy = today.getFullYear();
  const totalShops = shops.length;
  const rented = shops.filter((s) => s.status === "rented").length;
  const empty = totalShops - rented;
  const ms = monthSummary(cm, cy, shops, payIdx);
  const ys = yearSummary(cy, shops, payIdx);
  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
  const totalCollectedAllTime = payments.reduce((a, p) => a + p.paid_amount, 0);
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
    </div>
  );
}
