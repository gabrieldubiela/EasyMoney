// src/hooks/useRegister.js
import { useState } from "react";
import { registerUserAndHandleHousehold } from "../services/registerService";

/**
 * Hook para registrar usuário e família, responde loading/sucesso/erro.
 */
export default function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const register = async (userData) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await registerUserAndHandleHousehold(userData);
      setSuccess("Usuário registrado com sucesso!");
      return true;
    } catch (err) {
      setError(err.message || "Erro ao registrar.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error, success };
}
