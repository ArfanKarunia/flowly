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

import { COLORS } from "../../constants/colors";
import { useState, useEffect } from "react";
import TransactionModal from "./TransactionModal";
import { useFlowly } from "@/hooks/useFlowly";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import EditProfileModal from "./EditProfileModal";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { refresh } = useFlowly();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  

  const fetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setUser(session.user);
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.href = "/login";
    } else {
      alert("Gagal logout: " + error.message);
    }
  };

  if (pathname === "/login") return <>{children}</>;

  return (
    <>
      <div className={`flex min-h-screen ${COLORS.bg} transition-colors duration-300`}>
        {/* --- SIDEBAR (Desktop) --- */}
        <aside className={`hidden md:flex w-64 ${COLORS.card} border-r flex-col p-6 sticky top-0 h-screen`}>
          <h1 className="text-2xl font-bold text-blue-600 mb-10">Flowly.</h1>

          <nav className="space-y-2 flex-1">
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
                active={pathname.startsWith("/settings")}
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

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 flex flex-col w-full overflow-x-hidden relative">
          {/* --- TOP NAVBAR --- */}
          <header className={`w-full ${COLORS.nav} backdrop-blur-md border-b p-4 flex justify-between md:justify-end items-center sticky top-0 z-40 transition-colors`}>
            <h1 className="text-xl font-bold text-blue-600 md:hidden">Flowly.</h1>

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-3 p-2 ${COLORS.hover} rounded-2xl transition-all focus:outline-none`}
              >
                <div className="hidden md:flex flex-col text-right">
                  <span className={`text-sm font-bold ${COLORS.text.main}`}>
                    {user?.user_metadata?.full_name || "Sign In First"}
                  </span>
                  <span className={`text-xs ${COLORS.text.muted}`}>
                    {user?.email || "Loading..."}
                  </span>
                </div>
                <img
                  src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.user_metadata?.full_name || "User"}&background=eff6ff&color=2563eb`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                />
                <ChevronDown size={16} className={`${COLORS.text.muted} hidden md:block`} />
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                  <div className={`absolute right-0 mt-2 w-56 ${COLORS.card} border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2`}>
                    <div className="p-4 border-b border-slate-50 dark:border-slate-800 md:hidden bg-slate-50 dark:bg-slate-800/50">
                      <p className={`text-sm font-bold truncate ${COLORS.text.main}`}>
                        {user?.user_metadata?.full_name || "My Account"}
                      </p>
                      <p className={`text-xs ${COLORS.text.muted} truncate`}>
                        {user?.email || "Loading..."}
                      </p>
                    </div>

                    <div className="p-2">
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false); 
                          setIsProfileModalOpen(true); 
                        }}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium ${COLORS.text.main} ${COLORS.hover} rounded-xl transition-all`}
                      >
                        <UserIcon size={18} /> Edit Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all mt-1"
                      >
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </header>

          <div className="max-w-4xl mx-auto w-full pb-32 md:pb-8 transition-colors">
            {children}
          </div>
        </main>

        {/* --- BOTTOM NAV (Mobile) --- */}
        <nav className={`md:hidden fixed bottom-0 left-0 w-full ${COLORS.nav} backdrop-blur-lg border-t px-8 pt-3 pb-10 flex justify-between items-center z-50 transition-colors`}>
          <Link href="/">
            <LayoutGrid size={24} className={pathname === "/" ? "text-blue-600" : COLORS.text.muted} />
          </Link>

          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 p-3 rounded-full -mt-16 shadow-lg shadow-blue-200 border-4 border-white dark:border-slate-900 cursor-pointer hover:scale-105 transition-transform"
          >
            <PlusCircle size={28} className="text-white" />
          </div>

          <Link href="/settings">
            <Settings size={24} className={pathname.startsWith("/settings") ? "text-blue-600" : COLORS.text.muted} />
          </Link>
        </nav>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={refresh} />
      <EditProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        user={user} 
        onProfileUpdate={fetchUser} 
      />
    </>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all 
      ${active 
        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-sm" 
        : `text-slate-500 ${COLORS.hover}`}`}>
      {icon}
      <span className="font-semibold text-sm">{label}</span>
    </div>
  );
}