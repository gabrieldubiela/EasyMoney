import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../firebase/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
// Importado serverTimestamp para datas de criação (boa prática)

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState(''); // NOVO: Estado para sobrenome
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [householdIdInput, setHouseholdIdInput] = useState('');
  // NOVO: Estado para nome da família (só aparece se não for convite)
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      let finalHouseholdId = householdIdInput;
      let finalFamilyName = familyName;

      // 1. Lógica de Família (Household)
      if (householdIdInput) {
        // Opção A: Entrando com convite/ID existente
        const householdRef = doc(db, 'households', householdIdInput);
        const householdSnap = await getDoc(householdRef);

        if (householdSnap.exists()) {
          // Se existe, adiciona o novo membro
          await updateDoc(householdRef, {
            [`members.${user.uid}`]: true
          });
          setSuccess('Usuário registrado com sucesso e adicionado à família!');
          // Pega o nome existente do Household para o log
          finalFamilyName = householdSnap.data().family_name || 'Grupo Existente';
        } else {
          setError('Código de Família inválido.');
          await user.delete();
          return;
        }
      } else {
        // Opção B: Criando uma nova família

        // Define o nome da família, usando o nome da pessoa se o campo estiver vazio
        if (!finalFamilyName) {
          finalFamilyName = `${firstName} ${lastName}'s Family`;
        }

        // Define o ID da família como o UID do usuário (para simplificar)
        finalHouseholdId = user.uid;

        await setDoc(doc(db, 'households', finalHouseholdId), {
          family_name: finalFamilyName, // NOVO: Nome da família
          members: {
            [user.uid]: true
          },
          createdAt: serverTimestamp()
        });
        setSuccess('Usuário registrado com sucesso! Uma nova família foi criada.');
      }

      // 2. Criação do Documento do Usuário (users)
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        firstName: firstName,
        lastName: lastName, // NOVO: Salva o sobrenome
        householdId: finalHouseholdId,
        createdAt: serverTimestamp()
      });

    } catch (firebaseError) {
      setError(firebaseError.message);
      console.error('Erro ao registrar:', firebaseError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Criar uma nova conta</h2>
      <form onSubmit={handleRegister}>
        {/* Campo Nome */}
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Primeiro Nome"
          required
        />
        {/* NOVO: Campo Sobrenome */}
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Sobrenome"
          required
        />
        {/* ... e-mail, Password fields ... */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
        />

        {/* Campo de Convite/ID */}
        <input
          type="text"
          value={householdIdInput}
          onChange={(e) => setHouseholdIdInput(e.target.value)}
          placeholder="ID de Família Existente (Opcional)"
        />

        {/* NOVO: Campo Nome da Família - SÓ MOSTRA SE NÃO FOR CONVITE */}
        {!householdIdInput && (
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="Nome da sua Família (ex: Casa Silva)"
          />
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      {success && <p>{success}</p>}
      {error && <p>{error}</p>}
    </div>
  );
};

export default Register;