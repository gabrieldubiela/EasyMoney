// src/services/transactionService.js

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Função auxiliar interna para criar o grupo de transações (parcelas)
const createTransactionGroup = async (householdId, userId, data, transactionGroupId) => {
  const { description, supplier, category, type, date, totalAmount, numInstallments } = data;

  const monthlyAmount = totalAmount / numInstallments;
  const startDate = new Date(date + 'T00:00:00'); // Garante que a data não tenha problemas de fuso horário

  const batch = writeBatch(db);

  for (let i = 0; i < numInstallments; i++) {
    const installmentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate());
    const yearMonthIndex = installmentDate.getFullYear().toString() + String(installmentDate.getMonth() + 1).padStart(2, '0');
    
    const transactionRef = doc(collection(db, `households/${householdId}/transactions`)); // Gera uma nova referência
    
    batch.set(transactionRef, {
      description: description.trim(),
      supplier: supplier.trim(),
      amount: monthlyAmount,
      category_id: category,
      type_id: type,
      date: installmentDate,
      installments_total: numInstallments,
      installments_current: i + 1,
      user_id: userId,
      yearMonth: yearMonthIndex,
      transactionGroupId: transactionGroupId, // ID do grupo
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
};

// Função auxiliar interna para deletar um grupo de transações
const deleteTransactionGroup = async (householdId, transactionGroupId) => {
  const q = query(collection(db, `households/${householdId}/transactions`), where('transactionGroupId', '==', transactionGroupId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
};


// --- FUNÇÃO PRINCIPAL EXPORTADA ---
export const saveTransaction = async ({ householdId, userId, formData, editingData }) => {
  const { description, supplier, amount, category, type, date, installments } = formData;
  const { transactionId, transactionGroupId } = editingData;

  const originalAmount = parseFloat(amount);
  const numInstallments = parseInt(installments);

  if (!householdId || !description.trim() || isNaN(originalAmount) || originalAmount <= 0 || !category || !type) {
    throw new Error("Por favor, preencha todos os campos obrigatórios e use um valor positivo.");
  }
  
  // A lógica de sinal (receita/despesa) permanece no formulário por enquanto, 
  // então assumimos que 'amount' já vem com o sinal correto.
  const signedAmount = originalAmount;
  
  if (transactionId) {
    // --- LÓGICA DE EDIÇÃO ---
    const isGroupEdit = numInstallments > 1 && window.confirm(
      "Esta é uma transação parcelada. Deseja aplicar esta alteração a TODAS as parcelas do grupo? (Recomendado)"
    );

    if (isGroupEdit) {
      await deleteTransactionGroup(householdId, transactionGroupId);
      await createTransactionGroup(householdId, userId, { ...formData, totalAmount: signedAmount, numInstallments }, transactionGroupId);
    } else {
      const monthlyAmount = signedAmount / numInstallments;
      await updateDoc(doc(db, `households/${householdId}/transactions`, transactionId), {
        description: description.trim(),
        supplier: supplier.trim(),
        amount: monthlyAmount,
        category_id: category,
        type_id: type,
        // Não alteramos a data de uma única parcela para manter a simplicidade
      });
    }
  } else {
    // --- LÓGICA DE ADIÇÃO ---
    const newTransactionGroupId = doc(collection(db, 'households')).id; // Gera um ID único
    await createTransactionGroup(householdId, userId, { ...formData, totalAmount: signedAmount, numInstallments }, newTransactionGroupId);
  }
};