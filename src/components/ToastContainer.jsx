import { createContext, useContext, useState, useCallback } from "react";
import Toast from "./Toast";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe ser usado dentro de ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration = 4000) => {
    return showToast(message, "success", duration);
  }, [showToast]);

  const error = useCallback((message, duration = 5000) => {
    return showToast(message, "error", duration);
  }, [showToast]);

  const warning = useCallback((message, duration = 4000) => {
    return showToast(message, "warning", duration);
  }, [showToast]);

  const info = useCallback((message, duration = 4000) => {
    return showToast(message, "info", duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

