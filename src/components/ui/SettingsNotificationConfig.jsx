// src/components/ui/SettingsNotificationConfig.jsx

import React, { useState } from "react";

// Exemplos: você pode expandir para salvar no Firestore, ou usar o contexto do app
const SettingsNotificationConfig = ({ onSave }) => {
  // Pode ser trocado para buscar/salvar no Firestore real
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [threshold, setThreshold] = useState(80);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Salve em contexto/firestore conforme necessário
    if (onSave) onSave({ enableAlerts, threshold });
    alert("Configurações de alerta salvas!");
  };

  return (
    <form onSubmit={handleSubmit} className="form" style={{ margin: "16px 0" }}>
      <h3>Alertas de Gastos</h3>
      <label>
        <input
          type="checkbox"
          checked={enableAlerts}
          onChange={e => setEnableAlerts(e.target.checked)}
        />
        Ativar alertas quando uma categoria ultrapassar x% do limite
      </label>
      <div>
        <label>
          Notificar acima de
          <input
            type="number"
            value={threshold}
            min="10"
            max="100"
            step="1"
            onChange={e => setThreshold(e.target.value)}
            style={{ width: 60, margin: "0 8px"}}
          />
          %
        </label>
      </div>
      <button type="submit">
        Salvar Alertas
      </button>
    </form>
  );
};

export default SettingsNotificationConfig;
