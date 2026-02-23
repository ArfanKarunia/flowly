"use client";
import { useFlowly } from "@/hooks/useFlowly";
import { Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import ConfirmModal from "./components/shared/ConfirmModal"; // <-- Import Modal baru kita

export default function Home() {
  const { balance, income, expense, transactions, allWallets, refresh } = useFlowly();
  const supabase = createClient();

  // State untuk kontrol Modal Konfirmasi
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // State untuk filter dompet
  const [selectedWallet, setSelectedWallet] = useState<any>(null);

  const displayBalance = selectedWallet ? selectedWallet.balance : balance;

  // 1. Fungsi yang memicu munculnya Modal (Pengganti window.confirm)
  const handleDeleteTrigger = (transaction: any) => {
    setItemToDelete(transaction);
    setIsConfirmOpen(true);
  };

  // 2. Fungsi eksekusi hapus yang sebenarnya setelah user klik "Yes, Delete"
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const { id, amount, transaction_type, account_id } = itemToDelete;

    // Ambil saldo dompet yang bersangkutan
    const { data: account } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("id", account_id)
      .single();

    if (account) {
      const amountNum = Number(amount);
      const newBalance =
        transaction_type === "income"
          ? Number(account.balance) - amountNum
          : Number(account.balance) + amountNum;

      // Update saldo di database
      await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", account_id);

      // Hapus transaksi
      await supabase.from("transactions").delete().eq("id", id);

      // Beritahu universe lain untuk refresh (broadcast)
      window.dispatchEvent(new Event('flowly-update'));
      refresh();
    }

    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 text-slate-900 pb-24">
      <header className="space-y-4">
        <div>
          <p className="text-slate-500 text-sm font-medium">
            {selectedWallet
              ? `Balance in ${selectedWallet.name}`
              : "Safe to spend (Total)"}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 transition-all">
            Rp{Number(displayBalance).toLocaleString("id-ID")}
          </h1>
        </div>

        {/* --- WALLET QUICK SWITCHER --- */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          <button
            onClick={() => setSelectedWallet(null)}
            className={`shrink-0 px-5 py-2 rounded-2xl font-bold text-sm transition-all shadow-sm
              ${!selectedWallet ? "bg-blue-600 text-white" : "bg-white border border-slate-100 text-slate-500 hover:bg-slate-50"}`}
          >
            All
          </button>

          {allWallets.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWallet(w)}
              className={`shrink-0 px-5 py-2 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm
                ${selectedWallet?.id === w.id ? "bg-blue-600 text-white" : "bg-white border border-slate-100 text-slate-500 hover:bg-slate-50"}`}
            >
              <span>{w.icon || "💳"}</span>
              {w.name}
            </button>
          ))}
        </div>
      </header>

      {/* Income/Expense Grid */}
      {!selectedWallet && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="bg-emerald-500 p-5 rounded-3xl text-white shadow-sm">
            <p className="text-emerald-100 text-xs font-semibold uppercase mb-1">Income</p>
            <p className="text-xl font-bold">Rp{income.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
            <p className="text-rose-500 text-xs font-semibold uppercase mb-1">Expense</p>
            <p className="text-xl font-bold text-slate-800">Rp{expense.toLocaleString("id-ID")}</p>
          </div>
        </div>
      )}

      {/* Recent Flows Section */}
      <section className="bg-white p-2 md:p-6 rounded-3xl border border-slate-100 md:shadow-sm">
        <h2 className="font-bold text-xl mb-6 px-4 text-slate-900">Recent Flows</h2>
        <div className="space-y-1">
          {transactions
            .filter((t: any) => !selectedWallet || t.account_id === selectedWallet.id)
            .map((t: any) => (
              <div
                key={t.id}
                className="group flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">
                    {t.categories?.icon || (t.transaction_type === "income" ? "🤑" : "💸")}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{t.note || "No Note"}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(t.transaction_date).toLocaleDateString("id-ID", { 
                        weekday: "short", day: "numeric", month: "short" 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className={`font-bold ${t.transaction_type === "expense" ? "text-rose-500" : "text-emerald-500"}`}>
                    {t.transaction_type === "expense" ? "-" : "+"}Rp{Number(t.amount).toLocaleString("id-ID")}
                  </p>

                  <button
                    onClick={() => handleDeleteTrigger(t)} // <-- Sekarang panggil trigger, bukan window.confirm
                    className="text-slate-300 hover:text-rose-500 transition-colors p-2 md:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* --- KOMPONEN MODAL KONFIRMASI --- */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Transaksi?"
        message="Yakin mau hapus transaksi ini? Saldo di dompet kamu akan otomatis disesuaikan kembali."
        confirmLabel="Ya, Hapus"
        danger={true}
      />
    </div>
  );
}