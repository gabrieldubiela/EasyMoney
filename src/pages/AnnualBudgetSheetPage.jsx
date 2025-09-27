// src/pages/AnnualBudgetSheetPage.jsx

import React from 'react';
import AnnualBudgetSheet from '../components/AnnualBudgetSheet'; // Componente que contém toda a lógica e a tabela

const AnnualBudgetSheetPage = () => {
    return (
        <div className="annual-sheet-page">
            {/* O componente AnnualBudgetSheet já lida com a seleção de ano, 
               loading e a exibição da tabela consolidada.
            */}
            <AnnualBudgetSheet />
        </div>
    );
};

export default AnnualBudgetSheetPage;