"use client";
import { 
  Wallet, 
  Tags, 
  Trash2, 
  Moon, 
  Globe, 
  ChevronRight, 
  CircleDollarSign 
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import ConfirmModal from "../components/shared/ConfirmModal"; 
import { useTheme } from "next-themes";
import { COLORS } from "../constants/colors";

export default function SettingsPage() {
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // State untuk Modal Reset
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fungsi Eksekusi Reset Data
  const handleResetData = async () => {
    setIsResetting(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const userId = session.user.id;

      // 1. Hapus SEMUA transaksi milik user ini
      await supabase
        .from("transactions")
        .delete()
        .eq("user_id", userId);

      // 2. Reset SEMUA saldo dompet (accounts) menjadi 0
      await supabase
        .from("accounts")
        .update({ balance: 0 })
        .eq("user_id", userId);

      // 3. Broadcast ke seluruh aplikasi untuk refresh data (Dashboard dll)
      window.dispatchEvent(new Event("flowly-update"));
    }

    setIsResetting(false);
    setIsResetModalOpen(false);
    alert("Semua data transaksi berhasil direset! Saldo kembali 0.");
  };

  return (
    <div className={`p-6 md:p-10 space-y-8 min-h-screen ${COLORS.bg} ${COLORS.text.main} pb-24 transition-colors duration-300 animate-in fade-in`}>
      <header className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Settings
        </h1>
        <p className={`${COLORS.text.muted} text-sm font-medium`}>
          Manage your app preferences and data
        </p>
      </header>

      {/* --- PREFERENCES SECTION --- */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
          Preferences
        </h2>
        <div className={`${COLORS.card} rounded-3xl border shadow-sm overflow-hidden`}>
          <SettingItem 
            icon={<CircleDollarSign size={20} className="text-emerald-500" />}
            title="Currency"
            subtitle="Indonesian Rupiah (IDR)"
          />
          <SettingItem 
            icon={<Globe size={20} className="text-blue-500" />}
            title="Language"
            subtitle="English"
          />
          <div onClick={() => mounted && setTheme(theme === "dark" ? "light" : "dark")}>
            <SettingItem 
              icon={<Moon size={20} className="text-indigo-500" />}
              title="Theme"
              subtitle={mounted ? (theme === 'dark' ? 'Dark Mode' : 'Light Mode') : 'Loading...'}
              hideBorder
            />
          </div>
        </div>
      </section>

      {/* --- DATA MANAGEMENT SECTION --- */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
          Data Management
        </h2>
        <div className={`${COLORS.card} rounded-3xl border shadow-sm overflow-hidden`}>
          <Link href="/settings/wallets" className={`w-full text-left flex items-center justify-between p-4 ${COLORS.hover} transition-colors border-b border-slate-100 dark:border-slate-800 group block`}>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                <Wallet size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Manage Wallets</p>
                <p className={`text-xs ${COLORS.text.muted}`}>Add, edit, or delete your accounts</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
          </Link>

          <Link href="/settings/categories" className={`w-full text-left flex items-center justify-between p-4 ${COLORS.hover} transition-colors group block`}>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                <Tags size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Manage Categories</p>
                <p className={`text-xs ${COLORS.text.muted}`}>Customize your expense and income tags</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
          </Link>
        </div>
      </section>

      {/* --- DANGER ZONE --- */}
      <section className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-rose-400 uppercase tracking-wider px-2">
          Danger Zone
        </h2>
        <div className={`${COLORS.card} rounded-3xl border border-rose-100 dark:border-rose-900/30 shadow-sm overflow-hidden`}>
          <button 
            onClick={() => setIsResetModalOpen(true)}
            className="w-full text-left flex items-center justify-between p-4 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-xl group-hover:scale-110 transition-transform">
                <Trash2 size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-rose-600">Reset All Data</p>
                <p className="text-xs text-rose-400">Permanently delete all transactions</p>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* --- MODAL KONFIRMASI RESET --- */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetData}
        title="Reset Semua Data?"
        message="PERINGATAN: Semua riwayat transaksi kamu akan dihapus permanen dan saldo dompet akan kembali menjadi Rp 0. Daftar dompet dan kategori TIDAK akan dihapus. Yakin ingin melanjutkan?"
        confirmLabel={isResetting ? "Meriset..." : "Ya, Reset Semua"}
        danger={true}
      />
    </div>
  );
}

function SettingItem({ icon, title, subtitle, hideBorder = false }: any) {
  return (
    <div className={`flex items-center justify-between p-4 ${COLORS.hover} transition-colors cursor-pointer ${!hideBorder ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
          {icon}
        </div>
        <div>
          <p className="font-bold text-sm">{title}</p>
          <p className={`text-xs ${COLORS.text.muted}`}>{subtitle}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-300" />
    </div>
  );
}