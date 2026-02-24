'use client';
import { createClient } from '@/utils/supabase/client';
import { Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { COLORS } from "../constants/colors";

export default function WalletsPage() {
  const supabase = createClient();
  const [wallets, setWallets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');

  const fetchWallets = async () => {
    const { data } = await supabase.from('accounts').select('*').order('created_at', { ascending: true });
    if (data) setWallets(data);
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    
    const { error } = await supabase.from('accounts').insert([
      { 
        name, 
        balance: Number(balance), 
        color_code: '#3b82f6',
        user_id: session?.user.id // Pastikan user_id terisi
      }
    ]);

    if (error) alert(error.message);
    else {
      setIsModalOpen(false);
      setName('');
      setBalance('');
      fetchWallets();
      window.dispatchEvent(new Event('flowly-update')); // Update balance di navbar/dashboard
    }
  };

  return (
    <div className={`p-6 md:p-10 space-y-8 min-h-screen ${COLORS.bg} ${COLORS.text.main} pb-24 transition-colors duration-300`}>
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Wallets</h1>
          <p className={COLORS.text.muted}>Manage your financial sources</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-2xl flex items-center gap-2 font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> <span className="hidden md:inline">Add Wallet</span>
        </button>
      </header>

      {/* Daftar Kartu Dompet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wallets.length > 0 ? (
          wallets.map((wallet) => (
            <div key={wallet.id} className={`${COLORS.card} border p-8 rounded-[32px] shadow-sm relative overflow-hidden group`}>
              <div className="relative z-10">
                <p className={`${COLORS.text.muted} text-xs font-bold uppercase tracking-wider mb-1`}>{wallet.name}</p>
                <h2 className="text-3xl font-bold italic">Rp{Number(wallet.balance).toLocaleString('id-ID')}</h2>
              </div>
              {/* Variasi hiasan kartu */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            </div>
          ))
        ) : (
          <div className={`${COLORS.card} col-span-full p-12 text-center border-dashed border-2 rounded-[32px]`}>
            <p className={COLORS.text.muted}>No wallets added yet.</p>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH DOMPET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className={`${COLORS.card} p-8 rounded-[32px] w-full max-w-sm shadow-2xl animate-in zoom-in-95`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`font-bold text-xl ${COLORS.text.main}`}>New Wallet</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`p-2 rounded-full ${COLORS.hover} ${COLORS.text.muted}`}
              >
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleAddWallet} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Name</label>
                <input 
                  placeholder="e.g. BCA, GoPay, Cash" 
                  value={name} onChange={(e) => setName(e.target.value)}
                  className={`w-full p-4 mt-1 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${COLORS.text.main}`}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Initial Balance</label>
                <input 
                  type="number" placeholder="0" 
                  value={balance} onChange={(e) => setBalance(e.target.value)}
                  className={`w-full p-4 mt-1 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${COLORS.text.main}`}
                  required
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all mt-4">
                Create Wallet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}