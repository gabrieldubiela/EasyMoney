// src/pages/VersionPage.jsx

import React from "react";
import "../styles/cards.css";
import "../styles/alerts.css";
import "../styles/buttons.css";

const APP_VERSION = "3.3.0";
const APP_DATE = "25/10/2025";

const changelog = [
    {
        version: "3.3.0",
        date: "25/10/2025",
        highlights: [
            "Nova página: Página de versão que contem informações da última atualização.",
            "Novo layout: Sidebar fixa no desktop e header responsivo no mobile.",
            "Indicação visual de atualização do PWA (Service Worker).",
            "Avatar/nome de usuário e nome da família agora como links de navegação.",
            "Logout agora está apenas na Sidebar.",
            "Correção do bug de sidebar invisível no mobile.",
            "Novo botão em transação planejada que permite converter em realizada.",
            "Opção de editar transações",
            "Opção de excluir despesas parcelas individualmente ou em grupo",
            "Opção de editar transação em grupo",
            "Ao inserir números do formulário ele começa pelos centavos, tornando desnecessário o uso de virgulas e pontos"
        ]
    },
];

const VersionPage = () => (
    <div className="card card--expanded" >
        <div className="card-header">
            <div>
                <div className="card-label">
                    Versão <strong>{APP_VERSION}</strong> <span className="card-badge card-badge--info">{APP_DATE}</span>
                </div>
            </div>
        </div>

        <div>
            <div className="alert-item alert-info">
                <div className="alert-content">
                    <strong className="alert-title">O que há de novo nesta versão?</strong>
                    <ul className="alert-description">
                        {changelog[0].highlights.map((desc, i) => (
                            <li key={i}>{desc}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </div>
);

export default VersionPage;