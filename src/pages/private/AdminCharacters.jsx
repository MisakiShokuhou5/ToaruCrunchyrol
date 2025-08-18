// ARQUIVO: src/pages/private/AdminCharacters.jsx
// DESCRIÇÃO: Painel de personagens completo com busca, select de gênero e UI refinada.
// -------------------------------------------------------------------------------
import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import Spinner from '../../components/shared/Spinner';

// --- Componentes Estilizados (Ajustados e com adições) ---
const PageContainer = styled.div`
  padding: 2rem;
  color: #fff;
`;
const AdminSectionContainer = styled.div`
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  width: 100%;
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;
const FormContainer = styled.div`
  background-color: #12121c;
  padding: 2rem;
  border-radius: 8px;
  height: fit-content;
  border: 1px solid rgba(138, 43, 226, 0.2);
  position: sticky;
  top: 2rem;
`;
const FormTitle = styled.h3`
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
  margin-bottom: 1.2rem; // Aumentado para melhor espaçamento
`;
const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #a9a9d4;
  font-size: 0.9rem;
`;
const Input = styled.input`
  width: 100%;
  padding: 10px;
  background-color: #1e1e3f;
  border: 1px solid rgba(138, 43, 226, 0.5);
  color: #fff;
  border-radius: 5px;
  font-size: 1rem;
`;
// ALTERADO: Componente Select para o gênero
const Select = styled.select`
  width: 100%;
  padding: 10px;
  background-color: #1e1e3f;
  border: 1px solid rgba(138, 43, 226, 0.5);
  color: #fff;
  border-radius: 5px;
  font-size: 1rem;
`;
const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  background-color: #1e1e3f;
  border: 1px solid rgba(138, 43, 226, 0.5);
  color: #fff;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
`;
const ButtonContainer = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
`;
const SubmitButton = styled.button`
  flex-grow: 1;
  padding: 12px;
  background-color: #8a2be2;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover:not(:disabled) { background-color: #7c25d3; }
  &:disabled { background-color: #555; cursor: not-allowed; opacity: 0.6; }
`;
const CancelButton = styled(SubmitButton)`
    background-color: #6c757d;
    &:hover:not(:disabled) { background-color: #5a6268; }
`;
const ListContainer = styled.div`
  background-color: #12121c;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid rgba(138, 43, 226, 0.2);
`;
// NOVO: Container para a barra de busca
const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 2rem;

  svg {
    position: absolute;
    top: 50%;
    left: 15px;
    transform: translateY(-50%);
    color: #a9a9d4;
  }

  input {
    padding-left: 45px;
  }
