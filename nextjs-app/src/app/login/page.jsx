"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "غلط پاس ورڈ، دوبارہ کوشش کریں۔");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="card w-full max-w-[400px] p-9 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-l from-green-500 to-blue-500" />
        <div className="w-[74px] h-[74px] rounded-full mx-auto mb-4 flex items-center justify-center text-3xl bg-gradient-to-br from-green-500 to-blue-600 shadow">🏪</div>
        <h1 className="text-2xl mb-1">🏪 روشن مارکیٹ کرایہ مینجمنٹ سسٹم</h1>
        <p className="text-inksoft text-sm mb-6">ایڈمن رسائی کے لیے پاس ورڈ درج کریں</p>

        <div className="text-right mb-4">
          <label className="block text-sm text-inksoft mb-1.5">پاس ورڈ</label>
          <input
            type="password"
            className="field-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="پاس ورڈ لکھیں"
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "لوڈ ہو رہا ہے..." : "داخل ہوں 🔐"}
        </button>
        {error && <p className="text-red2 text-sm mt-3">{error}</p>}
        <p className="text-[11.5px] text-inksoft mt-4">ڈیفالٹ پاس ورڈ: <span className="num">admin123</span></p>
      </form>
    </div>
  );
}
