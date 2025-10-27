/**
 * Recebe um índice de mês (0 ~ 11) e retorna o nome completo (pt-BR).
 */
export default function formatMonth(monthIdx) {
  if (monthIdx < 0 || monthIdx > 11) return "";
  return new Date(2000, monthIdx).toLocaleString('pt-BR', { month: 'long' });
}
