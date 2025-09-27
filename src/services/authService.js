// src/services/authService.js

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

/**
 * Função de serviço para registrar um novo usuário.
 * Contém toda a lógica de negócio para criar o usuário na autenticação,
 * criar/juntar-se a uma família (household) e criar o documento do usuário no Firestore.
 * * @param {object} userData - Os dados do formulário de registro.
 * @param {string} userData.email - O email do usuário.
 * @param {string} userData.password - A senha do usuário.
 * @param {string} userData.firstName - O primeiro nome do usuário.
 * @param {string} userData.lastName - O sobrenome do usuário.
 * @param {string} [userData.householdId] - O ID de uma família existente (opcional).
 * @param {string} [userData.familyName] - O nome para uma nova família (opcional).
 */
export const registerUserAndHandleHousehold = async ({ email, password, firstName, lastName, householdId, familyName }) => {
  // 1. Cria o usuário no Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  let finalHouseholdId = householdId;
  let finalFamilyName = familyName;

  try {
    // 2. Lógica de Família (Household)
    if (householdId) {
      // Opção A: Entrando com convite/ID existente
      const householdRef = doc(db, 'households', householdId);
      const householdSnap = await getDoc(householdRef);

      if (householdSnap.exists()) {
        // Se a família existe, adiciona o novo membro
        await updateDoc(householdRef, {
          [`members.${user.uid}`]: true
        });
      } else {
        // Se o código da família é inválido, desfaz a criação do usuário para não deixar lixo
        await user.delete();
        throw new Error('Código de Família inválido.');
      }
    } else {
      // Opção B: Criando uma nova família
      finalFamilyName = familyName || `${firstName} ${lastName}'s Family`;
      finalHouseholdId = user.uid; // Define o ID da família como o UID do criador

      await setDoc(doc(db, 'households', finalHouseholdId), {
        family_name: finalFamilyName,
        members: {
          [user.uid]: true
        },
        createdAt: serverTimestamp()
      });
    }

    // 3. Criação do Documento do Usuário (users)
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      firstName: firstName,
      lastName: lastName,
      householdId: finalHouseholdId,
      isAdmin: false,
      createdAt: serverTimestamp()
    });

  } catch (error) {
    // Se qualquer passo na lógica do Firestore falhar, é uma boa prática
    // deletar o usuário recém-criado no Auth para evitar inconsistências.
    await user.delete();
    // Re-lança o erro para que o componente possa pegá-lo e exibir para o usuário.
    throw error;
  }
};