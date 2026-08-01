"use client";
import { useState } from "react";

export default function WhatsAppModal({ shop, defaultMessage, onClose }) {
  const [message, setMessage] = useState(defaultMessage);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSend() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: shop.mobile, message }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResult({ ok: true, text: "✅ WhatsApp پیغام کامیابی سے بھیج دیا گیا۔" });
      } else {
        setResult({ ok: false, text: `⚠️ پیغام نہیں جا سکا: ${data.error || "نامعلوم خرابی"}` });
      }
    } catch (e) {
      setResult({ ok: false, text: "⚠️ پیغام بھیجنے میں خرابی ہوئی۔" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card bg-white w-full max-w-[440px] max-h-[90vh] overflow-y-auto p-0">
        <div className="flex justify-between items-center p-4 border-b border-border2">
          <h3 className="text-base">📱 WhatsApp پیغام — {shop.tenant_name}</h3>
          <button onClick={onClose} className="btn btn-ghost px-3 py-1">✕</button>
        </div>
        <div className="p-5">
          <p className="text-inksoft text-sm mb-2">نمبر: <span className="num">{shop.mobile || "—"}</span></p>
          <label className="text-xs text-inksoft block mb-1">پیغام (بھیجنے سے پہلے تبدیل کر سکتے ہیں)</label>
          <textarea
            className="field-input"
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {result && (
            <p className={`text-sm mt-3 ${result.ok ? "text-green-700" : "text-red2"}`}>{result.text}</p>
          )}
          <div className="flex gap-2 mt-4">
            <button className="btn btn-primary flex-1" disabled={sending || !shop.mobile} onClick={handleSend}>
              {sending ? "بھیجا جا رہا ہے..." : "📤 پیغام بھیجیں"}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>بند کریں</button>
          </div>
          {!shop.mobile && <p className="text-red2 text-xs mt-2">اس دکان دار کا موبائل نمبر درج نہیں ہے۔</p>}
        </div>
      </div>
    </div>
  );
}
