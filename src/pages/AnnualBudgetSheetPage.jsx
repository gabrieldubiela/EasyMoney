// src/pages/AnnualBudgetSheetPage.jsx

import React from 'react';
import AnnualBudgetSheet from '../components/ui/AnnualBudgetSheet';

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