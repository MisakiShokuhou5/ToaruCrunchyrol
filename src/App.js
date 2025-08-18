// ----------------------------------------------------------------
// ARQUIVO ATUALIZADO: src/App.js
// Adicionada a rota para a página de Light Novels.
// ----------------------------------------------------------------
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Profiles from './pages/Profiles';
import Browse from './pages/Browse';
import Player from './pages/Player';
import Spinner from './components/shared/Spinner';
import EditProfiles from './pages/EditProfiles';
import ImaginaryFest from './pages/ImaginaryFest';
import TierList from './pages/TierList';
import Manga from './pages/Manga';
import LightNovel from './pages/LightNovel'; // NOVO: Importa a página de Light Novel
import Details from './pages/Details';
import NotFoundPage from './pages/NotFoundPage';
import AccountPage from './pages/AccountPage';
import AdminDashboard from './pages/private/AdminDashboard';

const ProtectedRoute = ({ children }) => {
    const { user, loading, selectedProfile } = useAuth();
    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" replace />;
    // Permite acesso a rotas de conta/admin sem perfil selecionado
    if (!selectedProfile && !['/profiles', '/edit-profiles', '/account', '/admin/dashboard'].includes(window.location.pathname)) {
        return <Navigate to="/profiles" replace />;
    }
    return children;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    // Lista de emails de administradores.
    // Em uma aplicação real, isso viria de um banco de dados ou de custom claims do Firebase.
    const adminEmails = ['joao@gmail.com'];

    if (loading) return <Spinner />;
    
    // Se não houver usuário ou se o email do usuário não estiver na lista de admins, redireciona.
    if (!user || !adminEmails.includes(user.email)) {
        return <Navigate to="/browse" replace />;
    }

    return children;
};


const AuthRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    return user ? <Navigate to="/profiles" replace /> : children;
};

const ProfileRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
                <Route path="/profiles" element={<ProfileRoute><Profiles /></ProfileRoute>} />
                <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
                <Route path="/watch/:animeId/:encodedUrl" element={<ProtectedRoute><Player /></ProtectedRoute>} />
                <Route path="/edit-profiles" element={<ProtectedRoute><EditProfiles /></ProtectedRoute>} />
                <Route path="/imaginary-fest" element={<ProtectedRoute><ImaginaryFest /></ProtectedRoute>} />
                <Route path="/tier-list" element={<ProtectedRoute><TierList /></ProtectedRoute>} />
                <Route path="/manga" element={<ProtectedRoute><Manga /></ProtectedRoute>} />
                
                {/* NOVO: Rota para a página de Light Novel */}
                <Route path="/light-novel" element={<ProtectedRoute><LightNovel /></ProtectedRoute>} />

                <Route path="/details/:animeId" element={<ProtectedRoute><Details /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />

                {/* Rota para o painel de administração */}
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

                {/* Rota "catch-all" para exibir a página 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;