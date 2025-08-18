// ARQUIVO: src/pages/Login.jsx
// DESCRIÇÃO: Página unificada de Login e Registro com tema Black & Blueviolet.
// -------------------------------------------------------------------------------
import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config'; // Importe sua configuração do Firebase
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';

// --- Componentes Estilizados ---

const PageWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  background-color: #141414; /* Cor de fundo preta */
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    background-color: #181818;
  }
`;

const LeftPanel = styled.div`
  background-image: url('https://image.tmdb.org/t/p/original/jLkj7EYVKK8QzLYVMYILiJz8gq9.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to top, rgba(20, 20, 20, 1), rgba(20, 20, 20, 0.3));
  }

  @media (max-width: 992px) {
    display: none;
  }
`;

const Logo = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  z-index: 2;
  text-shadow: 0 0 10px rgba(138, 43, 226, 0.7);
  span {
    color: #8a2be2; /* blueviolet */
  }
`;

const CopyrightText = styled.p`
  color: #888;
  font-size: 0.9rem;
  z-index: 2;
`;

const RightPanel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  color: #fff;
`;

const FormTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 28px;
  color: #e0e0e0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #888;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const Input = styled.input`
  background: #222;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 15px;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #8a2be2; /* blueviolet */
  }
`;

const SubmitButton = styled.button`
  background: #8a2be2; /* blueviolet */
  border: none;
  border-radius: 4px;
  padding: 15px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 24px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #7c25d3;
  }
`;

const ToggleText = styled.p`
  color: #737373;
  margin-top: 20px;
  text-align: center;

  span {
    color: #8a2be2; /* blueviolet */
    cursor: pointer;
    font-weight: 500;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.p`
    background-color: #e53935;
    color: #fff;
    padding: 15px;
    border-radius: 4px;
    font-size: 0.9rem;
    text-align: center;
`;

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegister) {
            if (!username) {
                setError('Por favor, insira um nome de usuário.');
                return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: username });
                console.log('Usuário registrado com sucesso!');
                navigate('/profiles');
            } catch (err) {
                console.error(err);
                setError('Falha ao registrar. Verifique os dados e tente novamente.');
            }
        } else {
            try {
                await signInWithEmailAndPassword(auth, email, password);
                console.log('Login realizado com sucesso!');
                navigate('/profiles');
            } catch (err) {
                console.error(err);
                setError('Email ou senha inválidos.');
            }
        }
    };

    return (
        <PageWrapper>
            <LeftPanel>
                <Logo>Toaru<span>Flix</span></Logo>
                <CopyrightText>A Certain Magical Streaming Service</CopyrightText>
            </LeftPanel>
            <RightPanel>
                <FormContainer>
                    <FormTitle>{isRegister ? 'Registre-se em Academy City' : 'Acesse sua Conta'}</FormTitle>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                    <Form onSubmit={handleSubmit}>
                        {isRegister && (
                            <InputGroup>
                                <Label htmlFor="username">Nome de Usuário</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </InputGroup>
                        )}
                        <InputGroup>
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </InputGroup>
                        <InputGroup>
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </InputGroup>
                        <SubmitButton type="submit">
                            {isRegister ? 'Registrar' : 'Entrar'}
                        </SubmitButton>
                    </Form>
                    <ToggleText>
                        {isRegister ? 'Já é um Esper? ' : 'Ainda não é um Esper? '}
                        <span onClick={() => setIsRegister(!isRegister)}>
                            {isRegister ? 'Faça login' : 'Cadastre-se'}
                        </span>
                    </ToggleText>
                </FormContainer>
            </RightPanel>
        </PageWrapper>
    );
};

export default Login;
