"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/dashboard", label: "🏠 ڈیش بورڈ" },
  { href: "/shops", label: "🏬 دکانیں" },
  { href: "/rent", label: "💰 کرایہ وصولی" },
  { href: "/ledger", label: "📒 دکان دار کھاتہ" },
  { href: "/expenses", label: "🧾 اخراجات" },
  { href: "/reports", label: "📊 رپورٹس" },
  { href: "/search", label: "🔍 سرچ" },
  { href: "/admin", label: "⚙️ ایڈمن" },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [settings, setSettings] = useState({ market_name: "روشن مارکیٹ", collector_name: "مولانا عدنان صاحب" });

  useEffect(() => {
    fetch("/api/settings").then((r) => r.ok ? r.json() : null).then((d) => d && setSettings(d));
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-[260px] bg-white border-l border-border2 p-5 flex flex-col gap-5 z-40 transition-transform duration-200
        ${open ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-2xl shadow">🏪</div>
          <div>
            <h2 className="text-base font-nastaliq leading-tight">{settings.market_name}</h2>
            <span className="text-[11px] text-inksoft">کرایہ مینجمنٹ</span>
          </div>
        </div>

        <div className="bg-greenbg border border-border2 rounded-2xl p-3 flex items-center gap-2 text-sm">
          <span className="text-xl">👳</span>
          <div>
            <small className="block text-inksoft text-[11px]">کرایہ وصول کرنے والا</small>
            <strong>{settings.collector_name}</strong>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`btn text-right ${active ? "btn-primary" : "btn-ghost"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button onClick={handleLogout} className="btn btn-danger mt-auto">لاگ آؤٹ ⏻</button>
      </aside>
    </>
  );
}
