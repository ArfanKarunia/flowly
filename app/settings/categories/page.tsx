"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft, Plus, Edit2, Trash2, Tags } from "lucide-react";
import Link from "next/link";
import ConfirmModal from "../../components/shared/ConfirmModal";
import { COLORS } from "../../constants/colors";

export default function ManageCategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🍔");
  const [type, setType] = useState<"expense" | "income">("expense");

  // Delete State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("created_at", { ascending: true });
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setName("");
    setIcon("🍔");
    setType(activeTab);
    setIsModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditId(c.id);
    setName(c.name);
    setIcon(c.icon || "🍔");
    setType(c.type || c.transaction_type || "expense");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const payload = { 
      name, 
      icon, 
      transaction_type: type, 
      user_id: session.user.id 
    };

    if (editId) {
      await supabase.from("categories").update(payload).eq("id", editId);
    } else {
      await supabase.from("categories").insert([payload]);
    }

    setIsModalOpen(false);
    fetchCategories();
  };

  const triggerDelete = (c: any) => {
    setCategoryToDelete(c);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    await supabase.from("categories").delete().eq("id", categoryToDelete.id);
    setIsConfirmOpen(false);
    setCategoryToDelete(null);
    fetchCategories();
  };

  const filteredCategories = categories.filter(c => (c.type || c.transaction_type) === activeTab);

  return (
    <div className={`p-6 md:p-10 max-w-2xl mx-auto space-y-8 min-h-screen ${COLORS.bg} ${COLORS.text.main} pb-24 animate-in slide-in-from-right-8 duration-300`}>
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/settings" className={`p-2 ${COLORS.card} rounded-full border ${COLORS.hover} transition-colors`}>
            <ChevronLeft size={24} className={COLORS.text.muted} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <p className={`${COLORS.text.muted} text-sm`}>Manage your flow tags</p>
          </div>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab("expense")}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === "expense" ? "bg-white dark:bg-slate-700 text-rose-500 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
        >
          Expense
        </button>
        <button
          onClick={() => setActiveTab("income")}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === "income" ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
        >
          Income
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        {loading ? (
          <p className={`text-center ${COLORS.text.muted} py-10`}>Loading categories...</p>
        ) : filteredCategories.length === 0 ? (
          <div className={`text-center py-10 ${COLORS.card} border rounded-3xl`}>
            <Tags size={48} className={`mx-auto ${COLORS.text.muted} opacity-20 mb-3`} />
            <p className={`${COLORS.text.muted} font-medium`}>No {activeTab} categories yet</p>
          </div>
        ) : (
          filteredCategories.map((c) => (
            <div key={c.id} className={`${COLORS.card} border p-4 rounded-3xl flex items-center justify-between shadow-sm ${COLORS.hover} transition-all group`}>
              <div className="flex items-center gap-4">
                <div className="text-3xl bg-slate-50 dark:bg-slate-800 w-14 h-14 flex items-center justify-center rounded-2xl">
                  {c.icon || "🍔"}
                </div>
                <h3 className="font-bold text-lg">{c.name}</h3>
              </div>
              <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(c)} className={`p-2 ${COLORS.text.muted} hover:text-blue-600 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors`}>
                  <Edit2 size={18} />
                </button>
                <button onClick={() => triggerDelete(c)} className={`p-2 ${COLORS.text.muted} hover:text-rose-600 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors`}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL FORM ADD/EDIT CATEGORY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className={`${COLORS.card} w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95`}>
            <h2 className="text-xl font-bold mb-6">{editId ? "Edit Category" : "New Category"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!editId && (
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Type</label>
                   <div className="flex gap-2">
                      <button type="button" onClick={() => setType("expense")} className={`flex-1 py-2 rounded-xl font-bold text-sm border ${type === "expense" ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"}`}>Expense</button>
                      <button type="button" onClick={() => setType("income")} className={`flex-1 py-2 rounded-xl font-bold text-sm border ${type === "income" ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"}`}>Income</button>
                   </div>
                </div>
              )}

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
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Food, Salary, Transport"
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
        title="Hapus Kategori?"
        message={`Yakin mau hapus kategori ${categoryToDelete?.name}?`}
      />
    </div>
  );
}