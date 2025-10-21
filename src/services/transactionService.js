// src/services/transactionService.js

import {
  collection,
  updateDoc,
  addDoc,
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
 * Retorna o caminho correto da coleção de transações (reais ou planejadas)
 * @param {string} householdId - O ID da família.
 * @param {boolean} planned - Se true, retorna plannedTransactions.
 * @returns {string} Caminho da coleção.
 */
const getCollectionPath = (householdId, planned = false) =>
  planned
    ? `households/${householdId}/plannedTransactions`
    : `households/${householdId}/transactions`;

/**
 * Busca todas as transações de uma família.
 * @param {string} householdId - O ID da família.
 * @param {boolean} [planned=false] - Se true, busca plannedTransactions.
 * @returns {Promise<Array>} Array de objetos de transações.
 */
export const fetchAllTransactions = async (householdId, planned = false) => {
  const path = getCollectionPath(householdId, planned);
  const transactionsRef = collection(db, path);
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
 * @param {boolean} [planned=false] - Se true, busca plannedTransactions.
 * @returns {Promise<Object>} Objeto transação.
 */
export const fetchTransactionById = async (householdId, transactionId, planned = false) => {
  const path = getCollectionPath(householdId, planned);
  const transactionRef = doc(db, path, transactionId);
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
 * @param {boolean} [planned=false] - Se true, cria em plannedTransactions.
 * @returns {Promise<void>}
 */
export const createTransaction = async (data, planned = false) => {
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
    await createInstallmentGroup(
      {
        householdId,
        userId,
        description,
        supplier,
        amount,
        category_id,
        type_id,
        date,
        installments_total,
      },
      planned
    );
  } else {
    await createSingleTransaction(
      {
        householdId,
        userId,
        description,
        supplier,
        amount,
        category_id,
        type_id,
        date,
        installments_current: 1,
        installments_total: 1,
        transactionGroupId: generateGroupId(),
      },
      planned
    );
  }
};

/**
 * Cria uma transação unitária.
 * @param {object} data - Dados da transação.
 * @param {boolean} [planned=false] - Se true, cria em plannedTransactions.
 * @returns {Promise<void>}
 */
const createSingleTransaction = async (data, planned = false) => {
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

  const d = new Date(date);
  const yearMonthIndex = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const path = getCollectionPath(householdId, planned);

  await addDoc(collection(db, path), {
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
 * @param {object} data - Dados da transação parcelada.
 * @param {boolean} [planned=false] - Se true, cria em plannedTransactions.
 * @returns {Promise<void>}
 */
const createInstallmentGroup = async (data, planned = false) => {
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
  const path = getCollectionPath(householdId, planned);

  for (let i = 0; i < installments_total; i++) {
    const installmentDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + i,
      startDate.getDate()
    );
    const yearMonthIndex =
      installmentDate.getFullYear().toString() +
      String(installmentDate.getMonth() + 1).padStart(2, "0");

    const transactionRef = doc(collection(db, path));
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
 * Divide o valor total das parcelas conforme padrão de cartão de crédito.
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
 * @param {boolean} [planned=false] - Se true, altera plannedTransactions.
 * @returns {Promise<void>}
 */
export const updateTransaction = async (data, planned = false) => {
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
      await deleteInstallmentGroup(householdId, transactionGroupId, planned);
      await createInstallmentGroup(
        {
          ...fields,
          householdId,
          installments_total,
          transactionGroupId: transactionGroupId || generateGroupId(),
        },
        planned
      );
    } else {
      await updateSingleTransaction({ householdId, transactionId, ...fields }, planned);
    }
  } else {
    if (transactionGroupId) {
      await deleteInstallmentGroup(householdId, transactionGroupId, planned);
    }
    await createSingleTransaction(
      {
        ...fields,
        householdId,
        installments_current: 1,
        installments_total: 1,
        transactionGroupId: generateGroupId(),
      },
      planned
    );
  }
};

/**
 * Atualiza uma transação unitária.
 * @param {object} data - Dados necessários.
 * @param {boolean} [planned=false] - Se true, altera plannedTransactions.
 * @returns {Promise<void>}
 */
const updateSingleTransaction = async ({ householdId, transactionId, ...fields }, planned = false) => {
  const path = getCollectionPath(householdId, planned);
  await updateDoc(doc(db, path, transactionId), fields);
};

/**
 * Apaga uma transação única.
 * @param {string} householdId - O ID da família.
 * @param {string} transactionId - O ID da transação.
 * @param {boolean} [planned=false] - Se true, deleta em plannedTransactions.
 * @returns {Promise<void>}
 */
export const deleteTransaction = async (householdId, transactionId, planned = false) => {
  const path = getCollectionPath(householdId, planned);
  await deleteDoc(doc(db, path, transactionId));
};

/**
 * Apaga todas as transações de um grupo parcelado.
 * @param {string} householdId - O ID da família.
 * @param {string} transactionGroupId - O ID do grupo.
 * @param {boolean} [planned=false] - Se true, deleta em plannedTransactions.
 * @returns {Promise<void>}
 */
export const deleteInstallmentGroup = async (householdId, transactionGroupId, planned = false) => {
  const path = getCollectionPath(householdId, planned);
  const q = query(collection(db, path), where("transactionGroupId", "==", transactionGroupId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
};
