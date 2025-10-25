// src/pages/VersionPage.jsx

import React from "react";
import "../../styles/cards.css";
import "../../styles/alerts.css";
import "../../styles/buttons.css";

const APP_VERSION = "3.3.0";
const APP_DATE = "25/10/2025";

const changelog = [
    {
        version: "3.3.0",
        date: "25/10/2025",
        highlights: [
            "Nova página: Página de versão contem informações das últimas atualizações.",
        ]
    },
    {
        version: "3.2.0",
        date: "25/10/2025",
        highlights: [
            "Novo layout: Sidebar fixa no desktop e header responsivo no mobile.",
            "Indicação visual de atualização do PWA (Service Worker).",
            "Avatar/nome de usuário e nome da família agora como links de navegação.",
            "Logout agora está apenas na Sidebar.",
            "Correção do bug de sidebar invisível no mobile.",
        ]
    },
];

const VersionPage = () => (
    <div className="card card--expanded" >
        <div className="card-header">
            <img
                src="/logo.svg"
                alt="Logo EasyMoney"
                className="card-icon"
            />
            <div>
                <div className="card-title">EasyMoney</div>
                <div className="card-label">
                    Versão <strong>{APP_VERSION}</strong> <span className="card-badge card-badge--info">{APP_DATE}</span>
                </div>
            </div>
        </div>

        <div style={{ marginTop: 12 }}>
            <div className="alert-item alert-info">
                <div className="alert-icon">ℹ️</div>
                <div className="alert-content">
                    <strong className="alert-title">O que há de novo nesta versão?</strong>
                    <ul className="alert-description">
                        {changelog[0].highlights.map((desc, i) => (
                            <li key={i}>{desc}</li>
                        ))}
                    </ul>
                    <time className="alert-time">{changelog[0].date}</time>
                </div>
            </div>
        </div>

        <details className="alert-list">
            <summary className="alert-empty">
                Histórico de versões anteriores
            </summary>
            <div>
                {changelog.slice(1).map((v) => (
                    <div key={v.version} className="alert-item alert-empty">
                        <div>
                            <strong className="card-title">
                                Versão {v.version}
                            </strong>
                            <span className="card-badge card-badge--info">
                                {v.date}
                            </span>
                            <ul className="alert-description">
                                {v.highlights.map((desc, j) => (
                                    <li key={j}>{desc}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </details>

        <div className="card-footer">
            <a className="btn btn-ghost btn-small" href="/">
                Voltar ao dashboard
            </a>
            <span className="card-label">
                © {new Date().getFullYear()} EasyMoney
            </span>
        </div>
    </div>
);

export default VersionPage;