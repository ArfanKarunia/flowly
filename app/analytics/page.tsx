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
} from "lucide-react";
import { COLORS } from "../constants/colors";

export default function AnalyticsPage() {
  const supabase = createClient();
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const { data: trans } = await supabase
        .from("transactions")
        .select("*, categories(name, icon)");

      if (trans) {
        // --- LOGIKA PIE CHART ---
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

        // --- LOGIKA TREND (7 Hari Terakhir) ---
        const trendMap: any = {};
        trans.forEach((t) => {
          const date = new Date(t.transaction_date).toLocaleDateString(
            "id-ID",
            { day: "numeric", month: "short" },
          );
          if (!trendMap[date]) trendMap[date] = { date, income: 0, expense: 0 };
          if (t.transaction_type === "income") trendMap[date].income += Number(t.amount);
          else trendMap[date].expense += Number(t.amount);
        });
        setMonthlyData(Object.values(trendMap).slice(-7));
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, [supabase]);

  const CHART_COLORS = ["#2563eb", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

  if (loading)
    return (
      <div className={`p-10 text-center font-bold text-blue-600 min-h-screen ${COLORS.bg}`}>
        Analyzing your flows...
      </div>
    );

  return (
    <div className={`p-6 md:p-10 space-y-8 min-h-screen ${COLORS.bg} ${COLORS.text.main} pb-24 transition-colors duration-300`}>
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
        <p className={COLORS.text.muted}>See where your money flows go</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- PIE CHART SPENDING --- */}
        <div className={`${COLORS.card} p-6 rounded-[32px] border shadow-sm`}>
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="text-blue-600" size={20} />
            <h2 className="font-bold text-lg">Spending by Category</h2>
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
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ color: '#1e293b' }}
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

        {/* --- TREND BAR CHART --- */}
        <div className={`${COLORS.card} p-6 rounded-[32px] border shadow-sm`}>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-blue-600" size={20} />
            <h2 className="font-bold text-lg">Income vs Expense Trend</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: "16px",
                    border: "none",
                  }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- LIST: TOP SPENDING --- */}
      <section className={`${COLORS.card} p-8 rounded-[32px] border shadow-sm`}>
        <h2 className="font-bold text-xl mb-6">Spending Details</h2>
        <div className="space-y-4">
          {categoryData
            .sort((a, b) => b.value - a.value)
            .map((cat, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 rounded-2xl ${COLORS.hover} transition-all`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">{cat.icon}</span>
                  <span className="font-semibold">{cat.name}</span>
                </div>
                <p className="font-bold">Rp{cat.value.toLocaleString("id-ID")}</p>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}