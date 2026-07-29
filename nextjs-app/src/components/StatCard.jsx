export default function StatCard({ icon, label, value, tone = "gr" }) {
  const toneClasses = {
    gr: "bg-greenbg text-green-600",
    bl: "bg-blue-500/10 text-blue-600",
    rd: "bg-redbg text-red2",
  };
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3 ${toneClasses[tone]}`}>
        {icon}
      </div>
      <div className="text-[12.5px] text-inksoft mb-1">{label}</div>
      <div className="text-xl font-bold num">{value}</div>
    </div>
  );
}
