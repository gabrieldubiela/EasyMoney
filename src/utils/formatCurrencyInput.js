/**
 * Recebe valor digitado qualquer ("R$ 1.234,56" ou "123456" ou "12,50") 
 * e retorna { masked, float }, onde:
 * - masked: valor mascarado "R$ 1.234,56"
 * - float: valor numérico 1234.56
 */
export default function formatCurrencyInput(input) {
    const digits = String(input).replace(/\D/g, "");
    const float = digits ? Number(digits) / 100 : 0;
    const masked = float.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    });
    return { masked, float };
}    
