// src/pages/VersionPage.jsx

import React from "react";
import "../styles/cards.css";
import "../styles/alerts.css";
import "../styles/buttons.css";

const APP_VERSION = "3.4.0";
const APP_DATE = "25/10/2025";

const changelog = [
    {
        version: "3.4.0",
        date: "25/10/2025",
        highlights: [
            "- Página inicial em funcionamento",
            "- Aumento da largura de tabelas em computadores",
            "- Padronização de datas e valores"
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