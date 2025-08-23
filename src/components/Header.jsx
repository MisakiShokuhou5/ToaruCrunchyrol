// src/components/Header.jsx

import React, { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import Logo from './shared/Logo';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FaChevronDown, FaUserCog, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// --- TEMA DE DESIGN ---
// Centralizar as decisões de design facilita a manutenção e consistência.
const theme = {
  colors: {
    primary: '#8a2be2', // Roxo vibrante
    primaryHover: '#7a1dd1',
    background: '#121212',
    glassBackground: 'rgba(18, 18, 18, 0.75)',
    text: '#e5e5e5',
    textHover: '#ffffff',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  font: "'Inter', sans-serif",
  transitions: {
    default: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  },
};

// --- ANIMAÇÕES (FRAMER MOTION) ---
// Variantes centralizadas para reutilização e fácil ajuste.
const animationVariants = {
  dropdown: {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
  },
  mobileMenu: {
    closed: { x: '100%' },
    open: { x: '0%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  },
  mobileNavList: {
    closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
    open: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
  },
  mobileNavItem: {
    closed: { y: 20, opacity: 0 },
    open: { y: 0, opacity: 1 },
  },
  backdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  },
};

// --- CONSTANTES ---
// Manter fora do componente para evitar recriação a cada renderização.
const ADMIN_EMAILS = ['joao@gmail.com', 'gogetafusionkamehameha@gmail.com'];
const BASE_NAV_LINKS = [
  { to: "/browse", label: "Anime" },
  { to: "/manga", label: "Mangá" },
  { to: "/light-novel", label: "Light Novel" },
  { to: "/tier-list", label: "Tier List" },
  { to: "/map", label: "Mapa" },
];

// --- ESTILOS GLOBAIS ---
// Útil para travar o scroll quando o menu mobile estiver aberto.
const GlobalStyle = createGlobalStyle`
  body {
    overflow: ${props => (props.$isMenuOpen ? 'hidden' : 'auto')};
  }
`;

// --- STYLED COMPONENTS ---
const HeaderNav = styled(motion.header)`
  position: fixed;
  top: 0;
  left: 0;
  width: 97%;
  padding: 1rem 2.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  font-family: ${theme.font};
  transition: background-color 0.4s ease, backdrop-filter 0.4s ease, border-bottom 0.4s ease;
  
  // Efeito "Glassmorphism" quando a página é rolada
  &.scrolled {
    background-color: ${theme.colors.glassBackground};
    backdrop-filter: blur(12px);
    border-bottom: 1px solid ${theme.colors.border};
  }
`;

const NavSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const StyledNavLink = styled(NavLink)`
  color: ${theme.colors.text};
  text-decoration: none;
  font-weight: 500;
  padding-bottom: 0.5rem;
  position: relative;
  transition: ${theme.transitions.default};
  
  &:hover {
    color: ${theme.colors.textHover};
    transform: translateY(-2px);
  }
  
  &.active {
    color: ${theme.colors.textHover};
    font-weight: 700;
  }
`;

const ActiveLinkUnderline = styled(motion.div)`
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: ${theme.colors.primary};
  border-radius: 2px;
`;

const MobileMenuIcon = styled(motion.button)`
  display: none;
  font-size: 1.8rem;
  cursor: pointer;
  z-index: 1051;
  color: #fff;
  background: none;
  border: none;
  padding: 0;

  @media (max-width: 1024px) {
    display: block;
  }
`;

const MobileNavContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  max-width: 80vw;
  height: 100vh;
  background-color: ${theme.colors.background};
  box-shadow: -5px 0 15px rgba(0,0,0,0.5);
  z-index: 1050;
`;

const MobileNavList = styled(motion.ul)`
  list-style: none;
  padding: 6rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  li a {
    font-size: 1.3rem;
  }
`;

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1049; // Um nível abaixo do menu
`;

const ProfileContainer = styled.div`
  position: relative;
`;

const ProfileTrigger = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 50px;
  transition: ${theme.transitions.default};
  
  &:hover {
    background-color: rgba(255,255,255,0.1);
  }
`;

const ProfileAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: ${theme.transitions.default};

  ${ProfileTrigger}:hover & {
    border-color: ${theme.colors.primary};
    transform: scale(1.1);
  }
`;

const DropdownCaret = styled(motion.div)`
  color: white;
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background-color: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  width: 250px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  padding: 0.5rem;
  overflow: hidden;
`;

const DropdownLink = styled(Link)` // Usando styled(Link) diretamente
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.8rem 1.2rem;
  color: ${theme.colors.text};
  cursor: pointer;
  font-size: 0.95rem;
  text-decoration: none;
  border-radius: 6px;
  transition: ${theme.transitions.default};
  
  &:hover {
    background-color: ${theme.colors.primary};
    color: ${theme.colors.textHover};
    transform: translateX(5px);
  }
`;

const DropdownButton = styled.div` // Para ações como "Sair" e "Trocar Perfil"
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.8rem 1.2rem;
  color: ${theme.colors.text};
  cursor: pointer;
  font-size: 0.95rem;
  border-radius: 6px;
  transition: ${theme.transitions.default};
  
  &:hover {
    background-color: ${theme.colors.primary};
    color: ${theme.colors.textHover};
    transform: translateX(5px);
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.border};
  margin: 0.5rem 0;
`;

// --- COMPONENTE HEADER ---
const Header = () => {
  const { user, profiles, selectedProfile, signOut, selectProfile } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation(); // Hook do React Router para obter a localização atual

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  const navLinks = isAdmin ? [...BASE_NAV_LINKS, { to: "/admin/dashboard", label: "Admin" }] : BASE_NAV_LINKS;

  // Efeito para fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Efeito para detectar o scroll da página
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileSwitch = (profile) => {
    selectProfile(profile);
    setDropdownOpen(false);
  };
  
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const otherProfiles = profiles?.filter(p => p.id !== selectedProfile?.id) || [];
  
  return (
    <>
      <GlobalStyle $isMenuOpen={isMobileMenuOpen} />
      <HeaderNav className={isScrolled ? 'scrolled' : ''}>
        <NavSection>
          <Link to={user && selectedProfile ? "/browse" : "/"} aria-label="Página Inicial">
            <Logo />
          </Link>
          {user && selectedProfile && (
            <NavLinks>
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <StyledNavLink to={to}>
                    {label}
                    {location.pathname.startsWith(to) && (
                      <ActiveLinkUnderline layoutId="active-underline" />
                    )}
                  </StyledNavLink>
                </li>
              ))}
            </NavLinks>
          )}
        </NavSection>
        
        {user && selectedProfile && (
          <NavSection>
            <ProfileContainer ref={profileRef}>
              <ProfileTrigger onClick={() => setDropdownOpen(o => !o)} aria-haspopup="true" aria-expanded={isDropdownOpen}>
                <ProfileAvatar src={selectedProfile.imageUrl} alt={selectedProfile.name} />
                <DropdownCaret animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
                  <FaChevronDown />
                </DropdownCaret>
              </ProfileTrigger>
              <AnimatePresence>
                {isDropdownOpen && (
                  <DropdownMenu
                    variants={animationVariants.dropdown}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {otherProfiles.map(profile => (
                      <DropdownButton key={profile.id} onClick={() => handleProfileSwitch(profile)}>
                        <ProfileAvatar as="img" src={profile.imageUrl} style={{ width: '32px', height: '32px' }}/>
                        <span>{profile.name}</span>
                      </DropdownButton>
                    ))}
                    {otherProfiles.length > 0 && <Divider />}
                    <DropdownLink to="/profiles" onClick={() => setDropdownOpen(false)}>
                      <FaUserCog /> <span>Gerenciar Perfis</span>
                    </DropdownLink>
                    <DropdownLink to="/account" onClick={() => setDropdownOpen(false)}>
                      <FaUserCircle /> <span>Conta</span>
                    </DropdownLink>
                    <Divider />
                    <DropdownButton onClick={signOut}>Sair</DropdownButton>
                  </DropdownMenu>
                )}
              </AnimatePresence>
            </ProfileContainer>
            
            <MobileMenuIcon onClick={() => setMobileMenuOpen(o => !o)} whileTap={{ scale: 0.9 }} aria-label="Abrir menu">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? 'times' : 'bars'}
                  initial={{ y: -20, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </motion.div>
              </AnimatePresence>
            </MobileMenuIcon>
          </NavSection>
        )}
      </HeaderNav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <Backdrop
              variants={animationVariants.backdrop}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={closeMobileMenu}
            />
            <MobileNavContainer
              variants={animationVariants.mobileMenu}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <MobileNavList variants={animationVariants.mobileNavList}>
                {navLinks.map(({ to, label }) => (
                  <motion.li key={to} variants={animationVariants.mobileNavItem}>
                    <StyledNavLink to={to} onClick={closeMobileMenu}>{label}</StyledNavLink>
                  </motion.li>
                ))}
              </MobileNavList>
            </MobileNavContainer>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;