import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type ToastTone = "success" | "error" | "info";

interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: ToastMessage | null;
  showToast: (message: string, tone?: ToastTone) => void;
  dismissToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const dismissToast = useCallback(() => setToast(null), []);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ id: Date.now(), message, tone });
    timeoutRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const value = useMemo(
    () => ({ toast, showToast, dismissToast }),
    [toast, showToast, dismissToast],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
