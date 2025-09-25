// src/components/ui/InviteCodeDisplay.jsx

import React, { useState } from 'react';

const InviteCodeDisplay = ({ householdId }) => {
    const [copyMessage, setCopyMessage] = useState('Copiar Código');

    const handleCopyCode = () => {
        if (householdId) {
            // Usa a API de Clipboard do navegador para copiar o texto
            navigator.clipboard.writeText(householdId);
            setCopyMessage('Copiado!');
            setTimeout(() => setCopyMessage('Copiar Código'), 2000);
        }
    };

    return (
        <>
            <h3 style={{ marginTop: '20px' }}>Convidar Membros</h3>
            <p>Compartilhe o código abaixo. O usuário convidado deve usá-lo ao se registrar para acessar as despesas desta Família/Casa.</p>

            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                border: '1px dashed #007bff', 
                padding: '10px', 
                backgroundColor: '#e6f0ff' 
            }}>
                <strong style={{ flexGrow: 1, marginRight: '10px' }}>{householdId || 'Carregando...'}</strong>
                <button 
                    type="button" 
                    onClick={handleCopyCode} 
                    style={{ padding: '8px 15px', cursor: 'pointer' }}
                    disabled={!householdId}
                >
                    {copyMessage}
                </button>
            </div>
        </>
    );
};

export default InviteCodeDisplay;