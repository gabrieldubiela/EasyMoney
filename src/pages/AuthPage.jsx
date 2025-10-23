// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import LoginForm from '../components/forms/LoginForm';
import RegisterForm from '../components/forms/RegisterForm';
import PasswordRecoveryForm from '../components/forms/PasswordRecoveryForm';
import ToastMessage from '../components/ui/ToastMessage';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showRecovery, setShowRecovery] = useState(false);
  const [toast, setToast] = useState(null); // { type, message }

  // Função para exibir feedback global
  const showToast = (type, message) => {
    setToast({ type, message });
  };

  // LoginForm adaptado: use via prop onSuccess/onError se quiser feedback global
  // O mesmo para RegisterForm!

  return (
    <div className="auth-page">
      <div className="auth-container">
        {!showRecovery ? (
          <>
            {isLogin ? (
              <LoginForm 
                // onSuccess={() => showToast("success", "Login realizado!")}
                // onError={msg => showToast("error", msg)}
              />
            ) : (
              <RegisterForm 
                // onSuccess={() => showToast("success", "Cadastro realizado!")}
                // onError={msg => showToast("error", msg)}
              />
            )}

            <div className="auth-links">
              <p>
                {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
                <a href="#" onClick={e => { e.preventDefault(); setIsLogin(p => !p); }}>
                  {isLogin ? "Cadastre-se" : "Faça Login"}
                </a>
              </p>

              {isLogin && (
                <p>
                  <a href="#" onClick={e => { e.preventDefault(); setShowRecovery(true); }}>
                    Esqueci minha senha
                  </a>
                </p>
              )}
            </div>
          </>
        ) : (
          // Formulário de recuperação de senha (modal ou inline)
          <PasswordRecoveryForm
            onClose={() => setShowRecovery(false)}
            onSuccess={() => {
              setShowRecovery(false);
              showToast("success", "Email de recuperação enviado!");
            }}
          />
        )}
      </div>
      {/* ToastMessage Global */}
      {toast && (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          duration={4200}
        />
      )}
    </div>
  );
}
