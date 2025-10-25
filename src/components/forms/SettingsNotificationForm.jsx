// src/components/forms/SettingsNotificationForm.jsx

import React, { useState } from "react";
import "../../styles/forms.css";
import "../../styles/buttons.css";

const SettingsNotificationForm = ({ onSave }) => {
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [threshold, setThreshold] = useState(80);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave({ enableAlerts, threshold });
    alert("Configurações de alerta salvas!");
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h3>Alertas de Gastos</h3>
      <div className="form-group inline">
        <input
          type="checkbox"
          id="enable-alerts"
          checked={enableAlerts}
          onChange={e => setEnableAlerts(e.target.checked)}
      />
        <label className="form-label" htmlFor="enable-alerts">
          Ativar alertas quando uma categoria ultrapassar x% do limite
        </label>
      </div>
      <div className="form-group inline">
        <label className="form-label" htmlFor="threshold" >
          Notificar acima de
        </label>
        <input
          id="threshold"
          type="number"
          className="input-small"
          value={threshold}
          min="10"
          max="100"
          step="1"
          onChange={e => setThreshold(e.target.value)}          
      />
        <span>%</span>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Salvar Alertas
        </button>
      </div>
    </form>
  );
};

export default SettingsNotificationForm;
