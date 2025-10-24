// src/components/ui/ToastMessage.jsx

import React, { useEffect } from "react";

/**
 * ToastMessage - componente de alerta feedback global/transiente.
 * Tipos: "success" | "error" | "info"
 */
export default function ToastMessage({ type = "info", message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Classes por tipo
  const typeClass = type ? `toast-${type}` : "";

  return (
    <div className={`toast-message ${typeClass}`} tabIndex={0} role="alert">
      <span>{message}</span>
      {onClose && (
        <span
          className="toast-close"
          tabIndex={0}
          role="button"
          aria-label="Fechar"
          onClick={onClose}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onClose(); }}
        >
          ×
        </span>
      )}
    </div>
  );
}
