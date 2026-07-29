"use client";
import { useEffect, useState } from "react";
import { fmt } from "@/lib/utils";

export default function SearchPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/shops").then((r) => r.json()).then((d) => { setShops(d); setLoading(false); });
  }, []);

  if (loading) return <div className="text-inksoft">لوڈ ہو رہا ہے...</div>;

  const q = query.toLowerCase();
  const results = query
    ? shops.filter((s) => s.number.toLowerCase().includes(q) || s.tenant_name.toLowerCase().includes(q) || (s.mobile || "").includes(q))
    : [];

  return (
    <div>
      <h1 className="text-2xl mb-5">🔍 سرچ</h1>
      <input className="field-input mb-5" placeholder="دکان نمبر، دکان دار کا نام یا موبائل نمبر لکھیں"
        value={query} onChange={(e) => setQuery(e.target.value)} />

      {!query && <p className="text-inksoft">تلاش کے لیے اوپر لکھیں۔</p>}
      {query && results.length === 0 && <p className="text-inksoft">کوئی نتیجہ نہیں ملا۔</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((s) => (
          <div key={s._id} className="card p-4">
            <b>دکان # {s.number} — {s.tenant_name}</b>
            <p className="text-inksoft text-sm">📱 {s.mobile || "—"} · Rs {fmt(s.monthly_rent)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
