/**
 * Retorna a classe de cor da barra de progresso com base na porcentagem.
 */
export function getProgressClass(percent) {
    if (percent < 80) return "progress-fill-success";
    if (percent < 100) return "progress-fill-warning";
    return "progress-fill-danger";
}

/**
 * Retorna a classe para a largura da barra de progresso, de 0% a 100%.
 * Exemplo: 79 → "progress-bar-width-79"
 */
export function getProgressWidthClass(percent) {
    const width = Math.max(0, Math.min(100, Math.round(percent)));
    return `progress-bar-width-${width}`;
}

/**
 * Classe auxiliar para zebra/alerta na linha da tabela.
 */
export function getRowClass(percent, idx) {
    if (percent >= 90) return "table-row--critical";
    if (idx % 2 === 1) return "table-row--zebra";
    return "";
}
