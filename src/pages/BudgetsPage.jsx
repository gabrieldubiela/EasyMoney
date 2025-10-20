// src/pages/AnnualBudgetSheetPage.jsx

import React from 'react';
import AnnualBudgetSheet from '../components/tables/AnnualBudgetSheet';
import BudgetForm from '../components/forms/BudgetForm';

const AnnualBudgetSheetPage = () => {
    return (
        <div className="annual-sheet-page">
            <AnnualBudgetSheet />
            <BudgetForm />
        </div>
    );
};

export default AnnualBudgetSheetPage;