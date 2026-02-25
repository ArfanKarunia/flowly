"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft, Trash2, CalendarDays, Wallet } from "lucide-react";
import Link from "next/link";
import ConfirmModal from "../components/shared/ConfirmModal";
import { COLORS } from "../constants/colors";

export default function HistoryPage() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;

  // Delete State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const fetchHistory = async (pageNumber: number, isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);

    const from = pageNumber * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // Tambahkan accounts(name, icon) agar data dompet ikut terambil
    const { data } = await supabase
      .from("transactions")
      .select("*, categories(name, icon), accounts(name, icon)") 
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (data) {
      if (data.length < ITEMS_PER_PAGE) setHasMore(false); 
      
      if (isLoadMore) {
        setTransactions(prev => [...prev, ...data]);
      } else {
        setTransactions(data);
      }
    }
    
    if (!isLoadMore) setLoading(false);
  };

  useEffect(() => {
    fetchHistory(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage, true);
  };

  const handleDeleteTrigger = (transaction: any) => {
    setItemToDelete(transaction);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id, amount, transaction_type, account_id } = itemToDelete;
    
    // Kembalikan saldo dompet
    const { data: account } = await supabase.from("accounts").select("id, balance").eq("id", account_id).single();
    if (account) {
      const amountNum = Number(amount);
      const newBalance = transaction_type === "income" ? Number(account.balance) - amountNum : Number(account.balance) + amountNum;
      await supabase.from("accounts").update({ balance: newBalance }).eq("id", account_id);
      
      // Hapus transaksinya
      await supabase.from("transactions").delete().eq("id", id);
      
      // Update state UI & Universe
      setTransactions(prev => prev.filter(t => t.id !== id));
      window.dispatchEvent(new Event('flowly-update'));
    }

    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  // Fungsi pintar untuk mengelompokkan transaksi per tanggal
  const groupedTransactions = transactions.reduce((acc: any, t: any) => {
    const dateStr = t.transaction_date;
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(t);
    return acc;
  }, {});

  return (
    <div className={`p-6 md:p-10 max-w-2xl mx-auto space-y-8 min-h-screen ${COLORS.bg} ${COLORS.text.main} pb-24 animate-in slide-in-from-right-8 duration-300`}>
      <header className="flex items-center gap-4">
        <Link href="/" className={`p-2 ${COLORS.card} rounded-full border ${COLORS.hover} transition-colors`}>
          <ChevronLeft size={24} className={COLORS.text.muted} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transaction History</h1>
          <p className={`${COLORS.text.muted} text-sm`}>All your flows in one place</p>
        </div>
      </header>

      {loading ? (
        <p className={`text-center ${COLORS.text.muted} py-10`}>Loading history...</p>
      ) : transactions.length === 0 ? (
        <div className={`text-center py-10 ${COLORS.card} border rounded-3xl`}>
          <CalendarDays size={48} className={`mx-auto ${COLORS.text.muted} opacity-20 mb-3`} />
          <p className={`${COLORS.text.muted} font-medium`}>Belum ada riwayat transaksi.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(groupedTransactions).map((date) => (
            <div key={date} className="space-y-3">
              <h3 className={`text-sm font-bold ${COLORS.text.muted} uppercase tracking-wider px-2 border-b border-slate-200 dark:border-slate-800 pb-2`}>
                {new Date(date).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              
              <div className={`${COLORS.card} rounded-[32px] border shadow-sm overflow-hidden`}>
                {groupedTransactions[date].map((t: any, index: number) => (
                  <div key={t.id} className={`group flex items-center justify-between p-4 ${COLORS.hover} transition-all ${index !== groupedTransactions[date].length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl bg-slate-50 dark:bg-slate-800 w-12 h-12 flex items-center justify-center rounded-xl shrink-0">
                        {t.categories?.icon || (t.transaction_type === "income" ? "🤑" : "💸")}
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${COLORS.text.main} line-clamp-1`}>{t.note || "No Note"}</p>
                        
                        {/* --- BAGIAN YANG DI-UPDATE: Menampilkan Kategori + Dompet --- */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[10px] font-bold ${COLORS.text.muted} uppercase bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-md`}>
                            {t.categories?.name || "Uncategorized"}
                          </span>
                          <span className={`text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1`}>
                            <span className="opacity-70">{t.accounts?.icon || <Wallet size={12}/>}</span> 
                            {t.accounts?.name || "Unknown Wallet"}
                          </span>
                        </div>
                        {/* ----------------------------------------------------------- */}

                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <p className={`font-bold ${t.transaction_type === "expense" ? "text-rose-500" : "text-emerald-500"}`}>
                        {t.transaction_type === "expense" ? "-" : "+"}Rp{Number(t.amount).toLocaleString("id-ID")}
                      </p>
                      <button onClick={() => handleDeleteTrigger(t)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors p-2 md:opacity-0 group-hover:opacity-100">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {hasMore && (
            <button 
              onClick={handleLoadMore}
              className={`w-full py-4 rounded-2xl font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors mt-4`}
            >
              Load More
            </button>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Transaksi?"
        message="Yakin mau hapus transaksi ini dari riwayat? Saldo di dompet kamu akan otomatis disesuaikan kembali."
        danger={true}
      />
    </div>
  );
}