// src/pages/SettingsPage.jsx

import React from 'react';
import { useHousehold } from '../hooks/useHousehold';
import UserUpdateForm from '../components/ui/forms/UserUpdateForm';
import HouseholdUpdateForm from '../components/ui/forms/HouseholdUpdateForm';
import InviteCodeDisplay from '../components/ui/InviteCodeDisplay';

const SettingsPage = () => {
    const { user, householdId } = useHousehold();

    if (!user) {
        return <div className="loading">Carregando dados do usuário...</div>;
    }

    return (
        <div className="container">
            <div className="page-header">
                <h1 className="page-title">Configurações de Perfil</h1>
            </div>

            <section className="section">
                <h2 className="section-title">Dados Pessoais</h2>
                <div className="card">
                    <UserUpdateForm />
                </div>
            </section>

            {householdId && (
                <section className="section">
                    <h2 className="section-title">Dados da Família</h2>
                    <div className="card">
                        <HouseholdUpdateForm householdId={householdId} />
                    </div>
                    <div className="card mt-md">
                        <InviteCodeDisplay householdId={householdId} />
                    </div>
                </section>
            )}
        </div>
    );
};

export default SettingsPage;