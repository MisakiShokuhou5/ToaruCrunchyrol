// ARQUIVO: src/pages/private/AdminDashboard.jsx
// DESCRIÇÃO: Painel de controle atualizado para incluir o gerenciamento de Light Novels.
// -------------------------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUsers, FaListOl, FaBook, FaTachometerAlt, FaBookOpen } from 'react-icons/fa'; // NOVO: Ícone FaBookOpen
import { db } from '../../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import AdminManga from './AdminManga';
import AdminLightNovel from './AdminLightNovel'; // NOVO: Importa o painel de Light Novel
import AdminTierList from './AdminTierList';

// --- Placeholder Components ---
const ManageUsers = () => <SectionContent><h1>Gerenciar Usuários</h1><p>Aqui você poderá ver, editar e remover usuários.</p></SectionContent>;

// --- Componente do Dashboard Home com Estatísticas ---
const DashboardHome = () => {
    const [userCount, setUserCount] = useState(0);
    const [mangaCount, setMangaCount] = useState(0);
    const [lightNovelCount, setLightNovelCount] = useState(0); // NOVO: Estado para Light Novels
    const [tierListCount, setTierListCount] = useState(0);

    useEffect(() => {
        const handleError = (error, collectionName) => {
            console.error(`Erro ao buscar dados da coleção '${collectionName}': `, error);
        };

        const usersCol = collection(db, 'users');
        const unsubscribeUsers = onSnapshot(usersCol, 
            (snapshot) => setUserCount(snapshot.size),
            (error) => handleError(error, 'users')
        );

        const mangasCol = collection(db, 'mangas');
        const unsubscribeMangas = onSnapshot(mangasCol, 
            (snapshot) => setMangaCount(snapshot.size),
            (error) => handleError(error, 'mangas')
        );

        // NOVO: Listener para a coleção de Light Novels
        const lightNovelsCol = collection(db, 'lightnovels');
        const unsubscribeLightNovels = onSnapshot(lightNovelsCol, 
            (snapshot) => setLightNovelCount(snapshot.size),
            (error) => handleError(error, 'lightnovels')
        );

        const tierListsCol = collection(db, 'tierlists');
        const unsubscribeTierLists = onSnapshot(tierListsCol, 
            (snapshot) => setTierListCount(snapshot.size),
            (error) => handleError(error, 'tierlists')
        );

        return () => {
            unsubscribeUsers();
            unsubscribeMangas();
            unsubscribeLightNovels(); // NOVO: Limpeza do listener
            unsubscribeTierLists();
        };
    }, []);

    return (
        <SectionContent>
            <h1>Dashboard</h1>
            <p>Bem-vindo ao painel de administração. Aqui estão as estatísticas atuais do seu site.</p>
            <StatGrid>
                <StatCard>
                    <FaUsers />
                    <div>
                        <h2>{userCount}</h2>
                        <span>Usuários Cadastrados</span>
                    </div>
                </StatCard>
                <StatCard>
                    <FaBook />
                    <div>
                        <h2>{mangaCount}</h2>
                        <span>Mangás na Biblioteca</span>
                    </div>
                </StatCard>
                {/* NOVO: Card de estatísticas para Light Novels */}
                <StatCard>
                    <FaBookOpen />
                    <div>
                        <h2>{lightNovelCount}</h2>
                        <span>Light Novels na Biblioteca</span>
                    </div>
                </StatCard>
                <StatCard>
                    <FaListOl />
                    <div>
                        <h2>{tierListCount}</h2>
                        <span>Tier Lists Criadas</span>
                    </div>
                </StatCard>
            </StatGrid>
        </SectionContent>
    );
};


// --- Componentes Estilizados (sem alterações) ---

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #1e1e3f;
  color: #fff;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
`;

const Sidebar = styled.nav`
  width: 250px;
  background-color: #12121c;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(138, 43, 226, 0.3);
`;

const Logo = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 3rem;
  color: #8a2be2;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: #a9a9d4;
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: all 0.2s ease-in-out;

  svg {
    margin-right: 1rem;
  }

  &:hover {
    background-color: #1e1e3f;
    color: #fff;
  }

  ${({ $active }) => $active && `
    color: #fff;
    border-left-color: #8a2be2;
    background-color: #1e1e3f;
  `}
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: 3rem;
  overflow-y: auto;
`;

const SectionContent = styled.div`
    h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }
    p {
        font-size: 1.1rem;
        color: #a9a9d4;
        max-width: 800px;
    }
`;

const StatGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
`;

const StatCard = styled.div`
    background-color: #12121c;
    padding: 2rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    border: 1px solid rgba(138, 43, 226, 0.3);

    svg {
        font-size: 3rem;
        color: #8a2be2;
    }

    h2 {
        margin: 0;
        font-size: 2.5rem;
    }

    span {
        color: #a9a9d4;
    }
`;


// --- Componente Principal ---

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <ManageUsers />;
            case 'manga':
                return <AdminManga />;
            // NOVO: Case para renderizar o painel de Light Novel
            case 'lightnovel':
                return <AdminLightNovel />;
            case 'tierlist':
                return <AdminTierList />;
            case 'dashboard':
            default:
                return <DashboardHome />;
        }
    };

    return (
        <DashboardContainer>
            <Sidebar>
                <Logo>Admin</Logo>
                <NavItem $active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
                    <FaTachometerAlt /> Dashboard
                </NavItem>
                <NavItem $active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
                    <FaUsers /> Usuários
                </NavItem>
                <NavItem $active={activeTab === 'manga'} onClick={() => setActiveTab('manga')}>
                    <FaBook /> Mangá
                </NavItem>
                {/* NOVO: Item de navegação para Light Novels */}
                <NavItem $active={activeTab === 'lightnovel'} onClick={() => setActiveTab('lightnovel')}>
                    <FaBookOpen /> Light Novel
                </NavItem>
                <NavItem $active={activeTab === 'tierlist'} onClick={() => setActiveTab('tierlist')}>
                    <FaListOl /> Tier Lists
                </NavItem>
            </Sidebar>
            <MainContent>
                {renderContent()}
            </MainContent>
        </DashboardContainer>
    );
};

export default AdminDashboard;