`;
const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #1e1e3f;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  // NOVO: Borda colorida baseada no gênero
  border-left: 4px solid ${props => props.gender === 'Feminino' ? '#e91e63' : (props.gender === 'Masculino' ? '#2196f3' : '#8a2be2')};
`;
const ItemInfo = styled.div`
  flex-grow: 1;
  h3 { margin: 0 0 5px 0; font-size: 1.2rem; }
  p { margin: 0; color: #a9a9d4; font-size: 0.9rem; line-height: 1.4; }
  span { font-weight: bold; color: #fff; }
`;
const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  button {
    background: none; border: none; color: #a9a9d4;
    font-size: 1.2rem; cursor: pointer;
    transition: color 0.2s; padding: 0.5rem;
    &:hover { color: #fff; }
  }
`;

// --- Componente Principal de Gerenciamento de Personagens ---
const AdminCharacters = () => {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // NOVO: Estado para a busca

    const initialFormState = { name: '', gender: 'Não Especificado', description: '', imageUrl: '' };
    const [formData, setFormData] = useState(initialFormState);

    const charactersCollectionRef = collection(db, 'characters');

    useEffect(() => {
        const q = query(charactersCollectionRef, orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const charsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setCharacters(charsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (character) => {
        setEditingId(character.id);
        // Garante que todos os campos existam no formulário ao editar
        setFormData({ 
            name: character.name || '', 
            gender: character.gender || 'Não Especificado', 
            description: character.description || '', 
            imageUrl: character.imageUrl || '' 
        });
        window.scrollTo(0, 0);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData(initialFormState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.imageUrl) {
            alert('Nome e URL da Imagem são obrigatórios.');
            return;
        }

        setIsSubmitting(true);
        try {
            const dataToSave = { ...formData };
            if (editingId) {
                const characterDoc = doc(db, 'characters', editingId);
                await updateDoc(characterDoc, dataToSave);
            } else {
                await addDoc(charactersCollectionRef, dataToSave);
            }
            cancelEdit();
        } catch (error) {
            console.error("Erro ao salvar personagem: ", error);
            alert("Ocorreu um erro ao salvar. Verifique o console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar este personagem?')) {
            const characterDoc = doc(db, 'characters', id);
            await deleteDoc(characterDoc);
        }
    };
    
    // NOVO: Lógica de filtragem com useMemo para performance
    const filteredCharacters = useMemo(() => 
        characters.filter(char => 
            char.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [characters, searchTerm]);

    if (loading) return <Spinner />;

    return (
        <PageContainer>
            <h1>Gerenciador de Personagens</h1>
            <AdminSectionContainer>
                <FormContainer>
                    <FormTitle>
                        {editingId ? <FaEdit /> : <FaPlus />}
                        {editingId ? 'Editar Personagem' : 'Adicionar Personagem'}
                    </FormTitle>
                    <form onSubmit={handleSubmit}>
                        <InputGroup>
                            <Label>Nome do Personagem</Label>
                            <Input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                        </InputGroup>
                        <InputGroup>
                            <Label>Gênero</Label>
                            {/* ALTERADO: Input de texto para Select */}
                            <Select name="gender" value={formData.gender} onChange={handleInputChange}>
                                <option>Não Especificado</option>
                                <option>Masculino</option>
                                <option>Feminino</option>
                                <option>Não Binário</option>
                                <option>Outro</option>
                            </Select>
                        </InputGroup>
                        <InputGroup>
                            <Label>Descrição</Label>
                            <Textarea name="description" value={formData.description} onChange={handleInputChange} />
                        </InputGroup>
                        <InputGroup>
                            <Label>URL da Imagem</Label>
                            <Input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} required />
                        </InputGroup>
                        <ButtonContainer>
                            {editingId && (
                                <CancelButton type="button" onClick={cancelEdit}>
                                    <FaTimes style={{ marginRight: '8px' }} /> Cancelar
                                </CancelButton>
                            )}
                            <SubmitButton type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Adicionar')}
                            </SubmitButton>
                        </ButtonContainer>
                    </form>
                </FormContainer>

                <ListContainer>
                    {/* NOVO: Barra de busca */}
                    <SearchContainer>
                        <FaSearch />
                        <Input 
                            type="text" 
                            placeholder={`Buscar em ${characters.length} personagens...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </SearchContainer>
                    
                    {filteredCharacters.map(char => (
                        <Item key={char.id} gender={char.gender}>
                            <img src={char.imageUrl} alt={char.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }} />
                            <ItemInfo>
                                <h3>{char.name}</h3>
                                <p><span>Gênero:</span> {char.gender || 'Não definido'}</p>
                                {char.description && <p><span>Descrição:</span> {char.description}</p>}
                            </ItemInfo>
                            <ActionButtons>
                                <button onClick={() => handleEdit(char)} aria-label={`Editar ${char.name}`}><FaEdit /></button>
                                <button onClick={() => handleDelete(char.id)} aria-label={`Deletar ${char.name}`}><FaTrash /></button>
                            </ActionButtons>
                        </Item>
                    ))}
                </ListContainer>
            </AdminSectionContainer>
        </PageContainer>
    );
};

export default AdminCharacters;