/**
 * Formata uma data para padrão brasileiro (dd/mm/yyyy).
 * Aceita Date, string ISO, ou Timestamp que tenha toDate().
 */
export default function formatDate(value) {
    let dateObj;

    if (!value) return 'Data Desconhecida';

    // Firestore Timestamp
    if (value.toDate && typeof value.toDate === 'function') {
        dateObj = value.toDate();
    } else if (value instanceof Date) {
        dateObj = value;
    } else if (typeof value === 'string') {
        const dataStr = value.length > 10 ? value : value + "T00:00:00";
        dateObj = new Date(dataStr);
        if (isNaN(dateObj.getTime())) return 'Data Inválida';
    } else {
        return 'Data Inválida';
    }

    return dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
