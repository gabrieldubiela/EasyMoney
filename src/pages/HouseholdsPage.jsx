import { useAppContext } from '../context/useAppContext';

export default function SelectHousehold() {
  const { householdId, changeHousehold } = useAppContext();

  const handleSelect = (newId) => {
    changeHousehold(newId);
  };

  return (
    <div>
      <h2>Família atual: {householdId}</h2>
      <button onClick={() => handleSelect('household123')}>Selecionar Família 123</button>
      <button onClick={() => handleSelect('household456')}>Selecionar Família 456</button>
    </div>
  );
}
