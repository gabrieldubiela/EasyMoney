// src/components/ui/forms/PasswordUpdateForm.jsx

import React, { useState } from 'react';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'; 

const PasswordUpdateForm = ({ user }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            alert("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (currentPassword.trim() === '') {
            alert("Por favor, digite sua senha atual para confirmar a mudança.");
            return;
        }
        if (newPassword === currentPassword) {
            alert("A nova senha não pode ser igual à senha atual.");
            return;
        }

        setPasswordLoading(true);

        try {
            // 1. Reautenticação (usando a senha antiga)
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // 2. Atualiza a nova senha
            await updatePassword(user, newPassword);

            alert('Senha atualizada com sucesso!');
            
            // Limpar os campos após o sucesso
            setCurrentPassword(''); 
            setNewPassword('');

        } catch (error) {
            console.error("Erro ao atualizar senha:", error);
            alert(`Falha ao atualizar senha. A senha atual pode estar incorreta ou a sessão expirou. Código: ${error.code}`);
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <section>
            <h3>Alterar Senha</h3>
            <form onSubmit={handleUpdatePassword}>
                
                {/* Campo Senha Atual para Confirmação */}
                <div>
                    <label htmlFor="current-password-pass">Senha Atual:</label>
                    <input id="current-password-pass" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>

                {/* Campo Nova Senha */}
                <div>
                    <label htmlFor="new-password">Nova Senha:</label>
                    <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength="6" />
                </div>

                <button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? 'Atualizando...' : 'Alterar Senha'}
                </button>
            </form>
        </section>
    );
};

export default PasswordUpdateForm;