import { Noto_Nastaliq_Urdu, Noto_Naskh_Arabic, Inter } from "next/font/google";
import "./globals.css";
import ShellClient from "@/components/ShellClient";

const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["600", "700"],
  variable: "--font-nastaliq",
  display: "swap",
});

const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-naskh",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "روشن مارکیٹ کرایہ مینجمنٹ سسٹم",
  description: "مارکیٹ کرایہ مینجمنٹ سسٹم — Next.js + MongoDB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ur" dir="rtl">
      <body className={`${nastaliq.variable} ${naskh.variable} ${inter.variable}`} style={{ fontFamily: "var(--font-naskh), sans-serif" }}>
        <ShellClient>{children}</ShellClient>
      </body>
    </html>
  );
}
