"use client";
import { useFlowly } from "@/hooks/useFlowly";
import { Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import ConfirmModal from "./components/shared/ConfirmModal";
import { COLORS } from "./constants/colors"; 
import Link from "next/link";

export default function Home() {
  const { balance, income, expense, transactions, allWallets, refresh } = useFlowly();
  const supabase = createClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  
  const displayBalance = selectedWallet ? selectedWallet.balance : balance;

  const handleDeleteTrigger = (transaction: any) => {
    setItemToDelete(transaction);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id, amount, transaction_type, account_id } = itemToDelete;
    
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

      await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", account_id);

      await supabase.from("transactions").delete().eq("id", id);
      window.dispatchEvent(new Event('flowly-update'));
      refresh();
    }

    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className={`p-6 md:p-10 space-y-8 min-h-screen ${COLORS.bg} ${COLORS.text.main} pb-24 transition-colors duration-300`}>
      
      <header className="space-y-4">
        <div>
          <p className={COLORS.text.muted}>
            {selectedWallet
              ? `Balance in ${selectedWallet.name}`
              : "Safe to spend (Total)"}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Rp{Number(displayBalance).toLocaleString("id-ID")}
          </h1>
        </div>

        {/* --- WALLET QUICK SWITCHER --- */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          <button
            onClick={() => setSelectedWallet(null)}
            className={`shrink-0 px-5 py-2 rounded-2xl font-bold text-sm transition-all shadow-sm
              ${!selectedWallet 
                ? "bg-blue-600 text-white" 
                : `${COLORS.card} ${COLORS.text.muted} hover:bg-slate-50 dark:hover:bg-slate-800`}`}
          >
            All
          </button>

          {allWallets.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWallet(w)}
              className={`shrink-0 px-5 py-2 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm
                ${selectedWallet?.id === w.id 
                  ? "bg-blue-600 text-white" 
                  : `${COLORS.card} ${COLORS.text.muted} hover:bg-slate-50 dark:hover:bg-slate-800`}`}
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
          <div className={`${COLORS.card} p-5 rounded-3xl shadow-sm border`}>
            <p className="text-rose-500 text-xs font-semibold uppercase mb-1">Expense</p>
            <p className={`text-xl font-bold ${COLORS.text.main}`}>Rp{expense.toLocaleString("id-ID")}</p>
          </div>
        </div>
      )}

      {/* --- Today's Flows Section --- */}
      <section className={`${COLORS.card} p-2 md:p-6 rounded-3xl border md:shadow-sm`}>
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className={`font-bold text-xl ${COLORS.text.main}`}>Today's Flows</h2>
          <Link href="/history" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
            View All History ➔
          </Link>
        </div>
        
        <div className="space-y-1">
          {transactions.filter((t: any) => !selectedWallet || t.account_id === selectedWallet.id).length === 0 ? (
            <div className="py-8 text-center">
              <p className={COLORS.text.muted}>There are no transactions today. Let's record your first flow!</p>
            </div>
          ) : (
            transactions
              .filter((t: any) => !selectedWallet || t.account_id === selectedWallet.id)
              .map((t: any) => (
                <div key={t.id} className={`group flex items-center justify-between p-4 ${COLORS.hover} rounded-2xl transition-all`}>
                  <div className="flex items-center gap-4">
                    <div className="text-2xl bg-slate-50 dark:bg-slate-800 w-12 h-12 flex items-center justify-center rounded-xl">
                      {t.categories?.icon || (t.transaction_type === "income" ? "🤑" : "💸")}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${COLORS.text.main}`}>{t.note || "No Note"}</p>
                      <p className={`text-xs ${COLORS.text.muted}`}>
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
                      onClick={() => handleDeleteTrigger(t)}
                      className="text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors p-2 md:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </section>

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