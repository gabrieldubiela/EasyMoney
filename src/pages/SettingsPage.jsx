// src/pages/SettingsPage.jsx

import React from 'react';
import { useHousehold } from '../hooks/useHousehold';
import UserUpdateForm from '../components/ui/forms/UserUpdateForm';
import HouseholdUpdateForm from '../components/ui/forms/HouseholdUpdateForm';
import InviteCodeDisplay from '../components/ui/InviteCodeDisplay';

const SettingsPage = () => {
    const { user, householdId } = useHousehold();

    if (!user) {
        return <div>Carregando dados do usuário...</div>;
    }

    return (
        <div>
            <h1>Configurações de Perfil</h1>

            {/* SEÇÃO 1: DADOS PESSOAIS */}
            <UserUpdateForm />

            {/* SEÇÃO 2: DADOS DA FAMÍLIA */}
            <section>
                <h2>Dados da Família</h2>

                {householdId && (
                    <>
                        {/* Formulário de Atualização do Nome da Casa */}
                        <HouseholdUpdateForm householdId={householdId} />

                        {/* Display do Código de Convite */}
                        <InviteCodeDisplay householdId={householdId} />
                    </>
                )}
                
            </section>
        </div>
    );
};

export default SettingsPage;