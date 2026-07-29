"use client";
import { useEffect, useState } from "react";
import { MONTHS_UR, fmt, todayISO } from "@/lib/utils";

export default function RentPage() {
  const today = new Date();
  const [shops, setShops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [query, setQuery] = useState("");
  const [openRowId, setOpenRowId] = useState(null);
  const [form, setForm] = useState({ paid_amount: 0, method: "نقد", payment_date: todayISO() });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  function load() {
    Promise.all([
      fetch("/api/shops").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
    ]).then(([s, p]) => { setShops(s); setPayments(p); setLoading(false); });
  }
  useEffect(load, []);

  if (loading) return <div className="text-inksoft">لوڈ ہو رہا ہے...</div>;

  const rented = shops.filter((s) => s.status === "rented").filter((s) => {
    const q = query.toLowerCase();
    return !q || s.number.toLowerCase().includes(q) || s.tenant_name.toLowerCase().includes(q) || (s.mobile || "").includes(q);
  });

  function getPayment(shopId) {
    return payments.find((p) => p.shop_id === String(shopId) && p.month === month && p.year === year);
  }

  function openRow(shop) {
    const p = getPayment(shop._id);
    setForm({ paid_amount: p ? p.paid_amount : 0, method: p ? p.method : "نقد", payment_date: todayISO() });
    setOpenRowId(openRowId === shop._id ? null : shop._id);
    setNotice(null);
  }

  async function handleSave(shop) {
    setSaving(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop_id: shop._id, month, year,
        paid_amount: Number(form.paid_amount), method: form.method, payment_date: form.payment_date,
      }),
    });
    const data = await res.json();
    setSaving(false);
    setOpenRowId(null);
    if (data.whatsapp?.ok) {
      setNotice({ type: "success", text: `✅ WhatsApp پیغام بھیج دیا گیا — ${shop.mobile || "—"}` });
    } else if (data.whatsapp?.reason === "whatsapp_not_configured") {
      setNotice({ type: "info", text: "ℹ️ WhatsApp API ابھی کنیکٹ نہیں ہوئی — .env.local میں تفصیلات شامل کریں۔" });
    } else if (data.whatsapp?.reason !== "sms_disabled") {
      setNotice({ type: "warn", text: `⚠️ WhatsApp پیغام نہیں جا سکا (${data.whatsapp?.reason})۔` });
    } else {
      setNotice({ type: "success", text: "ادائیگی محفوظ کر لی گئی۔" });
    }
    load();
  }

  return (
    <div>
      <h1 className="text-2xl mb-5">💰 کرایہ وصولی</h1>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <select className="field-input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {MONTHS_UR.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className="field-input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {Array.from({ length: 6 }, (_, i) => today.getFullYear() - 3 + i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <input className="field-input mb-4" placeholder="🔎 دکان تلاش کریں (دکان نمبر / دکان دار کا نام / موبائل)"
        value={query} onChange={(e) => setQuery(e.target.value)} />

      {notice && (
        <div className={`card p-3 mb-4 text-sm ${notice.type === "warn" ? "text-red2" : notice.type === "info" ? "text-blue-600" : "text-green-700"}`}>
          {notice.text}
        </div>
      )}

      {rented.length === 0 && <p className="text-inksoft">کوئی دکان نہیں ملی۔</p>}

      <div className="space-y-4">
        {rented.map((s) => {
          const p = getPayment(s._id);
          const total = p ? p.total_rent : s.monthly_rent;
          const paid = p ? p.paid_amount : 0;
          const due = Math.max(total - paid, 0);
          const isOpen = openRowId === s._id;

          return (
            <div key={s._id} className="card p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
                <div><b>دکان # {s.number}</b><br /><span className="text-sm">{s.tenant_name}</span></div>
                <div className="text-sm">کل کرایہ<br /><b className="num">Rs {fmt(total)}</b></div>
                <div className="text-sm">وصول شدہ<br /><b className="num">Rs {fmt(paid)}</b></div>
                <div className="text-sm">بقایا<br /><b className="num">Rs {fmt(due)}</b></div>
                <div>{due <= 0 && p ? <span className="badge badge-paid">✔ ادا شدہ</span> : <span className="badge badge-due">بقایا</span>}</div>
              </div>

              <button
                className={`btn w-full mt-3 ${isOpen ? "btn-primary" : "btn-ghost"}`}
                onClick={() => openRow(s)}
              >
                {isOpen ? "🔽 وصول کریں (بند کریں)" : "💰 وصول کریں"}
              </button>

              {isOpen && (
                <div className="mt-3 space-y-3">
                  <input className="field-input" type="number" placeholder="وصول شدہ رقم"
                    value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} />
                  <select className="field-input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    <option value="نقد">نقد</option>
                    <option value="بینک">بینک</option>
                    <option value="ایزی پیسہ">ایزی پیسہ</option>
                    <option value="جاز کیش">جاز کیش</option>
                  </select>
                  <input className="field-input" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
                  <button className="btn btn-primary w-full" disabled={saving} onClick={() => handleSave(s)}>
                    {saving ? "محفوظ ہو رہا ہے..." : "محفوظ کریں ✅"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
