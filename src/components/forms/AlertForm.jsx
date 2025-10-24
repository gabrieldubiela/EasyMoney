// src/components/forms/AlertForm.jsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/useAppContext';
import {
    createAlert,
    updateAlert,
    deleteAlert,
} from '../../services/alertService';
import useAllCategories from '../../hooks/useAllCategories';
import useAllTypes from '../../hooks/useAllTypes';
import '../../styles/forms.css';
import '../../styles/buttons.css';

/**
 * Formulário unificado para criar e editar alertas.
 * Suporta tipos:
 * - plannedTransaction: Alertas de transações planejadas
 * - transferPercentage: Alertas de % gasto do orçamento
 * - budgetExceeded: Alertas de orçamento ultrapassado
 * - lowBalance: Alertas de saldo restante crítico
 * - typeLimit: Alertas de limite por tipo de transação (mensal/anual)
 */
const AlertForm = ({ item = null, onSuccess, onCancel }) => {
    const { householdId, user } = useAppContext();
    const { categories } = useAllCategories();
    const { types } = useAllTypes();

    const [alertType, setAlertType] = useState(item?.alertType || 'transferPercentage');
    const [percentageThreshold, setPercentageThreshold] = useState(
        item?.percentageThreshold || 80
    );
    const [remainingThreshold, setRemainingThreshold] = useState(
        item?.remainingThreshold || 20
    );
    const [categoryId, setCategoryId] = useState(item?.categoryId || '');
    const [typeId, setTypeId] = useState(item?.typeId || '');
    const [amountLimit, setAmountLimit] = useState(item?.amountLimit || 0);
    const [timeFrame, setTimeFrame] = useState(item?.timeFrame || 'monthly');
    const [triggerDay, setTriggerDay] = useState(item?.triggerDay ?? 0);
    const [triggerTime, setTriggerTime] = useState(item?.triggerTime || '08:00');
    const [message, setMessage] = useState(item?.message || '');
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (item) {
            setAlertType(item.alertType);
            setPercentageThreshold(item.percentageThreshold || 80);
            setRemainingThreshold(item.remainingThreshold || 20);
            setCategoryId(item.categoryId || '');
            setTypeId(item.typeId || '');
            setAmountLimit(item.amountLimit || 0);
            setTimeFrame(item.timeFrame || 'monthly');
            setTriggerDay(item.triggerDay ?? 0);
            setTriggerTime(item.triggerTime || '08:00');
            setMessage(item.message || '');
        }
    }, [item]);

    const handleSave = async (e) => {
        e.preventDefault();
        setFormError('');
        setLoading(true);

        try {
            const alertData = {
                alertType,
                householdId,
                userId: user?.uid || null,
                message: message.trim() || 'Alerta configurado',
            };

            // Campos específicos por tipo
            if (alertType === 'transferPercentage') {
                alertData.percentageThreshold = percentageThreshold;
                alertData.categoryId = categoryId || null;
            } else if (alertType === 'lowBalance') {
                alertData.remainingThreshold = remainingThreshold;
                alertData.categoryId = categoryId || null;
            } else if (alertType === 'budgetExceeded') {
                alertData.categoryId = categoryId || null;
            } else if (alertType === 'typeLimit') {
                // Novo: limite por tipo de transação
                if (!typeId) {
                    throw new Error('Selecione um tipo de transação.');
                }
                if (amountLimit <= 0) {
                    throw new Error('Informe um valor limite válido.');
                }
                alertData.typeId = typeId;
                alertData.amountLimit = amountLimit;
                alertData.timeFrame = timeFrame;
            } else if (alertType === 'plannedTransaction') {
                alertData.triggerDay = triggerDay;
                alertData.triggerTime = triggerTime;
            }

            if (item) {
                // Edição
                await updateAlert(householdId, item.id, alertData);
            } else {
                // Criação
                await createAlert(householdId, alertData);
            }

            onSuccess?.();
            if (item) onCancel?.();
        } catch (err) {
            setFormError(err.message || 'Erro ao salvar alerta.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!item) return;
        if (window.confirm(`Excluir o alerta "${item.message || 'sem título'}"?`)) {
            setLoading(true);
            try {
                await deleteAlert(householdId, item.id);
                onSuccess?.();
            } catch {
                setFormError('Erro ao excluir alerta!');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <form className="form alert-form" onSubmit={handleSave} autoComplete="off">
            <div className="form-group">
                <label className="form-label required" htmlFor="alert-type">
                    Tipo de Alerta
                </label>
                <select
                    id="alert-type"
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value)}
                    disabled={loading || !!item}
                    required
                >
                    <option value="transferPercentage">Percentual de Gasto Atingido</option>
                    <option value="budgetExceeded">Orçamento Ultrapassado</option>
                    <option value="lowBalance">Saldo Restante Crítico</option>
                    <option value="typeLimit">Limite por Tipo de Transação</option>
                    <option value="plannedTransaction">Transação Planejada (vencimento)</option>
                </select>
            </div>

            {/* Campo de categoria para alertas de orçamento */}
            {['transferPercentage', 'budgetExceeded', 'lowBalance'].includes(alertType) && (
                <div className="form-group">
                    <label className="form-label" htmlFor="alert-category">
                        Categoria (opcional - deixe vazio para todas)
                    </label>
                    <select
                        id="alert-category"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Todas as categorias</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Campo de percentual para alerta de transferência */}
            {alertType === 'transferPercentage' && (
                <div className="form-group">
                    <label className="form-label required" htmlFor="percentage-threshold">
                        Percentual Limite (%)
                    </label>
                    <input
                        type="number"
                        id="percentage-threshold"
                        min="1"
                        max="100"
                        value={percentageThreshold}
                        onChange={(e) => setPercentageThreshold(Number(e.target.value))}
                        disabled={loading}
                        required
                    />
                    <small>Alerta será disparado quando atingir esse percentual de gasto.</small>
                </div>
            )}

            {/* Campo de saldo restante para alerta de saldo baixo */}
            {alertType === 'lowBalance' && (
                <div className="form-group">
                    <label className="form-label required" htmlFor="remaining-threshold">
                        Saldo Restante Mínimo (%)
                    </label>
                    <input
                        type="number"
                        id="remaining-threshold"
                        min="1"
                        max="100"
                        value={remainingThreshold}
                        onChange={(e) => setRemainingThreshold(Number(e.target.value))}
                        disabled={loading}
                        required
                    />
                    <small>Alerta quando o saldo restante cair abaixo desse percentual.</small>
                </div>
            )}

            {/* Campos para alerta de limite por tipo */}
            {alertType === 'typeLimit' && (
                <>
                    <div className="form-group">
                        <label className="form-label required" htmlFor="alert-type-id">
                            Tipo de Transação
                        </label>
                        <select
                            id="alert-type-id"
                            value={typeId}
                            onChange={(e) => setTypeId(e.target.value)}
                            disabled={loading}
                            required
                        >
                            <option value="">Selecione um tipo</option>
                            {types.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name} {type.isIncome ? '(Receita)' : '(Despesa)'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label required" htmlFor="amount-limit">
                            Valor Limite (R$)
                        </label>
                        <input
                            type="number"
                            id="amount-limit"
                            min="0"
                            step="0.01"
                            value={amountLimit}
                            onChange={(e) => setAmountLimit(Number(e.target.value))}
                            disabled={loading}
                            required
                        />
                        <small>Valor máximo permitido para esse tipo de transação.</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label required" htmlFor="time-frame">
                            Período
                        </label>
                        <select
                            id="time-frame"
                            value={timeFrame}
                            onChange={(e) => setTimeFrame(e.target.value)}
                            disabled={loading}
                            required
                        >
                            <option value="monthly">Mensal</option>
                            <option value="annual">Anual</option>
                        </select>
                        <small>Define se o limite é mensal ou anual.</small>
                    </div>
                </>
            )}

            {/* Campos para alertas de transação planejada */}
            {alertType === 'plannedTransaction' && (
                <>
                    <div className="form-group">
                        <label className="form-label" htmlFor="trigger-day">
                            Dias de Antecedência
                        </label>
                        <input
                            type="number"
                            id="trigger-day"
                            min="0"
                            max="30"
                            value={triggerDay}
                            onChange={(e) => setTriggerDay(Number(e.target.value))}
                            disabled={loading}
                        />
                        <small>0 = no dia do vencimento, 1 = um dia antes, etc.</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="trigger-time">
                            Horário do Alerta
                        </label>
                        <input
                            type="time"
                            id="trigger-time"
                            value={triggerTime}
                            onChange={(e) => setTriggerTime(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </>
            )}

            {/* Mensagem personalizada */}
            <div className="form-group">
                <label className="form-label" htmlFor="alert-message">
                    Mensagem Personalizada (opcional)
                </label>
                <input
                    type="text"
                    id="alert-message"
                    placeholder="Ex: Atenção ao limite de despesas variáveis"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                />
            </div>

            {formError && <div className="form-error">{formError}</div>}

            <div className="form-actions">
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Salvando...' : item ? 'Salvar' : 'Criar Alerta'}
                </button>

                {item && (
                    <>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            Excluir
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                    </>
                )}
            </div>
        </form>
    );
};

export default AlertForm;
