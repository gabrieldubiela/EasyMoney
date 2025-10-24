// src/components/charts/AlertList.jsx

import React from "react";
import PropTypes from "prop-types";
import "../../styles/alerts.css";

/**
 * Painel de alertas recentes/ativos do sistema.
 *
 * @prop {Array} alerts - Array de objetos de alerta: { id, title, message, alertType, createdAt, urgency }
 *
 * alertType: "budgetExceeded" | "plannedTransaction" | "lowBalance" | ...
 * urgency: "critical" | "warning" | "info"
 */
export default function AlertList({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alert-list">
        <div className="alert-empty">No active alerts for now 🎉</div>
      </div>
    );
  }

  function getUrgency(urgency, type) {
    if (urgency === "critical" || type === "budgetExceeded") return "critical";
    if (urgency === "warning" || type === "lowBalance") return "warning";
    return "info";
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
    <div className="alert-list">
      {alerts.map((alert) => {
        const urgencyClass = `alert-${getUrgency(alert.urgency, alert.alertType)}`;
        return (
          <div key={alert.id} className={`alert-item ${urgencyClass}`}>
            <span className="alert-icon">{getIcon(alert.alertType, alert.urgency)}</span>
            <div className="alert-content">
              <strong>{alert.title || alert.alertType}</strong>
              <p>{alert.message}</p>
              {alert.createdAt && <time>{formatDate(alert.createdAt)}</time>}
            </div>
          </div>
        );
      })}
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
