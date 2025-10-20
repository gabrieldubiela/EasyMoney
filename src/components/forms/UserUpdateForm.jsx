// src/components/ui/forms/UserUpdateForm.jsx

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import ProfileDataForm from './ProfileDataForm'; 
import EmailUpdateForm from './EmailUpdateForm'; 
import PasswordUpdateForm from './PasswordUpdateForm'; 

const UserUpdateForm = () => {
    // 1. Obtenha o objeto de usuário do Contexto
    const { user, loading } = useAppContext(); 

    if (loading) {
        return <p>Carregando dados do usuário...</p>;
    }

    // 2. Renderiza o layout e passa o objeto 'user' como prop
    return (
        <div>
            
            <ProfileDataForm user={user} />
            
            <hr />
            
            <EmailUpdateForm user={user} />
            
            <hr />
            
            <PasswordUpdateForm user={user} />
        </div>
    );
};

export default UserUpdateForm;