import { useContext } from 'react';
// Importa do NOVO arquivo simples:
import { HouseholdContext } from '../context/HouseholdContext'; 

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  
  return context;
};