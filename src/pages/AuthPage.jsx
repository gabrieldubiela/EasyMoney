import React, { useState } from 'react';
import Login from '../components/forms/Login';
import Register from '../components/forms/Register';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleMode = () => {
        setIsLogin(prev => !prev);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {isLogin ? <Login /> : <Register />}

                <div className="auth-links">
                    <p>
                        {isLogin
                            ? "Não tem uma conta? "
                            : "Já tem uma conta? "
                        }
                        <a href="#" onClick={(e) => { e.preventDefault(); toggleMode(); }}>
                            {isLogin ? "Cadastre-se" : "Faça Login"}
                        </a>
                    </p>

                    {isLogin && (
                        <p>
                            <a href="#" onClick={(e) => e.preventDefault()}>
                                Esqueci minha senha
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;