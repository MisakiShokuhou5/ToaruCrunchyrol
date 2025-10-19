// ARQUIVO: src/pages/EditProfiles.jsx
// CORRIGIDO: A sintaxe da primeira linha foi ajustada.
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase/config';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/shared/Spinner';
import { FaPen, FaPlus, FaTrash } from 'react-icons/fa';

// --- Avatares pré-definidos ---
const avatarOptions = [
    'https://github.com/MisakiShokuhou5/A-certain-Digital-Database/blob/main/src/profile/Accelerator.png?raw=true',
    'https://github.com/MisakiShokuhou5/A-certain-Digital-Database/blob/main/src/profile/kakine.png?raw=true',
    'https://github.com/MisakiShokuhou5/A-certain-Digital-Database/blob/main/src/profile/mikoto.png?raw=true',
    'https://github.com/MisakiShokuhou5/A-certain-Digital-Database/blob/main/src/profile/mugino.png?raw=true',
    'https://github.com/MisakiShokuhou5/A-certain-Digital-Database/blob/main/src/profile/misaki.png?raw=true',
    'https://github.com/MisakiShokuhou5/A-certain-Digital-Database/blob/main/src/profile/Junko.png?raw=true',
    'https://github.com/MisakiShokuhou5/A-certain-Digital-Database/blob/main/src/profile/index.png?raw=true',
];

// --- Animações ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const slideIn = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// --- Componentes Estilizados ---
const ProfilesContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 5rem 2rem;
    background-color: #141414;
    color: white;
    animation: ${fadeIn} 0.5s ease-in-out;
`;
const Title = styled.h1`
    font-size: clamp(2rem, 3.5vw, 4rem);
    margin-bottom: 2rem;
    font-weight: 700;
`;
const ProfileList = styled.div`
    display: flex;
    gap: clamp(1rem, 2vw, 2.5rem);
    flex-wrap: wrap;
    justify-content: center;
    max-width: 1000px;
`;
const ProfileItemContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
`;
const ProfileAvatar = styled.div`
    width: clamp(80px, 10vw, 180px);
    height: clamp(80px, 10vw, 180px);
    border-radius: 8px;
    background-image: url(${props => props.avatar});
    background-size: cover;
    position: relative;
    border: 4px solid transparent;
    transition: border-color 0.3s ease;
`;
const EditOverlay = styled.div`
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0,0,0,0.6);
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    font-size: clamp(2rem, 3vw, 3.5rem);
`;
const ProfileName = styled.p`
    color: #808080;
    font-size: 1.2rem;
    font-weight: 500;
    transition: color 0.3s ease;
`;
const ProfileItem = styled.div`
    &:hover ${ProfileAvatar} {
        border-color: #fff;
    }
    &:hover ${EditOverlay} {
        opacity: 1;
    }
    &:hover ${ProfileName} {
        color: #fff;
    }
`;
const AddProfileButton = styled(ProfileItemContainer)`
    .add-icon-container {
        width: clamp(80px, 10vw, 180px);
        height: clamp(80px, 10vw, 180px);
        border-radius: 8px;
        border: 4px solid #808080;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #808080;
        font-size: clamp(2.5rem, 4vw, 4rem);
        transition: all 0.3s ease;
    }
    &:hover .add-icon-container {
        border-color: #fff;
        color: #fff;
        background-color: #333;
    }
`;
const DoneButton = styled.button`
    background-color: transparent;
    border: 1px solid #808080;
    color: #808080;
    padding: 0.7rem 2rem;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 4rem;
    transition: all 0.2s;
    &:hover {
        background-color: #fff;
        color: #141414;
        border-color: #fff;
    }
`;

// --- Componente do Modal ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;
const ModalContent = styled.div`
  background-color: #1e1e3f;
  padding: 3rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  animation: ${slideIn} 0.4s ease-out;
  border: 1px solid rgba(138, 43, 226, 0.3);
`;
const ModalTitle = styled.h2`
  font-size: 2rem;
  margin: 0 0 2rem 0;
`;
const Input = styled.input`
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  background-color: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  margin-bottom: 2rem;
`;
const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;
const AvatarOption = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 4px;
  cursor: pointer;
  border: 3px solid ${props => props.isSelected ? '#8a2be2' : 'transparent'};
  transition: border-color 0.2s;
  &:hover {
    transform: scale(1.05);
  }
