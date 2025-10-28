import React, { useState } from 'react';
import { useAppContext } from '../context/useAppContext';
import HouseholdUpdateForm from '../components/forms/HouseholdUpdateForm';
import HouseholdCreateForm from '../components/forms/HouseholdCreateForm';
import InviteCodeDisplay from '../components/ui/InviteCodeDisplay';
import HouseholdUsersList from '../components/tables/HouseholdUsersList';
import ToastMessage from '../components/ui/ToastMessage';
import useAllHouseholds from '../hooks/useAllHouseholds';

export default function HouseholdsPage() {
  const { user, householdId, changeHousehold, isHouseholdAdmin } = useAppContext();
  const [toast, setToast] = useState(null);

  // Busca SÓ as famílias em que o usuário é membro
  const { households: allHouseholds, loading, error } = useAllHouseholds({ userId: user?.uid });

  // Troca de família ativa
  const handleSelect = (newId) => {
    if (newId && newId !== householdId) {
      changeHousehold(newId);
      setToast({ type: "success", message: "Família trocada com sucesso!" });
    }
  };

  if (!user) return <div className="loading">Carregando usuário...</div>;
  if (!householdId) return <div className="loading">Nenhuma família ativa.</div>;

  return (
    <div className="container">
      <div className="page-header"><h1 className="page-title">Configurações da Família</h1></div>

      {/* Criar nova família */}
      <section className="section">
        <h2 className="section-title">Criar nova família</h2>
        <div className="card">
          <HouseholdCreateForm
            showToast={setToast}
            onCreated={() => setToast({type:"success", message:"Família criada! Para ver a nova família na lista, recarregue a página."})}
          />
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Família ativa: {householdId}</h2>
        {/* Trocar família */}
        <div>
          <label>Trocar família: </label>
          {loading ? (
            <span>Carregando famílias...</span>
          ) : error ? (
            <p className="form-error">Erro ao carregar famílias</p>
          ) : (
            <select value={householdId} onChange={e => handleSelect(e.target.value)}>
              {allHouseholds && allHouseholds.length > 0 ? allHouseholds.map(h => (
                <option key={h.id} value={h.id}>
                  {(h.familyName || h.id) + (h.id === householdId ? " (atual)" : "")}
                </option>
              )) : (
                <option value="">Nenhuma família encontrada</option>
              )}
            </select>
          )}
        </div>

        {/* Nome/edit da família */}
        <div className="card">
          <HouseholdUpdateForm householdId={householdId} showToast={setToast} canEdit={isHouseholdAdmin}/>
        </div>
        <div className="card">
          <InviteCodeDisplay householdId={householdId}/>
        </div>
      </section>

      {/* Lista de usuários da família + gestão admin */}
      <section className="section">
        <h2 className="section-title">Membros da Família</h2>
        <div className="card">
          <HouseholdUsersList householdId={householdId} isAdmin={isHouseholdAdmin} showToast={setToast}/>
        </div>
      </section>

      {toast && <ToastMessage {...toast} onClose={() => setToast(null)} duration={3500}/>}
    </div>
  );
}
