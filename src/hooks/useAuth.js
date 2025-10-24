// src/hooks/useAuth.js

import { useState } from "react";
import { loginWithEmail, logout } from "../services/authService";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

/**
 * Hook centralizado para autenticação de usuário.
 * Exponibiliza login, logout, estado loading, erro e sucesso.
 */
export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login padrão por email
  const login = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      await loginWithEmail(email, password);
      return true;
    } catch (err) {
      setError(err.message || "Erro ao fazer login.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout simples
  const doLogout = async () => {
    setLoading(true);
    setError("");
    try {
      await logout();
      return true;
    } catch (err) {
      setError(err.message || "Erro ao fazer logout.");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Recuperação de senha por email
  const recover = async (email) => {
    setLoading(true);
    setError("");
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      setError(err.message || "Erro ao enviar recuperação.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, logout: doLogout, loading, error, recover };
}
