// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import LoginForm from '../components/forms/LoginForm';
import RegisterForm from '../components/forms/RegisterForm';
import ToastMessage from '../components/ui/ToastMessage';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [toast, setToast] = useState(null);

  // Função para exibir feedback global
  const showToast = (type, message) => {
    setToast({ type, message });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {isLogin ? (
          <LoginForm 
            onSuccess={(msg) => showToast("success", msg || "Login realizado!")}
            onError={(msg) => showToast("error", msg || "Erro ao fazer login")}
        />
        ) : (
          <RegisterForm 
            onSuccess={(msg) => showToast("success", msg || "Cadastro realizado!")}
            onError={(msg) => showToast("error", msg || "Erro ao cadastrar")}
        />
        )}

        <div className="auth-links" style={{ textAlign: "center", paddingTop: 5 }}>
          <p>
            {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
            <a 
              href="#" 
              onClick={(e) => { 
                e.preventDefault(); 
                setIsLogin(prev => !prev); 
              }}
            >
              {isLogin ? "Cadastre-se" : "Faça Login"}
            </a>
          </p>
        </div>
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
