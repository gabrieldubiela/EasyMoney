import { useContext } from 'react';
import { AppContext } from './appContextValue';

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};

export default useAppContext;
