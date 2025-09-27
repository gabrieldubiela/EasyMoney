// src/components/pages/SettingsPage.jsx (ATUALIZADO E FINAL)

import React from 'react';
import { useHousehold } from '../hooks/useHousehold';

// Importa os novos componentes refatorados
import UserUpdateForm from '../components/ui/forms/UserUpdateForm';
import HouseholdUpdateForm from '../components/ui/forms/HouseholdUpdateForm';
import InviteCodeDisplay from '../components/ui/InviteCodeDisplay';

const SettingsPage = () => {
    const { user, householdId } = useHousehold();

    if (!user) {
        return <div style={{ padding: '20px' }}>Carregando dados do usuário...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Configurações e Perfil</h1>

            {/* SEÇÃO 1: DADOS PESSOAIS */}
            <UserUpdateForm />

            {/* SEÇÃO 2: DADOS DA FAMÍLIA/CASA */}
            <section style={{ border: '1px solid #ccc', padding: '15px' }}>
                <h2>Dados da Família/Casa</h2>
                <p>ID da Família/Casa: <strong>{householdId || 'N/A'}</strong></p>

                {householdId ? (
                    <>
                        {/* Formulário de Atualização do Nome da Casa */}
                        <HouseholdUpdateForm householdId={householdId} />

                        {/* Display do Código de Convite */}
                        <InviteCodeDisplay householdId={householdId} />
                    </>
                ) : (
                    <p>Você precisa pertencer a uma Família/Casa para gerenciar suas configurações e convites.</p>
                )}
                
            </section>
        </div>
    );
};

export default SettingsPage;