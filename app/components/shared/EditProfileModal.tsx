"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, User, Link as LinkIcon } from "lucide-react";
import { COLORS } from "../../constants/colors";

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onProfileUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdate: () => void;
}) {
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Isi otomatis form dengan data user saat ini ketika modal dibuka
  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.user_metadata?.full_name || "");
      setAvatarUrl(user.user_metadata?.avatar_url || "");
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Update metadata di Supabase Auth
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        avatar_url: avatarUrl,
      },
    });

    setIsLoading(false);

    if (error) {
      alert("Gagal update profil: " + error.message);
    } else {
      onProfileUpdate(); // Panggil fungsi refresh di ClientLayout
      onClose(); // Tutup modal
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${COLORS.card} w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 transition-colors border`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${COLORS.text.main}`}>Edit Profile</h2>
          <button onClick={onClose} className={`p-2 ${COLORS.hover} ${COLORS.text.muted} rounded-full transition-colors`}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Input Nama */}
          <div>
            <label className={`text-xs font-bold ${COLORS.text.muted} uppercase flex items-center gap-1 mb-1 ml-1`}>
              <User size={12} /> Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Arfan"
              className={`w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none font-medium ${COLORS.text.main} transition-colors`}
              required
            />
          </div>

          {/* Input Foto (URL) */}
          <div>
            <label className={`text-xs font-bold ${COLORS.text.muted} uppercase flex items-center gap-1 mb-1 ml-1`}>
              <LinkIcon size={12} /> Avatar URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className={`w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none font-medium ${COLORS.text.main} transition-colors`}
            />
            <p className={`text-[10px] mt-2 ml-1 ${COLORS.text.muted}`}>
              *Kosongkan jika ingin memakai inisial nama secara otomatis.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 active:scale-[0.98] transition-all mt-4 disabled:opacity-70"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}