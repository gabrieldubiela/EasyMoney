// src/services/alertService.js

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  where,
  query,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Busca todos os alertas de uma família, com possibilidade de filtrar por tipo e status.
 * @param {string} householdId - ID da família (household).
 * @param {object} [filters] - Filtros opcionais.
 * @param {string} [filters.type] - Tipo do alerta (ex: 'plannedTransaction', 'transferPercentage').
 * @param {string} [filters.status] - Status do alerta (ex: 'active', 'sent', 'cancelled').
 * @returns {Promise<Array<object>>} Lista de alertas encontrados.
 */
export const fetchAllAlerts = async (householdId, filters = {}) => {
  const alertsRef = collection(db, `households/${householdId}/alerts`);
  let q = alertsRef;

  const conditions = [];
  if (filters.type) conditions.push(where('alertType', '==', filters.type));
  if (filters.status) conditions.push(where('status', '==', filters.status));

  if (conditions.length > 0) {
    q = query(alertsRef, ...conditions);
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Busca um alerta específico pelo ID.
 * @param {string} householdId - ID da família.
 * @param {string} alertId - ID do alerta buscado.
 * @returns {Promise<object>} Dados do alerta encontrado.
 * @throws {Error} Se o alerta não for encontrado.
 */
export const fetchAlertById = async (householdId, alertId) => {
  const ref = doc(db, `households/${householdId}/alerts`, alertId);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error('Alerta não encontrado.');
  return { id: snap.id, ...snap.data() };
};

/**
 * Cria um novo alerta na subcoleção da household.
 * @param {string} householdId - ID da família (household).
 * @param {object} alertData - Dados do alerta.
 * @param {string} alertData.alertType - Tipo do alerta ('plannedTransaction' | 'transferPercentage').
 * @param {string} [alertData.userId] - ID do usuário.
 * @param {string} [alertData.transactionId] - ID da transação (quando aplicável).
 * @param {Array<string>} [alertData.categoryIds] - IDs de categorias envolvidas.
 * @param {Array<string>} [alertData.typeIds] - IDs de tipos.
 * @param {number} [alertData.percentageThreshold] - Percentual limite para alertas de transferência.
 * @param {string} [alertData.timeFrame] - Intervalo de tempo ('monthly' ou 'annual').
 * @param {number} [alertData.triggerDay] - Dia de disparo relatado (ex: -1, 0).
 * @param {string} [alertData.triggerTime] - Hora exata do alerta (padrão: '08:00').
 * @param {string} [alertData.message] - Mensagem do alerta.
 * @returns {Promise<string>} ID do alerta criado.
 */
export const createAlert = async (householdId, alertData) => {
  const alertsRef = collection(db, `households/${householdId}/alerts`);
  const docRef = doc(alertsRef);

  const now = Timestamp.now();
  const newAlert = {
    ...alertData,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, newAlert);
  return docRef.id;
};

/**
 * Atualiza um alerta existente.
 * Pode alterar qualquer campo, incluindo status.
 * @param {string} householdId - ID da família.
 * @param {string} alertId - ID do alerta.
 * @param {object} updateData - Dados a atualizar.
 * @returns {Promise<void>}
 */
export const updateAlert = async (householdId, alertId, updateData) => {
  const now = Timestamp.now();
  const ref = doc(db, `households/${householdId}/alerts`, alertId);

  await updateDoc(ref, { ...updateData, updatedAt: now });
};

/**
 * Deleta um alerta da subcoleção.
 * @param {string} householdId - ID da família.
 * @param {string} alertId - ID do alerta.
 * @returns {Promise<void>}
 */
export const deleteAlert = async (householdId, alertId) => {
  const ref = doc(db, `households/${householdId}/alerts`, alertId);
  await deleteDoc(ref);
};

/**
 * Cria um alerta de transação planejada.
 * Dispara aviso em um dia e horário específicos.
 * @param {string} householdId - ID da família.
 * @param {object} params - Parâmetros do alerta.
 * @param {string} params.transactionId - ID da transação planejada.
 * @param {number} [params.triggerDay=0] - Dia do alerta (0 = dia atual, -1 = anterior).
 * @param {string} [params.triggerTime='08:00'] - Horário do alerta.
 * @param {string} [params.message] - Mensagem personalizada.
 * @param {string} [params.userId] - ID do usuário.
 * @returns {Promise<string>} ID do alerta criado.
 */
export const createPlannedTransactionAlert = async (
  householdId,
  { transactionId, triggerDay = 0, triggerTime = '08:00', message, userId }
) => {
  const payload = {
    alertType: 'plannedTransaction',
    householdId,
    userId: userId || null,
    transactionId,
    triggerDay,
    triggerTime,
    message: message || 'Lembrete de transação planejada',
  };

  return await createAlert(householdId, payload);
};

/**
 * Cria um alerta de porcentagem de transferência.
 * Dispara aviso quando percentual ultrapassa o limite configurado.
 * @param {string} householdId - ID da família.
 * @param {object} params - Parâmetros do alerta.
 * @param {number} params.percentageThreshold - Percentual limite (ex: 70, 80).
 * @param {string} [params.timeFrame='monthly'] - Intervalo ('monthly' | 'annual').
 * @param {Array<string>} [params.categoryIds=[]] - IDs das categorias monitoradas.
 * @param {Array<string>} [params.typeIds=[]] - IDs dos tipos monitorados.
 * @param {string} [params.message] - Mensagem do alerta.
 * @param {string} [params.userId] - ID do usuário destinatário.
 * @returns {Promise<string>} ID do alerta criado.
 */
export const createTransferPercentageAlert = async (
  householdId,
  { percentageThreshold, timeFrame = 'monthly', categoryIds = [], typeIds = [], message, userId }
) => {
  const payload = {
    alertType: 'transferPercentage',
    householdId,
    userId: userId || null,
    percentageThreshold,
    categoryIds,
    typeIds,
    timeFrame,
    message: message || 'Limite de transferência atingido',
  };

  return await createAlert(householdId, payload);
};