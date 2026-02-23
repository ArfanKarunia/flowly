import { AlertTriangle, X } from "lucide-react";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          {/* Icon Section */}
          <div className={`w-16 h-16 ${danger ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'} rounded-full flex items-center justify-center mb-6`}>
            <AlertTriangle size={32} />
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">{message}</p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onConfirm}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95 ${danger ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-100' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100'}`}
            >
              {confirmLabel}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}