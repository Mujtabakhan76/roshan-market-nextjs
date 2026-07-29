"use client";
import { useEffect, useState } from "react";
import { fmt, todayISO } from "@/lib/utils";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [edate, setEdate] = useState(todayISO());
  const [error, setError] = useState("");

  function load() {
    fetch("/api/expenses").then((r) => r.json()).then((d) => { setExpenses(d); setLoading(false); });
  }
  useEffect(load, []);

  async function handleAdd() {
    setError("");
    if (!desc || !amount || Number(amount) <= 0) {
      setError("براہ کرم تفصیل اور رقم درج کریں۔");
      return;
    }
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: desc, amount: Number(amount), date: edate }),
    });
    if (res.ok) {
      setDesc(""); setAmount(""); setShowAdd(false);
      load();
    } else {
      const d = await res.json();
      setError(d.error || "خرابی پیش آئی");
    }
  }

  async function handleDelete(id) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="text-inksoft">لوڈ ہو رہا ہے...</div>;

  const total = expenses.reduce((a, e) => a + e.amount, 0);

  return (
    <div>
      <h1 className="text-2xl mb-2">🧾 اخراجات</h1>
      <p className="text-inksoft text-sm mb-5">جب کرایہ کی رقم میں سے کوئی خرچہ کیا جائے (مرمت، بجلی، صفائی وغیرہ) تو یہاں درج کریں — یہ خودکار طور پر خالص بچت میں سے منہا ہو جائے گا۔</p>

      <button className={`btn mb-4 ${showAdd ? "btn-primary" : "btn-ghost"}`} onClick={() => setShowAdd(!showAdd)}>
        ➕ نیا خرچہ شامل کریں
      </button>

      {showAdd && (
        <div className="card p-5 mb-5 space-y-3">
          <input className="field-input" placeholder="خرچے کی تفصیل (مثلاً: مرمت، بجلی کا بل)" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <input className="field-input" type="number" placeholder="رقم" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <input className="field-input" type="date" value={edate} onChange={(e) => setEdate(e.target.value)} />
          {error && <p className="text-red2 text-sm">{error}</p>}
          <button className="btn btn-primary" onClick={handleAdd}>محفوظ کریں</button>
        </div>
      )}

      <div className="card p-4 mb-5">
        <div className="text-xs text-inksoft">💸 کل اخراجات (ہمیشہ سے)</div>
        <div className="text-xl font-bold num">Rs {fmt(total)}</div>
      </div>

      {expenses.length === 0 ? (
        <p className="text-inksoft">ابھی تک کوئی خرچہ درج نہیں ہوا۔</p>
      ) : (
        <div className="space-y-3">
          {expenses.map((e) => (
            <div key={e._id} className="card p-4 flex justify-between items-center">
              <div>
                <b>{e.description}</b>
                <p className="text-inksoft text-xs">📅 {e.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <b className="num">Rs {fmt(e.amount)}</b>
                <button className="btn btn-danger" onClick={() => handleDelete(e._id)}>🗑️ حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
