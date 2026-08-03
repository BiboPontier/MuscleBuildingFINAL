import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';

type ToastKind = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<{ push: (kind: ToastKind, message: string) => void } | undefined>(undefined);

const iconByKind: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};
const colorByKind: Record<ToastKind, string> = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-electric-400',
};

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[90vw]">
          <AnimatePresence>
            {toasts.map((t) => {
              const Icon = iconByKind[t.kind];
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  className="card flex items-start gap-2.5 p-3.5 shadow-soft"
                >
                  <Icon className={`h-5 w-5 shrink-0 ${colorByKind[t.kind]}`} />
                  <p className="text-sm text-base-100 flex-1">{t.message}</p>
                  <button onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))} className="text-base-500 hover:text-base-200">
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToasterProvider>');
  return ctx;
}
