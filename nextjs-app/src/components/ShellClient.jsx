"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function ShellClient({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/login" || pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 min-w-0 p-4 lg:p-7">
        <button
          className="btn btn-ghost lg:hidden mb-4"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ مینیو
        </button>
        {children}
      </main>
    </div>
  );
}
