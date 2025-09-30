// src/pages/AnnualBudgetSheetPage.jsx

import React from 'react';
import AnnualBudgetSheet from '../components/ui/AnnualBudgetSheet';
import BudgetForm from '../components/ui/forms/BudgetForm';

const AnnualBudgetSheetPage = () => {
    return (
        <div className="annual-sheet-page">
            <AnnualBudgetSheet />
            <BudgetForm />
        </div>
    );
};

export default AnnualBudgetSheetPage;