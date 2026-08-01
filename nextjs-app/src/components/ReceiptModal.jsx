"use client";
import { MONTHS_UR, fmt } from "@/lib/utils";

export default function ReceiptModal({ data, onClose }) {
  if (!data) return null;
  const { shop, month, year, paidAmount, due, paymentDate, method, marketName, collectorName, receiptNo } = data;

  function handlePrint() {
    const printContents = document.getElementById("receipt-print-area").innerHTML;
    const win = window.open("", "_blank", "width=420,height=650");
    win.document.write(`<!DOCTYPE html><html lang="ur" dir="rtl"><head><meta charset="UTF-8"><title>رسید</title>
      <style>
        @page{size:A4; margin:20mm;}
        body{font-family:'Segoe UI',sans-serif; direction:rtl; padding:24px; color:#173226;}
        .receipt{max-width:360px; margin:0 auto; border:1px solid #ddd; border-radius:12px; padding:24px;}
        h2{text-align:center; color:#2f8a60; margin-bottom:2px;}
        .sub{text-align:center; font-size:12px; color:#777; margin-bottom:16px;}
        .line{display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dashed #eee; font-size:14px;}
        .line span:first-child{color:#777;}
        .total{display:flex; justify-content:space-between; padding:10px 0; font-weight:bold; font-size:16px;}
        .stamp{margin-top:20px; text-align:center; font-size:12px; color:#777;}
      </style></head><body>${printContents}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card bg-white w-full max-w-[420px] max-h-[90vh] overflow-y-auto p-0">
        <div className="flex justify-between items-center p-4 border-b border-border2">
          <h3 className="text-base">🧾 رسید</h3>
          <button onClick={onClose} className="btn btn-ghost px-3 py-1">✕</button>
        </div>
        <div className="p-5">
          <div id="receipt-print-area">
            <div className="receipt">
              <h2>🏪 {marketName}</h2>
              <div className="sub">ادائیگی کی رسید — نمبر: <span className="num">{receiptNo}</span></div>
              <div className="line"><span>دکان نمبر</span><span className="num">{shop.number}</span></div>
              <div className="line"><span>دکان کا نام</span><span>{shop.name}</span></div>
              <div className="line"><span>دکان دار کا نام</span><span>{shop.tenant_name}</span></div>
              <div className="line"><span>مہینہ</span><span>{MONTHS_UR[month - 1]} {year}</span></div>
              <div className="line"><span>وصول کی گئی رقم</span><span className="num">Rs {fmt(paidAmount)}</span></div>
              <div className="line"><span>بقایا رقم</span><span className="num">Rs {fmt(due)}</span></div>
              <div className="line"><span>ادائیگی کا طریقہ</span><span>{method}</span></div>
              <div className="line"><span>تاریخ</span><span className="num">{paymentDate}</span></div>
              <div className="line"><span>وقت</span><span className="num">{new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span></div>
              <div className="total"><span>وصول کنندہ:</span><span>{collectorName}</span></div>
              <div className="stamp">🖋️ کمپیوٹرائزڈ رسید — {marketName}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="btn btn-primary flex-1" onClick={handlePrint}>🖨️ پرنٹ / PDF محفوظ کریں</button>
            <button className="btn btn-ghost" onClick={onClose}>بند کریں</button>
          </div>
        </div>
      </div>
    </div>
  );
}
