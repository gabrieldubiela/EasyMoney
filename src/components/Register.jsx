import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Invite logic
      if (invitationCode) {
        // If have an invitation code, check if the household exists
        const householdRef = doc(db, 'households', invitationCode);
        const householdSnap = await getDoc(householdRef);

        if (householdSnap.exists()) {
          // If the household exists, add the user to the household
          await updateDoc(householdRef, {
            [`members.${user.uid}`]: true
          });
          setSuccess('Usuário registrado com sucesso e adicionado à família!');
          console.log('Usuário registrado e adicionado à família!');
        } else {
          // If the household does not exist, show an error
          setError('Código de convite inválido.');
          return;
        }
      } else {
        // If no invitation code, create a new household with the user as the first member
        const newHouseholdRef = doc(db, 'households', user.uid);
        await setDoc(newHouseholdRef, {
          members: {
            [user.uid]: true
          }
        });
        setSuccess('Usuário registrado com sucesso! Uma nova família foi criada.');
        console.log('Usuário registrado e nova família criada!');
      }

    } catch (firebaseError) {
      setError(firebaseError.message);
      console.error('Erro ao registrar:', firebaseError.message);
    }
  };

  return (
    <div>
      <h2>Criar uma nova conta</h2>
      <form onSubmit={handleRegister}>
        {/* e-mail field */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        {/* Password field */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
        />
        {/* Invite code field */}
        <input
          type="text"
          value={invitationCode}
          onChange={(e) => setInvitationCode(e.target.value)}
          placeholder="Código de Convite (opcional)"
        />
        <button type="submit">Cadastrar</button>
      </form>
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Register;