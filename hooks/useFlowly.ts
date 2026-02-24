import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function useFlowly() {
  const supabase = createClient();

  const [data, setData] = useState<{
    balance: number;
    income: number;
    expense: number;
    transactions: any[];
    allWallets: any[];
  }>({
    balance: 0,
    income: 0,
    expense: 0,
    transactions: [],
    allWallets: [],
  });

  const fetchData = async () => {
    // 1. Ambil SEMUA data dompet
    const { data: accounts } = await supabase.from("accounts").select("*").order("name");
    const totalBalance = accounts?.reduce((acc, curr) => acc + Number(curr.balance), 0) || 0;

    // 2. Dapatkan format tanggal hari ini (YYYY-MM-DD) sesuai zona waktu lokal
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // 3. Ambil transaksi KHUSUS HARI INI (Tanpa Limit)
    const { data: trans, error } = await supabase
      .from("transactions")
      .select("*, categories(name, icon)")
      .eq("transaction_date", todayStr) // <-- KUNCI: Hanya ambil data hari ini
      .order("created_at", { ascending: false }); // Urutkan dari yang paling baru diinput

    // 4. Ambil SEMUA transaksi untuk hitung total Income/Expense
    const { data: allTrans } = await supabase
      .from("transactions")
      .select("amount, transaction_type");

    let totalIncome = 0;
    let totalExpense = 0;

    if (allTrans) {
      allTrans.forEach((t) => {
        if (t.transaction_type === "income") totalIncome += Number(t.amount);
        if (t.transaction_type === "expense") totalExpense += Number(t.amount);
      });
    }

    if (error) {
      console.error("Error fetching:", error);
      return;
    }

    setData({
      balance: totalBalance,
      income: totalIncome,
      expense: totalExpense,
      transactions: (trans as any) || [],
      allWallets: accounts || [],
    });
  };

  useEffect(() => {
    fetchData();
    const handleUpdate = () => fetchData();
    window.addEventListener("flowly-update", handleUpdate);
    return () => window.removeEventListener("flowly-update", handleUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...data, refresh: fetchData };
}