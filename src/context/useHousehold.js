import { useContext } from 'react';
// Importa o Contexto do arquivo Base
import { HouseholdContext } from './HouseholdContextBase'; 

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  
  return context;
};