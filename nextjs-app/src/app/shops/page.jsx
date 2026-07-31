"use client";
import { useEffect, useState } from "react";
import { fmt } from "@/lib/utils";

const EMPTY_FORM = { number: "", name: "", tenant_name: "", mobile: "", cnic: "", monthly_rent: "", status: "rented" };

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  function load() {
    fetch("/api/shops").then((r) => r.json()).then((d) => { setShops(d); setLoading(false); });
  }
  useEffect(load, []);

  async function handleAdd() {
    setError("");
    const res = await fetch("/api/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm(EMPTY_FORM);
      setShowAdd(false);
      load();
    } else {
      const d = await res.json();
      setError(d.error || "خرابی پیش آئی");
    }
  }

  async function handleUpdate(id) {
    await fetch(`/api/shops/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    load();
  }

  async function handleDelete(shop) {
    if (!confirm(`کیا آپ واقعی دکان نمبر ${shop.number} کو حذف کرنا چاہتے ہیں؟`)) return;
    await fetch(`/api/shops/${shop._id}`, { method: "DELETE" });
    load();
  }

  const filtered = shops.filter((s) => {
    const q = query.toLowerCase();
    const matchQ = !q || s.number.toLowerCase().includes(q) || s.tenant_name.toLowerCase().includes(q) || (s.mobile || "").includes(q);
    const matchS = statusFilter === "all" || s.status === statusFilter;
    return matchQ && matchS;
  });

  if (loading) return <div className="text-inksoft">لوڈ ہو رہا ہے...</div>;

  return (
    <div>
      <h1 className="text-2xl mb-5">🏬 دکانیں</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <input className="field-input flex-1 min-w-[220px]" placeholder="🔎 دکان نمبر، نام یا موبائل سے تلاش کریں"
          value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="field-input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">تمام دکانیں</option>
          <option value="rented">کرایہ پر</option>
          <option value="empty">خالی</option>
        </select>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>➕ نئی دکان شامل کریں</button>
      </div>

      {showAdd && (
        <div className="card p-5 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <input className="field-input" placeholder="دکان نمبر *" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
            <input className="field-input" placeholder="دکان کا نام" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="field-input" placeholder="دکان دار کا نام *" value={form.tenant_name} onChange={(e) => setForm({ ...form, tenant_name: e.target.value })} />
            <input className="field-input" placeholder="موبائل نمبر *" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            <input className="field-input" placeholder="شناختی کارڈ (اختیاری)" value={form.cnic} onChange={(e) => setForm({ ...form, cnic: e.target.value })} />
            <input className="field-input" type="number" placeholder="ماہانہ کرایہ *" value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} />
            <select className="field-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="rented">کرایہ پر</option>
              <option value="empty">خالی</option>
            </select>
          </div>
          {error && <p className="text-red2 text-sm mb-3">{error}</p>}
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={handleAdd}>محفوظ کریں</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>منسوخ</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && <p className="text-inksoft col-span-full">کوئی دکان نہیں ملی۔</p>}
        {filtered.map((s) => (
          <div key={s._id} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="badge bg-greenbg text-green-700 num">دکان # {s.number}</span>
              <span className={`badge ${s.status === "rented" ? "badge-rented" : "badge-empty"}`}>
                {s.status === "rented" ? "کرایہ پر" : "خالی"}
              </span>
            </div>
            <h4 className="text-base font-bold">{s.name}</h4>
            <p className="text-inksoft text-sm mb-2">
              {s.status === "rented" ? `👤 ${s.tenant_name} · 📱 ${s.mobile || "—"}` : "کوئی کرایہ دار نہیں"}
            </p>
            <p className="text-lg font-bold text-blue-600 num">Rs {fmt(s.monthly_rent)}</p>

            {editingId === s._id ? (
              <div className="mt-3 space-y-2">
                <label className="text-xs text-inksoft block">دکان نمبر</label>
                <input className="field-input" defaultValue={s.number} onChange={(e) => setEditForm({ ...editForm, number: e.target.value })} />
                <label className="text-xs text-inksoft block">دکان کا نام</label>
                <input className="field-input" defaultValue={s.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                <label className="text-xs text-inksoft block">دکان دار کا نام</label>
                <input className="field-input" defaultValue={s.tenant_name} onChange={(e) => setEditForm({ ...editForm, tenant_name: e.target.value })} />
                <label className="text-xs text-inksoft block">موبائل نمبر</label>
                <input className="field-input" defaultValue={s.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} />
                <label className="text-xs text-inksoft block">شناختی کارڈ نمبر</label>
                <input className="field-input" defaultValue={s.cnic || ""} onChange={(e) => setEditForm({ ...editForm, cnic: e.target.value })} />
                <label className="text-xs text-inksoft block">ماہانہ کرایہ</label>
                <input className="field-input" type="number" defaultValue={s.monthly_rent} onChange={(e) => setEditForm({ ...editForm, monthly_rent: e.target.value })} />
                <label className="text-xs text-inksoft block">دکان کی حالت</label>
                <select className="field-input" defaultValue={s.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  <option value="rented">کرایہ پر</option>
                  <option value="empty">خالی</option>
                </select>
                <div className="flex gap-2">
                  <button className="btn btn-primary flex-1" onClick={() => handleUpdate(s._id)}>محفوظ کریں</button>
                  <button className="btn btn-ghost" onClick={() => setEditingId(null)}>منسوخ</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mt-3">
                <button className="btn btn-ghost flex-1" onClick={() => { setEditingId(s._id); setEditForm({ number: s.number, name: s.name, tenant_name: s.tenant_name, mobile: s.mobile, cnic: s.cnic || "", monthly_rent: s.monthly_rent, status: s.status }); }}>✏️ ترمیم</button>
                <button className="btn btn-danger flex-1" onClick={() => handleDelete(s)}>🗑️ حذف</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
