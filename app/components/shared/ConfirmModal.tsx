import { AlertTriangle } from "lucide-react";
import { COLORS } from "../../constants/colors";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export default function ConfirmModal({ 
  isOpen, onClose, onConfirm, title, message, confirmLabel = "Yes, Delete", danger = true 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${COLORS.card} w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border transition-colors`}>
        <div className="flex flex-col items-center text-center">
          
          {/* Icon Section */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 
            ${danger 
              ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' 
              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}
          >
            <AlertTriangle size={32} />
          </div>

          <h3 className={`text-xl font-bold ${COLORS.text.main} mb-2`}>{title}</h3>
          <p className={`${COLORS.text.muted} text-sm leading-relaxed mb-8`}>{message}</p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onConfirm}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-lg
                ${danger 
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 dark:shadow-none' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none'}`}
            >
              {confirmLabel}
            </button>
            <button
              onClick={onClose}
              className={`w-full py-4 rounded-2xl font-bold ${COLORS.text.muted} ${COLORS.hover} transition-colors`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}