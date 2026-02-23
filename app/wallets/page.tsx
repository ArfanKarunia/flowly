'use client';
import { createClient } from '@/utils/supabase/client';
import { Plus, Wallet, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WalletsPage() {
  const supabase = createClient();
  const [wallets, setWallets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State untuk form dompet baru
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
    const { error } = await supabase.from('accounts').insert([
      { name, balance: Number(balance), color_code: '#3b82f6' }
    ]);

    if (error) alert(error.message);
    else {
      setIsModalOpen(false);
      setName('');
      setBalance('');
      fetchWallets(); // Refresh list dompet
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Wallets</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-2xl flex items-center gap-2 font-bold"
        >
          <Plus size={20} /> Add Wallet
        </button>
      </header>

      {/* Daftar Kartu Dompet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="bg-white border p-6 rounded-[32px] shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase">{wallet.name}</p>
            <h2 className="text-2xl font-bold">Rp{Number(wallet.balance).toLocaleString('id-ID')}</h2>
          </div>
        ))}
      </div>

      {/* MODAL TAMBAH DOMPET (Simple) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold">New Wallet</h2>
              <button onClick={() => setIsModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleAddWallet} className="space-y-4">
              <input 
                placeholder="Wallet Name (e.g. BCA)" 
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-slate-100 rounded-xl outline-none"
                required
              />
              <input 
                type="number" placeholder="Initial Balance" 
                value={balance} onChange={(e) => setBalance(e.target.value)}
                className="w-full p-3 bg-slate-100 rounded-xl outline-none"
                required
              />
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Create Wallet</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}