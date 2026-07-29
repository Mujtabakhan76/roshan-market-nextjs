"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const GREEN = "#3fa373";
const BLUE = "#2f6fb0";
const RED = "#c0392b";
const GREY = "#9aa79f";

export function BarChartCard({ data, dataKey, color = GREEN }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,50,38,0.08)" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => v.toLocaleString("en-US")} />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DoughnutCard({ data, colors = [GREEN, RED] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Legend />
        <Tooltip formatter={(v) => v.toLocaleString("en-US")} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export const CHART_COLORS = { GREEN, BLUE, RED, GREY };
