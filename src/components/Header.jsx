// ----------------------------------------------------------------
// ARQUIVO COMPLETO: src/components/Header.jsx
// Header profissional com menu hambúrguer para dispositivos móveis.
// Lógica de admin atualizada para verificar e-mails específicos.
// ----------------------------------------------------------------
import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import Logo from './shared/Logo';
import { Link, NavLink } from 'react-router-dom';
import { FaChevronDown, FaUserCog, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

// --- Styled Components (sem alterações) ---
const HeaderNav = styled.nav`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 10%, transparent);
    z-index: 1000;
    transition: background-color 0.3s ease-in-out;

    &.scrolled {
        background-color: #121212;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
    color: #e5e5e5;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    padding-bottom: 0.25rem;
    border-bottom: 2px solid transparent;

    &:hover {
        color: #ffffff;
    }

    &.active {
        color: #ffffff;
        font-weight: 700;
        border-bottom-color: #8a2be2;
    }
`;

const MobileMenuIcon = styled.div`
    display: none;
    font-size: 1.8rem;
    cursor: pointer;
    z-index: 1051;
    color: #fff;

    @media (max-width: 1024px) {
        display: block;
    }
`;

const MobileNavLinks = styled.div`
    position: fixed;
    top: 0;
    right: ${props => (props.$isOpen ? '0' : '-100%')};
    width: 300px;
    height: 100%;
    background-color: #121212;
    box-shadow: -5px 0 15px rgba(0,0,0,0.5);
    transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    z-index: 1050;

    ul {
        list-style: none;
        padding: 6rem 2rem 2rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    li a {
        font-size: 1.2rem;
    }
`;

const ProfileContainer = styled.div`
    position: relative;
`;
const ProfileTrigger = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
`;
const ProfileAvatar = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-image: url(${props => props.src});
    background-size: cover;
    border: 2px solid transparent;
    transition: border-color 0.2s;
    ${ProfileTrigger}:hover & {
        border-color: #8a2be2;
    }
`;
const DropdownCaret = styled(FaChevronDown)`
    color: white;
    transform: ${props => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform 0.3s ease-in-out;
`;
const DropdownMenu = styled.div`
    position: absolute;
    top: 60px;
    right: 0;
    background-color: rgba(20, 20, 20, 0.95);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    width: 250px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
    transform: translateY(${props => (props.$isOpen ? '0' : '-10px')});
    opacity: ${props => (props.$isOpen ? '1' : '0')};
    visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
`;
const DropdownItem = styled.div`
    .dropdown-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0.8rem 1.2rem;
        color: #e5e5e5;
        cursor: pointer;
        font-size: 0.95rem;
        text-decoration: none;
        transition: background-color 0.2s, color 0.2s;
        &:hover {
            background-color: #8a2be2;
            color: #ffffff;
        }
    }
`;
const Divider = styled.hr`
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    margin: 0.5rem 0;
`;


// --- Componente Header Completo ---

const Header = () => {
    const { user, profiles, selectedProfile, signOut, selectProfile } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const profileRef = useRef(null);
    
    // ALTERADO: A lógica de admin agora é baseada em uma lista de e-mails.
    const adminEmails = ['joao@gmail.com', 'gogetafusionkamehameha@gmail.com'];
    const isAdmin = user && adminEmails.includes(user.email);

    const navLinks = [
        { to: "/browse", label: "Anime" },
        { to: "/manga", label: "Mangá" },
        { to: "/light-novel", label: "Light Novel" },
        { to: "/tier-list", label: "Tier List" },
        { to: "/map", label: "Mapa" },
        ...(isAdmin ? [{ to: "/admin/dashboard", label: "Admin" }] : []),
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleProfileSwitch = (profile) => {
        selectProfile(profile);
        setDropdownOpen(false);
    };

    const otherProfiles = profiles?.filter(p => p.id !== selectedProfile?.id) || [];

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <HeaderNav className={isScrolled ? 'scrolled' : ''}>
            <NavSection>
                <Logo />
                {user && selectedProfile && (
                    <NavLinks>
                        {navLinks.map((link) => (
                            <li key={link.to}>
                                <StyledNavLink to={link.to}>{link.label}</StyledNavLink>
                            </li>
                        ))}
                    </NavLinks>
                )}
            </NavSection>
            
            {user && selectedProfile && (
                <NavSection>
                    <MobileMenuIcon onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </MobileMenuIcon>

                    <ProfileContainer ref={profileRef}>
                        <ProfileTrigger onClick={() => setDropdownOpen(o => !o)}>
                            <ProfileAvatar src={selectedProfile.imageUrl} alt={selectedProfile.name} />
                            <DropdownCaret $isOpen={isDropdownOpen} />
                        </ProfileTrigger>
                        <DropdownMenu $isOpen={isDropdownOpen}>
                            {otherProfiles.map(profile => (
                                <DropdownItem key={profile.id}>
                                    <div className="dropdown-link" onClick={() => handleProfileSwitch(profile)}>
                                        <ProfileAvatar src={profile.imageUrl} style={{ width: '32px', height: '32px' }}/>
                                        <span>{profile.name}</span>
                                    </div>
                                </DropdownItem>
                            ))}
                            {otherProfiles.length > 0 && <Divider />}
                            <DropdownItem>
                                <Link className="dropdown-link" to="/profiles" onClick={() => setDropdownOpen(false)}>
                                    <FaUserCog />
                                    <span>Gerenciar Perfis</span>
                                </Link>
                            </DropdownItem>
                            <DropdownItem>
                                <Link className="dropdown-link" to="/account" onClick={() => setDropdownOpen(false)}>
                                    <FaUserCircle />
                                    <span>Conta</span>
                                </Link>
                            </DropdownItem>
                            <Divider />
                            <DropdownItem>
                                <div className="dropdown-link" onClick={signOut}>Sair</div>
                            </DropdownItem>
                        </DropdownMenu>
                    </ProfileContainer>
                </NavSection>
            )}

            <MobileNavLinks $isOpen={isMobileMenuOpen}>
                 <ul>
                    {navLinks.map((link) => (
                        <li key={link.to}>
                            <StyledNavLink to={link.to} onClick={closeMobileMenu}>{link.label}</StyledNavLink>
                        </li>
                    ))}
                </ul>
            </MobileNavLinks>
        </HeaderNav>
    );
};

export default Header;