import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Credenciais de configuração que você copiou do console
const firebaseConfig = {
  apiKey: "AIzaSyCfvV8dnKYiWYK_IuEuu3i8pFFPrwt2FTk",
  authDomain: "easymoney-61ad6.firebaseapp.com",
  projectId: "easymoney-61ad6",
  storageBucket: "easymoney-61ad6.appspot.com",
  messagingSenderId: "701611087112",
  appId: "1:701611087112:web:d11f4f5d0699b2c54848bd",
  measurementId: "G-W7HQBH0D2K"
};

// 1. Inicializa o Firebase e armazena a instância em 'app'
const app = initializeApp(firebaseConfig);

// 2. Cria a instância de autenticação, passando o objeto 'app'
export const auth = getAuth(app);

// 3. Opcional: Cria a instância do Firestore, passando o objeto 'app'
export const db = getFirestore(app);