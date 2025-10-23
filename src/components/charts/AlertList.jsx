// src/components/charts/AlertList.jsx

import React from "react";
import PropTypes from "prop-types";

/**
 * Painel de alertas recentes/ativos do sistema.
 * 
 * @prop {Array} alerts - Array de objetos de alerta: { id, title, message, alertType, createdAt, urgency }
 *
 * alertType: "budgetExceeded" | "plannedTransaction" | "lowBalance" | ...
 * urgency:  "critical" | "warning" | "info"
 */
export default function AlertList({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alert-list" style={{ margin: "2em 0" }}>
        <span style={{ color: "#999" }}>No active alerts for now 🎉</span>
      </div>
    );
  }

  // Cor/símbolo segundo tipo/urgência
  function getStyle(type, urgency) {
    if (urgency === "critical" || type === "budgetExceeded")
      return { borderLeft: "6px solid #b51a1a", background: "#ffeaea" };
    if (urgency === "warning" || type === "lowBalance")
      return { borderLeft: "6px solid #e69915", background: "#fffbe4" };
    return { borderLeft: "6px solid #1d4ca1", background: "#e9f3ff" };
  }

  function getIcon(type, urgency) {
    if (urgency === "critical" || type === "budgetExceeded") return "🚨";
    if (urgency === "warning" || type === "lowBalance") return "⚠️";
    if (type === "plannedTransaction") return "📅";
    return "ℹ️";
  }

  function formatDate(date) {
    let d = date;
    if (d && typeof d.toDate === "function") d = d.toDate();
    if (!(d instanceof Date)) d = new Date(d);
    return d.toLocaleString("pt-BR", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="alert-list" style={{ margin: "2em 0", maxWidth: 600 }}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 18,
            padding: "1em 1.5em",
            borderRadius: 8,
            ...getStyle(alert.alertType, alert.urgency),
          }}
        >
          <span style={{ fontSize: 26, lineHeight: "28px" }}>
            {getIcon(alert.alertType, alert.urgency)}
          </span>
          <div>
            <strong style={{ fontSize: 15 }}>
              {alert.title || alert.alertType}
            </strong>
            <div style={{ color: "#333", marginTop: 2, fontSize: 14 }}>
              {alert.message}
            </div>
            {alert.createdAt && (
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                {formatDate(alert.createdAt)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

AlertList.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      message: PropTypes.string,
      alertType: PropTypes.string,
      createdAt: PropTypes.any,
      urgency: PropTypes.string,
    })
  ),
};
