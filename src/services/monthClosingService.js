import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const getClosingsPath = (householdId) => `households/${householdId}/monthlyClosings`;

export const getMonthClosing = async (householdId, yearMonth) => {
  const closingRef = doc(db, getClosingsPath(householdId), yearMonth);
  const snap = await getDoc(closingRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const createOrUpdateMonthClosing = async (householdId, yearMonth, data) => {
  if (!householdId || !yearMonth) throw new Error("Parâmetros obrigatórios ausentes.");
  if (!data.totalIncome || data.totalExpense === undefined) {
    throw new Error("Dados do fechamento incompletos.");
  }
  const closingRef = doc(db, getClosingsPath(householdId), yearMonth);
  await setDoc(closingRef, { ...data, closedAt: serverTimestamp() });
};

export const deleteMonthClosing = async (householdId, yearMonth) => {
  if (!householdId || !yearMonth) throw new Error("Parâmetros obrigatórios ausentes.");
  const docRef = doc(db, getClosingsPath(householdId), yearMonth);
  await deleteDoc(docRef);
};
