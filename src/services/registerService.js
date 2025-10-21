// src/services/registerService.js

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { createHousehold, addMemberToHousehold, fetchHouseholdById } from './householdService';
import { createUser } from './userService';

/**
 * Serviço responsável por registrar usuário e gerenciar vínculo com família.
 * Realiza a autenticação, cria ou vincula o usuário a uma família (household),
 * e cria o documento do usuário no Firestore utilizando os services já existentes.
 *
 * @param {object} userData - Dados do formulário de registro.
 * @param {string} userData.email - O e-mail do novo usuário.
 * @param {string} userData.password - A senha do novo usuário.
 * @param {string} userData.name - O nome do novo usuário.
 * @param {string} [userData.householdId] - O ID de uma família existente (para entrar em uma já criada).
 * @param {string} [userData.familyName] - Nome da nova família (caso crie uma).
 * @returns {Promise<void>}
 */
export const registerUserAndHandleHousehold = async ({
  email,
  password,
  name,
  householdId,
  familyName
}) => {
  // 1. Criação do usuário no Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  let finalHouseholdId = householdId;
  let finalFamilyName = familyName;

  try {
    // 2. Lógica de Família (Household)
    if (householdId) {
      // Usuário está entrando em uma família existente
      const existingHousehold = await fetchHouseholdById(householdId);

      if (existingHousehold) {
        // Adiciona o usuário como membro comum (não admin)
        await addMemberToHousehold(householdId, user.uid);
      } else {
        // Household inexistente: desfaz criação de auth
        await user.delete();
        throw new Error("Código de família inválido. Verifique e tente novamente.");
      }
    } else {
      // Usuário está criando nova família
      finalHouseholdId = user.uid; // Cria a família com o UID do usuário
      await createHousehold(finalHouseholdId, familyName, user.uid); // Adiciona como admin
    }

    // 3. Criação do documento de usuário no Firestore
    await createUser(user.uid, [finalHouseholdId], false, name);

  } catch (error) {
    // Rollback: exclui usuário do Auth em caso de erro no Firestore
    await user.delete();
    throw error;
  }
};
