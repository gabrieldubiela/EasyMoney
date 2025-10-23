// src/pages/BudgetsPage.jsx

import React from 'react';
import BudgetSheet from '../components/ui/BudgetSheet';
import BudgetForm from '../components/forms/BudgetForm';

const BudgetsPage = () => (
  <div className="annual-sheet-page">
    <BudgetSheet />
    <BudgetForm />
  </div>
);

export default BudgetsPage;
