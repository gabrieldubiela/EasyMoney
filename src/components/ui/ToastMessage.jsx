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

  const colors = {
    success: "#188710",
    error: "#c01e1e",
    info: "#286ee0"
  };

  return (
    <div
      className="toast-message"
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        minWidth: 200,
        background: "#fff",
        color: colors[type] || "#222",
        border: `2px solid ${colors[type] || "#222"}`,
        borderRadius: 8,
        padding: "10px 24px",
        boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
        zIndex: 1005,
        fontWeight: 500
      }}
    >
      {message}
      {onClose && (
        <span
          style={{
            marginLeft: 18,
            cursor: "pointer",
            fontWeight: 700
          }}
          onClick={onClose}
        >
          ×
        </span>
      )}
    </div>
  );
}
