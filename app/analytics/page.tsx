"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export default function AnalyticsPage() {
  const supabase = createClient();
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      // 1. Ambil transaksi beserta kategorinya
      const { data: trans } = await supabase
        .from("transactions")
        .select("*, categories(name, icon)");

      if (trans) {
        // --- LOGIKA PIE CHART (Expense per Kategori) ---
        const expenses = trans.filter((t) => t.transaction_type === "expense");
        const catMap: any = {};

        expenses.forEach((t) => {
          const name = t.categories?.name || "Uncategorized";
          if (!catMap[name]) {
            catMap[name] = { name, value: 0, icon: t.categories?.icon || "❓" };
          }
          catMap[name].value += Number(t.amount);
        });

        setCategoryData(Object.values(catMap));

        // --- LOGIKA TREND (Sederhana: Kelompokkan per Tanggal) ---
        const trendMap: any = {};
        trans.forEach((t) => {
          const date = new Date(t.transaction_date).toLocaleDateString(
            "id-ID",
            { day: "numeric", month: "short" },
          );
          if (!trendMap[date]) trendMap[date] = { date, income: 0, expense: 0 };

          if (t.transaction_type === "income")
            trendMap[date].income += Number(t.amount);
          else trendMap[date].expense += Number(t.amount);
        });

        setMonthlyData(Object.values(trendMap).slice(-7)); // Ambil 7 hari terakhir
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, [supabase]);

  const COLORS = [
    "#2563eb",
    "#f43f5e",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
  ];

  if (loading)
    return (
      <div className="p-10 text-center font-bold text-blue-600">
        Analyzing your flows...
      </div>
    );

  return (
    <div className="p-6 md:p-10 space-y-8 pb-24">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500">See where your money flows go</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- CARD 1: PIE CHART SPENDING --- */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="text-blue-600" size={20} />
            <h2 className="font-bold text-lg text-slate-800">
              Spending by Category
            </h2>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number | string | undefined) =>
                    typeof value === "number"
                      ? `Rp${value.toLocaleString("id-ID")}`
                      : value
                  }
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- CARD 2: TREND BAR CHART --- */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-blue-600" size={20} />
            <h2 className="font-bold text-lg text-slate-800">
              Income vs Expense Trend
            </h2>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- LIST: TOP SPENDING --- */}
      <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <h2 className="font-bold text-xl mb-6 text-slate-800">
          Spending Details
        </h2>
        <div className="space-y-4">
          {categoryData
            .sort((a, b) => b.value - a.value)
            .map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-semibold text-slate-700">
                    {cat.name}
                  </span>
                </div>
                <p className="font-bold text-slate-900">
                  Rp{cat.value.toLocaleString("id-ID")}
                </p>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
