import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function useFlowly() {
  const supabase = createClient();

  const [data, setData] = useState<{
    balance: number;
    income: number;
    expense: number;
    transactions: any[];
    allWallets: any[]; // <-- Tambah state untuk daftar dompet
  }>({
    balance: 0,
    income: 0,
    expense: 0,
    transactions: [],
    allWallets: [], // <-- Inisialisasi kosong
  });

  const fetchData = async () => {
    // 1. Ambil SEMUA data dompet
    const { data: accounts } = await supabase
      .from("accounts")
      .select("*")
      .order("name");
    const totalBalance =
      accounts?.reduce((acc, curr) => acc + Number(curr.balance), 0) || 0;

    // 2. Ambil transaksi terbaru
    const { data: trans, error } = await supabase
      .from("transactions")
      .select("*, categories(name, icon)")
      .order("transaction_date", { ascending: false })
      .limit(5);

    // 3. Ambil SEMUA transaksi untuk hitung Income/Expense
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
      allWallets: accounts || [], // <-- Masukkan hasil fetch dompet ke sini
    });
  };

  useEffect(() => {
    fetchData();
    const handleGlobalRefresh = () => {
    console.log("Global refresh triggered!");
    fetchData();
  };
    const handleUpdate = () => fetchData();
    window.addEventListener("flowly-update", handleUpdate);
    return () => {
    window.removeEventListener('flowly-update', handleGlobalRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...data, refresh: fetchData };
}
