"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [settings, setSettings] = useState(null);
  const [marketName, setMarketName] = useState("");
  const [collectorName, setCollectorName] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passError, setPassError] = useState("");
  const [smsOn, setSmsOn] = useState(true);
  const [msg, setMsg] = useState("");

  function load() {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      setSettings(d);
      setMarketName(d.market_name);
      setCollectorName(d.collector_name);
      setSmsOn(d.sms_enabled);
    });
  }
  useEffect(load, []);

  async function saveMarketName() {
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ market_name: marketName }) });
    setMsg("محفوظ ہو گیا۔");
    load();
  }

  async function saveCollectorName() {
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collector_name: collectorName }) });
    setMsg("محفوظ ہو گیا۔");
    load();
  }

  async function changePassword() {
    setPassError("");
    const res = await fetch("/api/settings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ old_password: oldPass, new_password: newPass }),
    });
    if (res.ok) {
      setOldPass(""); setNewPass("");
      setMsg("پاس ورڈ تبدیل ہو گیا۔");
    } else {
      const d = await res.json();
      setPassError(d.error || "خرابی پیش آئی");
    }
  }

  async function toggleSms() {
    const next = !smsOn;
    setSmsOn(next);
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sms_enabled: next }) });
  }

  async function downloadBackup() {
    const [shops, payments, expenses] = await Promise.all([
      fetch("/api/shops").then((r) => r.json()),
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/expenses").then((r) => r.json()),
    ]);
    const blob = new Blob([JSON.stringify({ shops, payments, expenses }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "backup.json"; a.click();
    URL.revokeObjectURL(url);
  }

  if (!settings) return <div className="text-inksoft">لوڈ ہو رہا ہے...</div>;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl mb-2">⚙️ ایڈمن پینل</h1>
      {msg && <p className="text-green-700 text-sm">{msg}</p>}

      <div className="card p-5">
        <h3 className="text-base mb-3">🏪 مارکیٹ کا نام</h3>
        <input className="field-input mb-3" value={marketName} onChange={(e) => setMarketName(e.target.value)} />
        <button className="btn btn-primary" onClick={saveMarketName}>مارکیٹ کا نام محفوظ کریں</button>
      </div>

      <div className="card p-5">
        <h3 className="text-base mb-3">👤 کرایہ وصول کرنے والا</h3>
        <input className="field-input mb-3" value={collectorName} onChange={(e) => setCollectorName(e.target.value)} />
        <button className="btn btn-primary" onClick={saveCollectorName}>نام محفوظ کریں</button>
      </div>

      <div className="card p-5">
        <h3 className="text-base mb-3">🔐 پاس ورڈ تبدیل کریں</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input className="field-input" type="password" placeholder="موجودہ پاس ورڈ" value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
          <input className="field-input" type="password" placeholder="نیا پاس ورڈ" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
        </div>
        {passError && <p className="text-red2 text-sm mb-3">{passError}</p>}
        <button className="btn btn-primary" onClick={changePassword}>پاس ورڈ اپڈیٹ کریں</button>
      </div>

      <div className="card p-5">
        <h3 className="text-base mb-3">📡 WhatsApp سیٹنگ</h3>
        <button onClick={toggleSms} className={`btn ${smsOn ? "btn-primary" : "btn-ghost"}`}>
          {smsOn ? "✅ خودکار WhatsApp پیغام فعال ہے" : "⛔ خودکار WhatsApp پیغام غیر فعال ہے"}
        </button>
        <p className="text-[12px] text-inksoft mt-2">پیغام بھیجنے کے لیے .env.local میں WhatsApp تفصیلات شامل ہونی ضروری ہیں۔</p>
      </div>

      <div className="card p-5">
        <h3 className="text-base mb-3">💾 ڈیٹا ایکسپورٹ</h3>
        <button className="btn btn-primary" onClick={downloadBackup}>⬇️ مکمل بیک اپ (JSON) ڈاؤن لوڈ کریں</button>
      </div>
    </div>
  );
}
