// src/services/transactionService.js

import {
  collection,
  updateDoc,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Busca todas as transações de uma família.
 * @param {string} householdId - O ID da família.
 * @returns {Promise<Array>} Array de objetos de transações.
 */
export const fetchAllTransactions = async (householdId) => {
  const transactionsRef = collection(db, `households/${householdId}/transactions`);
  const snapshot = await getDocs(transactionsRef);
  const transactions = [];
  snapshot.forEach((doc) => {
    transactions.push({ id: doc.id, ...doc.data() });
  });
  return transactions;
};

/**
 * Busca uma transação por ID.
 * @param {string} householdId - O ID da família.
 * @param {string} transactionId - O ID da transação.
 * @returns {Promise<Object>} Objeto transação.
 */
export const fetchTransactionById = async (householdId, transactionId) => {
  const transactionRef = doc(db, `households/${householdId}/transactions`, transactionId);
  const transactionSnap = await getDoc(transactionRef);
  if (transactionSnap.exists()) {
    return { id: transactionSnap.id, ...transactionSnap.data() };
  } else {
    throw new Error("Transação não encontrada.");
  }
};

/**
 * Cria uma transação (única ou parcelada).
 * @param {object} data - Dados da transação.
 * @param {string} data.householdId - O ID da família.
 * @param {string} data.userId - O ID do usuário.
 * @param {string} data.description - Descrição da transação.
 * @param {string} data.supplier - Fornecedor.
 * @param {number} data.amount - Valor total.
 * @param {string} data.category_id - ID da categoria.
 * @param {string} data.type_id - ID do tipo.
 * @param {string} data.date - Data da primeira parcela (aaaa-mm-dd).
 * @param {number} [data.installments_total=1] - Total de parcelas (1 se única).
 * @returns {Promise<void>}
 */
export const createTransaction = async (data) => {
  const {
    householdId,
    userId,
    description,
    supplier,
    amount,
    category_id,
    type_id,
    date,
    installments_total = 1,
  } = data;

    // Validação dos campos obrigatórios
  if (
    !householdId ||
    !userId ||
    !description?.trim() ||
    !supplier?.trim() ||
    !amount ||
    !category_id ||
    !type_id ||
    !date
  ) {
    throw new Error("Todos os campos do formulário são obrigatórios.");
  }

  if (installments_total > 1) {
    // Criação parcelada
    await createInstallmentGroup({
      householdId, userId, description, supplier, amount, category_id, type_id, date, installments_total
    });
  } else {
    // Criação única
    await createSingleTransaction({
      householdId, userId, description, supplier, amount, category_id, type_id, date,
      installments_current: 1,
      installments_total: 1,
      transactionGroupId: generateGroupId(),
    });
  }
};

/**
 * Cria uma transação unitária.
 * @param {object} data - Os dados da transação.
 * @returns {Promise<void>}
 */
const createSingleTransaction = async (data) => {
  const {
    householdId,
    userId,
    description,
    supplier,
    amount,
    category_id,
    type_id,
    date,
    installments_total = 1,
    installments_current = 1,
    transactionGroupId,
  } = data;

  const yearMonthIndex =
    new Date(date).getFullYear().toString() + String(new Date(date).getMonth() + 1).padStart(2, "0");

  await addDoc(collection(db, `households/${householdId}/transactions`), {
    description: description.trim(),
    supplier: supplier.trim(),
    amount,
    category_id,
    type_id,
    date: new Date(date + "T00:00:00"),
    installments_total,
    installments_current,
    user_id: userId,
    yearMonth: yearMonthIndex,
    transactionGroupId,
  });
};

/**
 * Cria um grupo de transações parceladas.
 * @param {object} data - Os dados da transação parcelada.
 * @returns {Promise<void>}
 */
const createInstallmentGroup = async (data) => {
  const {
    householdId,
    userId,
    description,
    supplier,
    amount,
    category_id,
    type_id,
    date,
    installments_total,
    transactionGroupId = generateGroupId(),
  } = data;

  const parcelas = dividirParcelas(amount, installments_total);
  const startDate = new Date(date + "T00:00:00");
  const batch = writeBatch(db);

  for (let i = 0; i < installments_total; i++) {
    const installmentDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + i,
      startDate.getDate()
    );
    const yearMonthIndex =
      installmentDate.getFullYear().toString() +
      String(installmentDate.getMonth() + 1).padStart(2, "0");

    const transactionRef = doc(collection(db, `households/${householdId}/transactions`));
    batch.set(transactionRef, {
      description: description.trim(),
      supplier: supplier.trim(),
      amount: parcelas[i],
      category_id,
      type_id,
      date: installmentDate,
      installments_total,
      installments_current: i + 1,
      user_id: userId,
      yearMonth: yearMonthIndex,
      transactionGroupId,
    });
  }

  await batch.commit();
};

