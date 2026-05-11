import React from "react";
import { X, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { useToastStore } from "../../store/toastStore";
import type { ToastType } from "../../store/toastStore";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const backgrounds: Record<ToastType, string> = {
  success: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  warning: "bg-yellow-50 border-yellow-200",
  info: "bg-blue-50 border-blue-200",
};

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center p-4 rounded-lg border shadow-lg animate-slide-in ${backgrounds[toast.type]}`}
        >
          <div className="flex-shrink-0">{icons[toast.type]}</div>
          <p className="ml-3 text-sm font-medium text-gray-900">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
