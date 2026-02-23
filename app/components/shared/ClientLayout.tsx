"use client";
import {
  LayoutGrid,
  PlusCircle,
  CreditCard,
  PieChart,
  Settings,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import TransactionModal from "./TransactionModal";
import { useFlowly } from "@/hooks/useFlowly";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client"; // <-- Ganti import-nya jadi ini

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient(); // <-- PANGGIL PABRIK KUNCINYA DI SINI

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { refresh } = useFlowly();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    getUser();
  }, [pathname]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.href = "/login";
    } else {
      alert("Gagal logout: " + error.message);
    }
  };

  if (pathname === "/login") {
    // Kalau di halaman login, tampilkan polosan tanpa sidebar
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex min-h-screen">
        {/* --- SIDEBAR (Desktop) --- */}
        <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-6 sticky top-0 h-screen">
          <h1 className="text-2xl font-bold text-blue-600 mb-10">Flowly.</h1>

          <nav className="space-y-2 flex-1">
            {/* Bungkus SidebarItem dengan Link */}
            <Link href="/">
              <SidebarItem
                icon={<LayoutGrid size={20} />}
                label="Dashboard"
                active={pathname === "/"}
              />
            </Link>

            <Link href="/wallets">
              <SidebarItem
                icon={<CreditCard size={20} />}
                label="My Wallets"
                active={pathname === "/wallets"}
              />
            </Link>

            <Link href="/analytics">
              <SidebarItem
                icon={<PieChart size={20} />}
                label="Analytics"
                active={pathname === "/analytics"}
              />
            </Link>

            <Link href="/settings">
              <SidebarItem
                icon={<Settings size={20} />}
                label="Settings"
                active={pathname === "/settings"}
              />
            </Link>
          </nav>

          <div className="space-y-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-blue-600 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <PlusCircle size={20} />
              New Transaction
            </button>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA (Navbar + Content) --- */}
        <main className="flex-1 flex flex-col w-full overflow-x-hidden relative">
          {/* --- TOP NAVBAR --- */}
          <header className="w-full bg-white/50 backdrop-blur-md border-b border-slate-100 p-4 flex justify-between md:justify-end items-center sticky top-0 z-40">
            <h1 className="text-xl font-bold text-blue-600 md:hidden">
              Flowly.
            </h1>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-2xl transition-all focus:outline-none"
              >
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-bold text-slate-800">
                    {user?.user_metadata?.full_name || "Sign In First"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {user?.email || "Loading..."}
                  </span>
                </div>
                <img
                  src={
                    user?.user_metadata?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${user?.user_metadata?.full_name || "User"}&background=eff6ff&color=2563eb`
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${user?.user_metadata?.full_name || "User"}&background=eff6ff&color=2563eb`;
                  }}
                />
                <ChevronDown
                  size={16}
                  className="text-slate-400 hidden md:block"
                />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-50 md:hidden bg-slate-50">
                      <p className="text-sm font-bold truncate text-slate-800">
                        {user?.user_metadata?.full_name || "My Account"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.email || "Loading..."}
                      </p>
                    </div>

                    <div className="p-2">
                      <button className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                        <UserIcon size={18} /> Edit Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all mt-1"
                      >
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* --- PAGE CONTENT --- */}
          <div className="max-w-4xl mx-auto w-full pb-24 md:pb-8">
            {children}
          </div>
        </main>

        {/* --- BOTTOM NAV (Mobile) --- */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-lg border-t border-slate-100 px-8 py-3 flex justify-between items-center z-50">
          <Link href="/">
            <LayoutGrid
              size={24}
              className={pathname === "/" ? "text-blue-600" : "text-slate-400"}
            />
          </Link>

          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 p-3 rounded-full -mt-12 shadow-lg shadow-blue-200 border-4 border-white cursor-pointer hover:scale-105 transition-transform"
          >
            <PlusCircle size={28} className="text-white" />
          </div>

          <Link href="/wallets">
            <CreditCard
              size={24}
              className={
                pathname === "/wallets" ? "text-blue-600" : "text-slate-400"
              }
            />
          </Link>
        </nav>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={refresh}
      />
    </>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all ${active ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
    >
      {icon}
      <span className="font-semibold text-sm">{label}</span>
    </div>
  );
}
