"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft, Plus, Edit2, Trash2, Wallet } from "lucide-react";
import Link from "next/link";
import ConfirmModal from "../../components/shared/ConfirmModal";
import { COLORS } from "../../constants/colors";

export default function ManageWalletsPage() {
  const supabase = createClient();
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💳");
  const [balance, setBalance] = useState<number | string>("");

  // Delete State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<any>(null);

  const fetchWallets = async () => {
    setLoading(true);
    const { data } = await supabase.from("accounts").select("*").order("created_at", { ascending: true });
    if (data) setWallets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setName("");
    setIcon("💳");
    setBalance("");
    setIsModalOpen(true);
  };

  const openEditModal = (w: any) => {
    setEditId(w.id);
    setName(w.name);
    setIcon(w.icon || "💳");
    setBalance(w.balance);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (editId) {
      await supabase.from("accounts").update({ name, icon, balance: Number(balance) }).eq("id", editId);
    } else {
      await supabase.from("accounts").insert([{ 
        name, 
        icon, 
        balance: Number(balance), 
        user_id: session.user.id 
      }]);
    }

    setIsModalOpen(false);
    fetchWallets();
    window.dispatchEvent(new Event("flowly-update"));
  };

  const triggerDelete = (w: any) => {
    setWalletToDelete(w);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!walletToDelete) return;
    await supabase.from("accounts").delete().eq("id", walletToDelete.id);
    setIsConfirmOpen(false);
    setWalletToDelete(null);
    fetchWallets();
    window.dispatchEvent(new Event("flowly-update"));
  };

  return (
    <div className={`p-6 md:p-10 max-w-2xl mx-auto space-y-8 min-h-screen ${COLORS.bg} ${COLORS.text.main} pb-24 animate-in slide-in-from-right-8 duration-300`}>
      {/* Header with Back Button */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings" className={`p-2 ${COLORS.card} rounded-full border ${COLORS.hover} transition-colors`}>
            <ChevronLeft size={24} className={COLORS.text.muted} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Wallets</h1>
            <p className={`${COLORS.text.muted} text-sm`}>Manage your money sources</p>
          </div>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Wallet List */}
      <div className="space-y-3">
        {loading ? (
          <p className={`text-center ${COLORS.text.muted} py-10`}>Loading wallets...</p>
        ) : wallets.length === 0 ? (
          <div className={`text-center py-10 ${COLORS.card} border rounded-3xl`}>
            <Wallet size={48} className={`mx-auto ${COLORS.text.muted} opacity-20 mb-3`} />
            <p className={`${COLORS.text.muted} font-medium`}>No wallets found</p>
          </div>
        ) : (
          wallets.map((w) => (
            <div key={w.id} className={`${COLORS.card} border p-4 rounded-3xl flex items-center justify-between shadow-sm ${COLORS.hover} transition-all group`}>
              <div className="flex items-center gap-4">
                <div className={`text-3xl bg-slate-50 dark:bg-slate-800 w-14 h-14 flex items-center justify-center rounded-2xl`}>
                  {w.icon || "💳"}
                </div>
                <div>
                  <h3 className={`font-bold text-lg`}>{w.name}</h3>
                  <p className={`${COLORS.text.muted} text-sm font-medium`}>
                    Rp {Number(w.balance).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(w)} className={`p-2 ${COLORS.text.muted} hover:text-blue-600 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors`}>
                  <Edit2 size={18} />
                </button>
                <button onClick={() => triggerDelete(w)} className={`p-2 ${COLORS.text.muted} hover:text-rose-600 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors`}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL FORM ADD/EDIT WALLET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className={`${COLORS.card} w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95`}>
            <h2 className="text-xl font-bold mb-6">{editId ? "Edit Wallet" : "New Wallet"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Icon (Emoji)</label>
                <input 
                  type="text" 
                  value={icon} 
                  onChange={(e) => setIcon(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-2xl text-center focus:ring-2 focus:ring-blue-500 outline-none ${COLORS.text.main}`}
                  maxLength={2}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Wallet Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. BCA, Cash, GoPay"
                  className={`w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none font-medium ${COLORS.text.main}`}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Current Balance (Rp)</label>
                <input 
                  type="number" 
                  value={balance} 
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0"
                  className={`w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none font-medium ${COLORS.text.main}`}
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 py-4 rounded-2xl font-bold ${COLORS.text.muted} bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors`}>
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Dompet?"
        message={`Yakin mau hapus dompet ${walletToDelete?.name}? Transaksi yang memakai dompet ini mungkin akan kehilangan referensinya.`}
      />
    </div>
  );
}