// src/services/authService.js

import {
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

/**
 * Realiza login usando email e senha.
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

/**
 * Faz logout do usuário logado.
 * @returns {Promise<void>}
 */
export const logout = () => signOut(auth);

/**
 * Atualiza o nome do usuário (displayName) no Auth.
 * @param {object} user - Usuário do Firebase Auth.
 * @param {string} displayName - Novo nome de exibição.
 * @returns {Promise<void>}
 */
export const authUpdateDisplayName = (user, displayName) =>
  updateProfile(user, { displayName });

/**
 * Atualiza o email do usuário no Auth (requer senha atual).
 * @param {object} user - Usuário do Firebase Auth.
 * @param {string} newEmail - Novo email.
 * @param {string} password - Senha do usuário para reautenticação.
 * @returns {Promise<void>}
 */
export const authUpdateEmail = async (user, newEmail, password) => {
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  return updateEmail(user, newEmail);
};

/**
 * Atualiza a senha do usuário no Auth (requer senha atual).
 * @param {object} user - Usuário do Firebase Auth.
 * @param {string} currentPassword - Senha atual.
 * @param {string} newPassword - Nova senha.
 * @returns {Promise<void>}
 */
export const authUpdatePassword = async (user, currentPassword, newPassword) => {
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  return updatePassword(user, newPassword);
};
