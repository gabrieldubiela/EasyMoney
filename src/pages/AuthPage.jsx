import React, { useState } from 'react';
// IMPORTADO seus componentes existentes!
import Login from '../ui/Login';
import Register from '../ui/Register';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleMode = () => {
        setIsLogin(prev => !prev);
    };

    return (
        <div>
            <h1>{isLogin ? 'Entrar no EasyMoney' : 'Criar Nova Conta'}</h1>

            {/* Renderiza o componente ativo */}
            {isLogin ? <Login /> : <Register />}

            {/* Botão para alternar entre as telas (removido CSS inline) */}
            <p>
                {isLogin
                    ? "Não tem uma conta? "
                    : "Já tem uma conta? "
                }
                <button
                    onClick={toggleMode}
                >
                    {isLogin ? "Cadastre-se" : "Faça Login"}
                </button>
            </p>

            {/* Link "Esqueci minha senha" */}
            {isLogin && (
                <p>
                    <span>
                        Esqueci minha senha
                    </span>
                </p>
            )}
        </div>
    );
};

export default AuthPage;