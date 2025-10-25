// src/components/forms/UserProfileForm.jsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/useAppContext';
import ToastMessage from '../ui/ToastMessage';
import { updateUser } from '../../services/userService';
import {
  authUpdateDisplayName,
  authUpdateEmail,
  authUpdatePassword
} from '../../services/authService';
import "../../styles/forms.css";
import "../../styles/buttons.css";

export default function UserProfileForm() {
  const { user, loading } = useAppContext();
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => setToast({ type, message: msg });

  if (loading) return <div className="loading">Carregando dados do usuário...</div>;
  if (!user) return <div className="loading">Usuário não encontrado.</div>;

  return (
    <div className="profile-panel">
      <ProfileDataForm user={user} showToast={showToast}/>
      <hr/>
      <EmailUpdateForm user={user} showToast={showToast}/>
      <hr/>
      <PasswordUpdateForm user={user} showToast={showToast}/>
      {toast && <ToastMessage {...toast} onClose={() => setToast(null)} duration={3500}/>}
    </div>
  );
}

// ---- PROFILE ----
function ProfileDataForm({ user, showToast }) {
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
  }, [user?.name]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const newDisplayName = displayName.trim();
    if (!user || !newDisplayName)
      return showToast("error", "O nome não pode estar vazio.");

    setIsUpdating(true);
    try {
      await updateUser(user.uid, { name: newDisplayName });
      if (user.displayName !== newDisplayName) {
        await authUpdateDisplayName(user, newDisplayName);
      }
      showToast('success', 'Nome atualizado!');
    } catch (error) {
      showToast('error', 'Falha ao atualizar nome.');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section>
      <h3>Dados básicos</h3>
      <p><strong>Email:</strong> {user.email}</p>
      <form onSubmit={handleUpdateProfile} className="form profile-form" autoComplete="off">
        <div className="form-group">
          <label htmlFor="displayName" className="form-label required">Nome:</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            disabled={isUpdating}
        />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isUpdating}>
            {isUpdating ? 'Salvando...' : 'Salvar Dados'}
          </button>
        </div>
      </form>
    </section>
  );
}

// ---- EMAIL ----
function EmailUpdateForm({ user, showToast }) {
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!user || newEmail === user.email) return;
    if (currentPassword.trim() === '')
      return showToast("error", "Digite sua senha para confirmar.");

    setEmailLoading(true);
    try {
      await authUpdateEmail(user, newEmail, currentPassword);
      showToast('success', `E-mail atualizado para ${newEmail}! Verifique o novo e-mail.`);
      setCurrentPassword('');
    } catch (error) {
      showToast('error', 'Falha ao atualizar email. Senha pode estar incorreta!');
      console.error(error);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <section>
      <h3>Alterar E-mail</h3>
      <form onSubmit={handleUpdateEmail} className="form email-form" autoComplete="off">
        <div className="form-group">
          <label htmlFor="email" className="form-label required">Novo E-mail:</label>
          <input id="email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required disabled={emailLoading}/>
        </div>
        <div className="form-group">
          <label htmlFor="current-password-email" className="form-label required">Senha Atual:</label>
          <input id="current-password-email" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required disabled={emailLoading}/>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={emailLoading}>
            {emailLoading ? 'Atualizando...' : 'Alterar E-mail'}
          </button>
        </div>
      </form>
    </section>
  );
}

// ---- PASSWORD ----
function PasswordUpdateForm({ user, showToast }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6)
      return showToast("error", "Nova senha deve ter ao menos 6 caracteres.");
    if (currentPassword.trim() === '')
      return showToast("error", "Digite sua senha atual.");
    if (newPassword === currentPassword)
      return showToast("error", "Nova senha não pode ser igual à anterior.");

    setPasswordLoading(true);
    try {
      await authUpdatePassword(user, currentPassword, newPassword);
      showToast('success', 'Senha atualizada!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      showToast('error', 'Falha ao atualizar senha. Senha pode estar incorreta!');
      console.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <section>
      <h3>Alterar Senha</h3>
      <form onSubmit={handleUpdatePassword} className="form password-form" autoComplete="off">
        <div className="form-group">
          <label htmlFor="current-password-pass" className="form-label required">Senha Atual:</label>
          <input id="current-password-pass" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required disabled={passwordLoading}/>
        </div>
        <div className="form-group">
          <label htmlFor="new-password" className="form-label required">Nova Senha:</label>
          <input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} disabled={passwordLoading}/>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
            {passwordLoading ? 'Atualizando...' : 'Alterar Senha'}
          </button>
        </div>
      </form>
    </section>
  );
}