`;
const ModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
  gap: 1rem;
`;
const ModalButton = styled.button`
  flex-grow: 1;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  
  &.save {
    background-color: #8a2be2;
    color: #fff;
    &:hover:not(:disabled) { background-color: #7c25d3; }
  }
  &.cancel {
    background-color: #6c757d;
    color: #fff;
    &:hover:not(:disabled) { background-color: #5a6268; }
  }
  &.delete {
    background-color: transparent;
    color: #dc3545;
    border: 1px solid #dc3545;
    &:hover:not(:disabled) { background-color: #dc3545; color: #fff; }
  }

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const ProfileFormModal = ({ isOpen, onClose, profile, onSave, onDelete }) => {
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setImageUrl(profile.imageUrl || '');
        } else { // Modo de criação
            setName('');
            setImageUrl(avatarOptions[0]); // Padrão para o primeiro avatar
        }
    }, [profile, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({ ...profile, name, imageUrl });
        setIsSaving(false);
        onClose();
    };
    
    const handleDelete = async () => {
        if(window.confirm(`Tem certeza que deseja deletar o perfil "${profile.name}"?`)){
            setIsSaving(true);
            await onDelete(profile.id);
            setIsSaving(false);
            onClose();
        }
    }

    return (
        <ModalOverlay>
            <ModalContent>
                <ModalTitle>{profile ? 'Editar Perfil' : 'Adicionar Perfil'}</ModalTitle>
                <Input 
                    type="text" 
                    placeholder="Nome do Perfil" 
                    value={name}
                    onChange={(e) => setName(e.target.value)} 
                />
                <label>Escolha um avatar:</label>
                <AvatarGrid>
                    {avatarOptions.map(avatarUrl => (
                        <AvatarOption 
                            key={avatarUrl}
                            src={avatarUrl}
                            isSelected={imageUrl === avatarUrl}
                            onClick={() => setImageUrl(avatarUrl)}
                        />
                    ))}
                </AvatarGrid>
                <ModalActions>
                    <ModalButton className="save" onClick={handleSave} disabled={!name || isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </ModalButton>
                    <ModalButton className="cancel" onClick={onClose} disabled={isSaving}>Cancelar</ModalButton>
                    {profile && (
                        <ModalButton className="delete" onClick={handleDelete} disabled={isSaving}>
                            Deletar
                        </ModalButton>
                    )}
                </ModalActions>
            </ModalContent>
        </ModalOverlay>
    );
};

const MAX_PROFILES = 5;

const EditProfiles = () => {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setLoading(false); // Se não há usuário, não há o que carregar
            return;
        };
        
        const profilesCollection = collection(db, `users/${user.uid}/profiles`);
        const q = query(profilesCollection, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const profilesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProfiles(profilesData);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar perfis: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleProfileClick = (profile) => {
        setSelectedProfile(profile);
        setIsModalOpen(true);
    };

    const handleAddProfileClick = () => {
        setSelectedProfile(null); // Garante que estamos no modo de criação
        setIsModalOpen(true);
    };

    const handleSaveProfile = async (profileData) => {
        if (!user) return;
        const profilesCollection = collection(db, `users/${user.uid}/profiles`);

        if (profileData.id) { // Editando perfil existente
            const profileDoc = doc(db, `users/${user.uid}/profiles`, profileData.id);
            await updateDoc(profileDoc, { 
                name: profileData.name, 
                imageUrl: profileData.imageUrl 
            });
        } else { // Criando novo perfil
            await addDoc(profilesCollection, { 
                name: profileData.name, 
                imageUrl: profileData.imageUrl,
                createdAt: new Date() // Para manter a ordem
            });
        }
    };

    const handleDeleteProfile = async (profileId) => {
        if (!user) return;
        if (profiles.length <= 1) {
            alert("Você não pode deletar seu único perfil.");
            return;
        }
        const profileDoc = doc(db, `users/${user.uid}/profiles`, profileId);
        await deleteDoc(profileDoc);
    };

    if (loading) return <Spinner />;

    return (
        <>
            <ProfilesContainer>
                <Title>Gerenciar Perfis</Title>
                <ProfileList>
                    {profiles.map(profile => (
                        <ProfileItemContainer key={profile.id} onClick={() => handleProfileClick(profile)}>
                            <ProfileItem>
                                <ProfileAvatar avatar={profile.imageUrl}>
                                    <EditOverlay>
                                        <FaPen />
                                    </EditOverlay>
                                </ProfileAvatar>
                                <ProfileName>{profile.name}</ProfileName>
                            </ProfileItem>
                        </ProfileItemContainer>
                    ))}
                    {profiles.length < MAX_PROFILES && (
                        <AddProfileButton onClick={handleAddProfileClick}>
                            <div className="add-icon-container">
                                <FaPlus />
                            </div>
                            <ProfileName>Adicionar Perfil</ProfileName>
                        </AddProfileButton>
                    )}
                </ProfileList>
                <DoneButton onClick={() => navigate('/browse')}>
                    Concluído
                </DoneButton>
            </ProfilesContainer>
            
            <ProfileFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                profile={selectedProfile}
                onSave={handleSaveProfile}
                onDelete={handleDeleteProfile}
            />
        </>
    );
};

export default EditProfiles;