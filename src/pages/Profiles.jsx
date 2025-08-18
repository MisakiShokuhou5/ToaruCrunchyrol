// ----------------------------------------------------------------
// ARQUIVO ATUALIZADO: src/pages/Profiles.jsx
// CORREÇÃO: Alterado `profile.avatar` para `profile.imageUrl`.
// NOVO: Adicionado botão para adicionar e gerenciar perfis.
// ----------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/shared/Spinner';
import { FaPlus } from 'react-icons/fa'; // NOVO: Ícone para adicionar

const ProfilesContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #141414;
    color: white;
    text-align: center;
`;

const Title = styled.h1`
    font-size: 3.5vw;
    margin-bottom: 2rem;
    font-weight: 500;

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const ProfileList = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 2vw;
`;

const ProfileItem = styled.div`
    cursor: pointer;
    text-align: center;
    width: 10vw;
    max-width: 200px;
    min-width: 84px;

    &:hover > div {
        border-color: white;
    }
    &:hover > p {
        color: white;
    }
`;

const ProfileAvatar = styled.div`
    width: 10vw;
    height: 10vw;
    max-width: 200px;
    max-height: 200px;
    min-width: 80px;
    min-height: 80px;
    border-radius: 4px;
    background-image: url(${props => props.avatar});
    background-size: cover;
    border: 4px solid transparent;
    transition: border-color 0.3s;
    margin: 0 auto;
`;

// NOVO: Estilo para o avatar de "Adicionar Perfil"
const AddProfileAvatar = styled(ProfileAvatar)`
    background: #222;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 4px solid #333;

    svg {
        color: #777;
        font-size: 3vw;
        transition: color 0.3s;
    }

    &:hover {
        border-color: white;
        svg {
            color: white;
        }
    }
`;

const ProfileName = styled.p`
    margin-top: 0.8rem;
    color: grey;
    font-size: 1.2vw;
    transition: color 0.3s;

    @media (max-width: 768px) {
        font-size: 0.9rem;
    }
`;

// NOVO: Botão para gerenciar perfis
const ManageProfilesButton = styled.button`
    background-color: transparent;
    border: 1px solid grey;
    color: grey;
    padding: 0.7rem 1.8rem;
    font-size: 1.2vw;
    margin-top: 4rem;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: all 0.3s;

    &:hover {
        border-color: white;
        color: white;
    }

    @media (max-width: 768px) {
        font-size: 0.8rem;
    }
`;


const Profiles = () => {
    const { user, setSelectedProfile } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfiles = async () => {
            if (user) {
                const profilesCollection = collection(db, `users/${user.uid}/profiles`);
                const profileSnapshot = await getDocs(profilesCollection);
                let profilesData = profileSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                if (profilesData.length === 0) {
                    const defaultProfile = { 
                        name: user.displayName || user.email.split('@')[0],
                        imageUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid}` 
                    };
                    const docRef = await addDoc(profilesCollection, defaultProfile);
                    profilesData = [{ id: docRef.id, ...defaultProfile }];
                }
                
                setProfiles(profilesData);
                setLoading(false);
            }
        };
        fetchProfiles();
    }, [user]);

    const handleProfileSelect = (profile) => {
        setSelectedProfile(profile);
        navigate('/browse');
    };

    // NOVO: Navega para a página de edição de perfis
    const handleManageProfiles = () => {
        navigate('/edit-profiles');
    };

    if (loading) return <Spinner />;

    return (
        <ProfilesContainer>
            <Title>Quem está assistindo?</Title>
            <ProfileList>
                {profiles.map(profile => (
                    <ProfileItem key={profile.id} onClick={() => handleProfileSelect(profile)}>
                        <ProfileAvatar avatar={profile.imageUrl} />
                        <ProfileName>{profile.name}</ProfileName>
                    </ProfileItem>
                ))}
                
                {/* NOVO: Mostra o botão de adicionar se houver menos de 5 perfis */}
                {profiles.length < 5 && (
                    <ProfileItem onClick={handleManageProfiles}>
                        <AddProfileAvatar as="div">
                            <FaPlus />
                        </AddProfileAvatar>
                        <ProfileName>Adicionar perfil</ProfileName>
                    </ProfileItem>
                )}
            </ProfileList>
            <ManageProfilesButton onClick={handleManageProfiles}>
                Gerenciar Perfis
            </ManageProfilesButton>
        </ProfilesContainer>
    );
};

export default Profiles;