/**
 * Gera um transactionGroupId único (UUID).
 * @returns {string}
 */
const generateGroupId = () => {
  return doc(collection(db, "households")).id;
};

/**
 * Divide o valor total das parcelas conforme padrão de cartão de crédito:
 * A primeira parcela recebe a diferença para fechar o total.
 * @param {number} valorTotal - Valor total a parcelar.
 * @param {number} numParcelas - Total de parcelas.
 * @returns {Array<number>} Array com valores de cada parcela.
 */
const dividirParcelas = (valorTotal, numParcelas) => {
  const valorBase = Math.floor((valorTotal / numParcelas) * 100) / 100;
  const resto = +(valorTotal - valorBase * numParcelas).toFixed(2);
  const parcelas = [];
  for (let i = 0; i < numParcelas; i++) {
    if (i === 0) {
      parcelas.push(Number((valorBase + resto).toFixed(2)));
    } else {
      parcelas.push(Number(valorBase.toFixed(2)));
    }
  }
  return parcelas;
};

/**
 * Atualiza uma transação (única ou grupo).
 * @param {object} data - Dados para atualização.
 * @param {string} data.householdId - O ID da família.
 * @param {string} data.transactionId - O ID da transação original.
 * @param {string} data.transactionGroupId - O groupId, se parcelada.
 * @param {boolean} data.editAllInstallments - Se for grupo, editar todas?
 * @param {number} data.installments_total - Novo total de parcelas.
 * @param {...any} restante - Os demais campos atualizados.
 * @returns {Promise<void>}
 */
export const updateTransaction = async (data) => {
  const {
    householdId,
    transactionId,
    transactionGroupId,
    editAllInstallments = false,
    installments_total = 1,
    ...fields
  } = data;

  if (installments_total > 1) {
    if (editAllInstallments) {
      await deleteInstallmentGroup(householdId, transactionGroupId);
      await createInstallmentGroup({
        ...fields,
        householdId,
        installments_total,
        transactionGroupId: transactionGroupId || generateGroupId()
      });
    } else {
      await updateSingleTransaction({ householdId, transactionId, ...fields });
    }
  } else {
    // Edite para transação única
    if (transactionGroupId) {
      await deleteInstallmentGroup(householdId, transactionGroupId);
    }
    await createSingleTransaction({
      ...fields,
      householdId,
      installments_current: 1,
      installments_total: 1,
      transactionGroupId: generateGroupId(),
    });
  }
};

/**
 * Atualiza uma transação unitária.
 * @param {object} data - Os dados necessários.
 * @param {string} data.householdId - O ID da família.
 * @param {string} data.transactionId - O ID da transação.
 * @param {...any} restante - Mais campos a atualizar.
 * @returns {Promise<void>}
 */
const updateSingleTransaction = async ({ householdId, transactionId, ...fields }) => {
  await updateDoc(doc(db, `households/${householdId}/transactions`, transactionId), fields);
};

/**
 * Apaga uma transação única.
 * @param {string} householdId - O ID da família.
 * @param {string} transactionId - O ID da transação.
 * @returns {Promise<void>}
 */
export const deleteTransaction = async (householdId, transactionId) => {
  await deleteDoc(doc(db, `households/${householdId}/transactions`, transactionId));
};

/**
 * Apaga todas as transações de um grupo parcelado.
 * @param {string} householdId - O ID da família.
 * @param {string} transactionGroupId - O ID do grupo.
 * @returns {Promise<void>}
 */
export const deleteInstallmentGroup = async (householdId, transactionGroupId) => {
  const q = query(
    collection(db, `households/${householdId}/transactions`),
    where("transactionGroupId", "==", transactionGroupId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
};
