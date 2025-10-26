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
  orderBy,
  Timestamp
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
 * Busca todas as transações de uma família, com filtros dinâmicos opcionais.
 * @param {string} householdId - O ID da família.
 * @param {object} [filters={}] - Filtros opcionais.
 * @param {boolean} [filters.planned=false] - Busca plannedTransactions se true.
 * @param {string} [filters.categoryId] - Filtra por categoria.
 * @param {string} [filters.typeId] - Filtra por tipo.
 * @param {string} [filters.userId] - Filtra por usuário.
 * @param {string} [filters.yearMonth] - Filtra por mês (ex. '202510').
 * @param {Date} [filters.startDate] - Data inicial no intervalo.
 * @param {Date} [filters.endDate] - Data final no intervalo.
 * @param {number} [filters.minAmount] - Valor mínimo.
 * @param {number} [filters.maxAmount] - Valor máximo.
 * @param {string} [filters.orderByField] - Campo para ordenar.
 * @param {'asc' | 'desc'} [filters.orderDirection] - Ordem de classificação.
 * @returns {Promise<Array>} Lista de transações filtradas.
 */
export const fetchAllTransactions = async (householdId, filters = {}) => {
  const {
    planned = false,
    categoryId,
    typeId,
    userId,
    yearMonth,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    orderByField,
    orderDirection = 'asc',
  } = filters;

  const path = getCollectionPath(householdId, planned);
  const transactionsRef = collection(db, path);
  const conditions = [];

  // Filtros dinâmicos
  if (categoryId) conditions.push(where('category_id', '==', categoryId));
  if (typeId) conditions.push(where('type_id', '==', typeId));
  if (userId) conditions.push(where('user_id', '==', userId));
  if (yearMonth) conditions.push(where('yearMonth', '==', yearMonth));
  if (minAmount) conditions.push(where('amount', '>=', minAmount));
  if (maxAmount) conditions.push(where('amount', '<=', maxAmount));
  if (startDate) conditions.push(where('date', '>=', new Date(startDate)));
  if (endDate) conditions.push(where('date', '<=', new Date(endDate)));

  const q =
    conditions.length > 0
      ? query(transactionsRef, ...conditions, orderBy(orderByField || 'date', orderDirection))
      : query(transactionsRef, orderBy(orderByField || 'date', orderDirection));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

  let dateValue = date;
  if (typeof dateValue === "string") {
    dateValue = Timestamp.fromDate(new Date(dateValue + "T00:00:00"));
  } else if (dateValue instanceof Date) {
    dateValue = Timestamp.fromDate(dateValue);
  }

  const d = dateValue.toDate();
  const yearMonthIndex = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const path = getCollectionPath(householdId, planned);

  await addDoc(collection(db, path), {
    description: description.trim(),
    supplier: supplier.trim(),
    amount,
    category_id,
    type_id,
    date: dateValue,
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

  const installments = divideInstallments(amount, installments_total);
  const startDate = typeof date === "string"
    ? new Date(date + "T00:00:00")
    : (date?.toDate ? date.toDate() : date);

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
      amount: installments[i],
      category_id,
      type_id,
      date: Timestamp.fromDate(installmentDate),
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
 * @param {number} numInstallments - Total de parcelas.
 * @returns {Array<number>} Array com valores de cada parcela.
 */
const divideInstallments = (valorTotal, numInstallments) => {
  const baseValue = Math.floor((valorTotal / numInstallments) * 100) / 100;
  const rest = +(valorTotal - baseValue * numInstallments).toFixed(2);
  const installments = [];
  for (let i = 0; i < numInstallments; i++) {
    if (i === 0) {
      installments.push(Number((baseValue + rest).toFixed(2)));
    } else {
      installments.push(Number(baseValue.toFixed(2)));
    }
  }
  return installments;
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
        { ...fields, householdId, installments_total, transactionGroupId: transactionGroupId || generateGroupId() },
        planned
      );
    } else {
      await updateSingleTransaction({ householdId, transactionId, ...fields }, planned);
    }
  } else {
    await updateSingleTransaction({ householdId, transactionId, ...fields }, planned);
  }
};

/**
 * Converte uma transação planejada em efetiva.
 * Cria como efetiva e exclui a planejada.
 * @param {string} householdId
 * @param {object} transaction
 * @param {string} userId
 */
export async function convertPlannedToEffective(householdId, transaction, userId) {
  const { id, ...data } = transaction;

  const docRef = await addDoc(collection(db, `households/${householdId}/transactions`), {
    ...data,
    user_id: userId,
  });

  await deleteTransaction(householdId, transaction.id, true);
  return docRef.id;
}



/**
 * Atualiza uma transação unitária.
 * @param {object} data - Dados necessários.
 * @param {boolean} [planned=false] - Se true, altera plannedTransactions.
 * @returns {Promise<void>}
 */
const updateSingleTransaction = async ({ householdId, transactionId, ...fields }, planned = false) => {
  if (fields.date && typeof fields.date === "string") {
    fields.date = Timestamp.fromDate(new Date(fields.date + "T00:00:00"));
  } else if (fields.date instanceof Date) {
    fields.date = Timestamp.fromDate(fields.date);
  }
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
