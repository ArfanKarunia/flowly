"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Calendar, Grip } from "lucide-react";
import { COLORS } from "../../constants/colors";

export default function TransactionModal({
  isOpen,
  onClose,
  onRefresh,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const supabase = createClient();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [allWallets, setAllWallets] = useState<any[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: catData } = await supabase.from("categories").select("*");
      if (catData) setCategories(catData);

      const { data: walletData } = await supabase.from("accounts").select("*");
      if (walletData) {
        setAllWallets(walletData);
        if (walletData.length > 0) setSelectedWalletId(walletData[0].id);
      }
    };
    if (isOpen) fetchInitialData();
  }, [isOpen]);

  const filteredCategories = categories.filter((c) => (c.type || c.transaction_type) === type);

  useEffect(() => {
    if (filteredCategories.length > 0) {
      const isExist = filteredCategories.find((c) => c.id === selectedCategoryId);
      if (!isExist) setSelectedCategoryId(filteredCategories[0].id);
    }
  }, [type, filteredCategories, selectedCategoryId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) return alert("Pilih kategori dulu ya!");
    if (!selectedWalletId) return alert("Pilih dompet dulu ya!");

    const currentWallet = allWallets.find(w => w.id === selectedWalletId);
    const amountNum = Number(amount);

    const { error: transactionError } = await supabase
      .from("transactions")
      .insert([{
        amount: amountNum,
        transaction_type: type,
        note,
        transaction_date: date,
        category_id: selectedCategoryId,
        account_id: selectedWalletId,
      }]);

    if (transactionError) return alert("Gagal mencatat transaksi: " + transactionError.message);

    if (currentWallet) {
      const newBalance = type === "income"
        ? Number(currentWallet.balance) + amountNum
        : Number(currentWallet.balance) - amountNum;

      const { error: updateWalletError } = await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", selectedWalletId);

      if (updateWalletError) {
        alert("Transaksi tercatat, tapi gagal update saldo: " + updateWalletError.message);
      } else {
        window.dispatchEvent(new Event('flowly-update'));
        onRefresh();
        onClose();
        setAmount("");
        setNote("");
        setDate(new Date().toISOString().split("T")[0]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`${COLORS.card} w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 transition-colors`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${COLORS.text.main}`}>New Flow</h2>
          <button onClick={onClose} className={`p-2 ${COLORS.hover} ${COLORS.text.muted} rounded-full transition-colors`}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="space-y-5 overflow-y-auto max-h-[60vh] pr-2 scrollbar-hide">
            {/* Tab Income/Expense */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === "expense" ? "bg-white dark:bg-slate-700 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === "income" ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Income
              </button>
            </div>

            {/* Input Amount */}
            <div>
              <label className={`text-xs font-bold ${COLORS.text.muted} uppercase mb-1 block`}>Amount</label>
              <input
                type="number"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full text-5xl font-bold border-none focus:ring-0 p-0 placeholder:text-slate-200 dark:placeholder:text-slate-800 bg-transparent ${COLORS.text.main} outline-none`}
              />
            </div>

            {/* Category Selector */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className={`text-xs font-bold ${COLORS.text.muted} uppercase flex items-center gap-1 mb-1`}>
                <Grip size={12} /> Select Category
              </label>
              <div className="flex gap-3 overflow-x-auto py-3 px-2 mx-2 snap-x scrollbar-hide">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`shrink-0 flex flex-col items-center justify-center min-w-19 h-19 rounded-2xl border-2 transition-all snap-start
                      ${selectedCategoryId === cat.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md scale-[1.05]"
                        : `border-slate-100 dark:border-slate-800 ${COLORS.card} hover:border-slate-200`}`}
                  >
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span className={`text-[10px] font-bold w-full text-center px-1 truncate ${selectedCategoryId === cat.id ? "text-blue-700 dark:text-blue-400" : COLORS.text.muted}`}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note & Date */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div>
                <label className={`text-xs font-bold ${COLORS.text.muted} uppercase mb-1 block`}>Note</label>
                <input
                  type="text"
                  placeholder="For what?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={`w-full py-2 outline-none bg-transparent ${COLORS.text.main} font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700`}
                />
              </div>
              <div>
                <label className={`text-xs font-bold ${COLORS.text.muted} uppercase flex items-center gap-1 mb-1`}>
                  <Calendar size={12} /> Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full py-2 outline-none bg-transparent ${COLORS.text.main} font-medium`}
                />
              </div>
            </div>

            {/* Wallet Selection */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className={`text-xs font-bold ${COLORS.text.muted} uppercase mb-3 block`}>Select Wallet</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {allWallets.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelectedWalletId(w.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all whitespace-nowrap
                    ${selectedWalletId === w.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : `border-slate-100 dark:border-slate-800 ${COLORS.text.muted}`}`}
                  >
                    <span>{w.icon}</span>
                    <span className="text-sm font-bold">{w.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 mt-4"
          >
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
}