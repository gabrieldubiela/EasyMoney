// src/components/ui/forms/EmailUpdateForm.jsx

import React, { useState } from 'react';
import { updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'; 

const EmailUpdateForm = ({ user }) => {
    const [newEmail, setNewEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        
        if (!user || newEmail === user.email) return;

        if (currentPassword.trim() === '') {
            alert("Por favor, digite sua senha atual para confirmar a mudança de e-mail.");
            return;
        }

        setEmailLoading(true);

        try {
            // 1. Cria a credencial para reautenticação
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            
            // 2. Reautentica o usuário (Requisito de segurança do Firebase)
            await reauthenticateWithCredential(user, credential);

            // 3. Atualiza o e-mail
            await updateEmail(user, newEmail);
            
            alert(`E-mail atualizado com sucesso para ${newEmail}! Você precisará verificar o novo e-mail.`);
            setCurrentPassword(''); 

        } catch (error) {
            console.error("Erro ao atualizar e-mail:", error);
            // Mensagem amigável que cobre o erro de senha incorreta ou sessão expirada
            alert(`Falha ao atualizar e-mail. A senha pode estar incorreta ou a sessão expirou. Código: ${error.code}`);
        } finally {
            setEmailLoading(false);
        }
    };
    
    return (
        <section>
            <h3>Alterar E-mail</h3>
            <form onSubmit={handleUpdateEmail}>
                
                {/* Campo E-mail */}
                <div>
                    <label htmlFor="email">Novo E-mail:</label>
                    <input id="email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
                </div>

                {/* Campo Senha Atual para Confirmação */}
                <div>
                    <label htmlFor="current-password-email">Senha Atual (Para Confirmação):</label>
                    <input id="current-password-email" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>

                <button type="submit" disabled={emailLoading}>
                    {emailLoading ? 'Atualizando...' : 'Alterar E-mail'}
                </button>
            </form>
        </section>
    );
};

export default EmailUpdateForm;