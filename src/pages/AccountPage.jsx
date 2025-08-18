// ARQUIVO: src/pages/AccountPage.jsx
import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaUserEdit, FaLanguage, FaExclamationTriangle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth'; // Hook para obter dados e funções de autenticação
import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile, deleteUser } from 'firebase/auth';
import Spinner from '../components/shared/Spinner'; // Componente de loading

// --- Componentes Estilizados (com adições para feedback) ---

const PageWrapper = styled.div`
  background-color: #12121c;
  color: #fff;
  min-height: 100vh;
  padding: 6rem 2rem 4rem; // Aumentado padding superior
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  @media (max-width: 768px) { padding: 4rem 1rem; }
`;
const ContentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background-color: #1e1e3f;
  border-radius: 8px;
  box-shadow: 0 4px 25px rgba(138, 43, 226, 0.2);
  border: 1px solid rgba(138, 43, 226, 0.3);
  overflow: hidden;
`;
const Header = styled.header`
  padding: 2rem 2.5rem;
  border-bottom: 1px solid rgba(138, 43, 226, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  h1 { font-size: 2.5rem; font-weight: 700; margin: 0; }
`;
const Section = styled.section`
  padding: 2rem 2.5rem;
  border-bottom: 1px solid rgba(138, 43, 226, 0.2);
  &:last-child { border-bottom: none; }
`;
const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  color: #fff;
  svg { margin-right: 12px; color: #8a2be2; }
`;
const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  label { margin-bottom: 0.5rem; color: #a9a9d4; font-size: 0.9rem; }
`;
const InputField = styled.input`
  background-color: #12121c;
  border: 1px solid rgba(138, 43, 226, 0.5);
  color: #fff;
  padding: 12px;
  border-radius: 5px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus { border-color: #8a2be2; box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.25); }
  &:disabled { background-color: #2a2a4a; cursor: not-allowed; }
`;
const SelectField = styled.select`
  background-color: #12121c;
  border: 1px solid rgba(138, 43, 226, 0.5);
  color: #fff;
  padding: 12px;
  border-radius: 5px;
  font-size: 1rem;
  outline: none;
  &:focus { border-color: #8a2be2; }
`;
const ActionButton = styled.button`
  background-color: #8a2be2;
  color: #fff;
  border: none;
  padding: 12px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  &:hover:not(:disabled) { background-color: #7c25d3; box-shadow: 0 0 15px rgba(138, 43, 226, 0.5); }
  &:disabled { background-color: #555; cursor: not-allowed; }
`;
const DangerButton = styled(ActionButton)`
  background-color: transparent;
  color: #ff4d4d;
  border: 2px solid #ff4d4d;
  &:hover:not(:disabled) { background-color: #ff4d4d; color: #fff; box-shadow: 0 0 15px rgba(255, 77, 77, 0.5); }
`;
const LogoutButton = styled.button`
    background: none; border: none; color: #a9a9d4;
    cursor: pointer; display: flex; align-items: center;
    font-size: 1rem; transition: color 0.2s ease;
    svg { margin-right: 8px; }
    &:hover { color: #fff; }
`;

// NOVO: Componente de notificação (Toast)
const toastAnimation = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;
const Toast = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  border-radius: 8px;
  color: #fff;
  background-color: ${props => props.type === 'success' ? '#28a745' : '#dc3545'};
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  animation: ${toastAnimation} 0.5s ease-out forwards;
  z-index: 2000;
`;

// --- Componente React Funcional e Atualizado ---

const AccountPage = () => {
    const { user, signOut: authSignOut } = useAuth(); // Usando o hook de autenticação
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // Os dados do formulário agora são inicializados vazios e preenchidos pelo useEffect
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [language, setLanguage] = useState('pt-br');

    // Efeito para buscar os dados do usuário quando o componente é montado
    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setEmail(user.email || '');
            // Aqui você poderia buscar preferências salvas do Firestore
            // Ex: const userDoc = await getDoc...; setLanguage(userDoc.data().language)
            setLoading(false);
        }
    }, [user]);

    // Função para mostrar notificações
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    const handleSaveChanges = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            // 1. Atualiza o perfil no Firebase Authentication
            await updateProfile(user, { displayName });
            // 2. Atualiza o documento no Firestore (bom para ter dados extras)
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { displayName }, { merge: true });
            showToast('Alterações salvas com sucesso!');
        } catch (error) {
            console.error("Erro ao salvar alterações:", error);
            showToast('Ocorreu um erro ao salvar.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmationText = "DELETAR";
        const userInput = prompt(`Esta ação é irreversível. Para confirmar, digite "${confirmationText}" abaixo:`);

        if (userInput === confirmationText) {
            setIsDeleting(true);
            try {
                await deleteUser(user);
                showToast('Conta deletada com sucesso.');
                // O logout será acionado automaticamente pelo listener de autenticação
            } catch (error) {
                console.error("Erro ao deletar a conta:", error);
                showToast('Erro ao deletar a conta. Tente fazer login novamente.', 'error');
                setIsDeleting(false);
            }
        } else {
            showToast('Ação cancelada.', 'error');
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <PageWrapper>
            <ContentContainer>
                <Header>
                    <h1>Configurações</h1>
                    <LogoutButton onClick={authSignOut}>
                        <FaSignOutAlt />
                        Sair
                    </LogoutButton>
                </Header>

                <Section>
                    <SectionTitle><FaUserEdit /> Conta</SectionTitle>
                    <InputGroup>
                        <label htmlFor="displayName">Nome de Usuário</label>
                        <InputField
                            id="displayName"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </InputGroup>
                    <InputGroup>
                        <label htmlFor="email">Email</label>
                        <InputField id="email" type="email" value={email} disabled />
                    </InputGroup>
                    <ActionButton onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </ActionButton>
                </Section>

                <Section>
                    <SectionTitle><FaLanguage /> Preferências</SectionTitle>
                    <InputGroup>
                        <label htmlFor="language">Idioma</label>
                        <SelectField id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="pt-br">Português (Brasil)</option>
                            <option value="en-us">English (US)</option>
                        </SelectField>
                    </InputGroup>
                </Section>

                <Section>
                    <SectionTitle><FaExclamationTriangle /> Zona de Perigo</SectionTitle>
                    <p style={{ color: '#a9a9d4', marginBottom: '1rem' }}>
                        A ação abaixo é permanente e não pode ser desfeita.
                    </p>
                    <DangerButton onClick={handleDeleteAccount} disabled={isDeleting}>
                        {isDeleting ? 'Deletando...' : 'Deletar Conta'}
                    </DangerButton>
                </Section>
            </ContentContainer>

            {/* Renderiza a notificação se ela estiver ativa */}
            {toast.show && <Toast type={toast.type}>{toast.message}</Toast>}
        </PageWrapper>
    );
};

export default AccountPage;