// src/pages/VersionPage.jsx

import React from "react";
import "../styles/cards.css";
import "../styles/alerts.css";
import "../styles/buttons.css";

const APP_VERSION = "3.5.1";
const APP_DATE = "25/10/2025";

const changelog = [
    {
        version: "3.5.1",
        date: "29/10/2025",
        highlights: [
            "- Página inicial em funcionamento",
            "- Aumento da largura de tabelas em computadores",
            "- Padronização de datas e valores",
            "- Input de valores abre teclado numerico em celular",
            "- Possibilidade de edição de valor orçado anual",
            "- Padronização de todas as cores do programa de acordo com a palheta",
            "- Os tipos são linhas dentro das categorias",
            "- Exclusão de icones do sidebar",
            "- Padronização do tamanho das fontes",
            "- Permitido a criação de novas famílias",
            "- Conserto de bug ao digitar no campo valor em adicionar e editar transação"
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