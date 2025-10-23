// src/components/ui/InviteCodeDisplay.jsx

import React, { useState } from 'react';

export default function InviteCodeDisplay({ householdId }) {
  const [copyMessage, setCopyMessage] = useState('Copiar Código');

  const handleCopy = () => {
    if (householdId && navigator.clipboard) {
      navigator.clipboard.writeText(householdId);
      setCopyMessage('Copiado!');
      setTimeout(() => setCopyMessage('Copiar Código'), 2000);
    }
  };

  return (
    <>
      <h3>Convidar Membros</h3>
      <p>Compartilhe o código abaixo. O usuário convidado deve usá-lo ao se registrar para acessar esta Família.</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <code style={{ fontWeight: 'bold', background: '#eef3ff', padding: '3px 12px', borderRadius: 8 }}>{householdId || '...'}</code>
        <button type="button" onClick={handleCopy} disabled={!householdId}>
          {copyMessage}
        </button>
      </div>
    </>
  );
}
