// ARQUIVO: src/pages/private/AdminLightNovel.jsx
// DESCRIÇÃO: Painel de administração para gerenciar light novels e seus respectivos capítulos.
// -------------------------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../../firebase/config';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { FaEdit, FaTrash, FaPlus, FaBookOpen, FaArrowLeft } from 'react-icons/fa';
import Spinner from '../../components/shared/Spinner';

// --- Componentes Estilizados (Reutilizados do AdminManga) ---

const AdminSectionContainer = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
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
`;

const FormTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  color: #fff;

  svg {
    margin-right: 12px;
    color: #8a2be2;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  background-color: #1e1e3f;
  border: 1px solid rgba(138, 43, 226, 0.5);
  color: #fff;
  border-radius: 5px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #8a2be2;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;

  &:hover {
    background-color: #7c25d3;
  }
`;

const ListContainer = styled.div`
  background-color: #12121c;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid rgba(138, 43, 226, 0.2);
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  background-color: #1e1e3f;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  border-left: 4px solid #8a2be2;
`;

const ItemInfo = styled.div`
  flex-grow: 1;
  margin-left: 1rem;
  h3 { margin: 0 0 5px 0; font-size: 1.1rem; }
  p { margin: 0; color: #a9a9d4; font-size: 0.9rem; }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  
  button {
    background: none;
    border: none;
    color: #a9a9d4;
    font-size: 1.2rem;
    cursor: pointer;
    transition: color 0.2s;
    padding: 0.5rem;
    &:hover { color: #fff; }
  }
`;

const BackButton = styled.button`
    background: none;
    border: none;
    color: #a9a9d4;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    
    svg { margin-right: 0.5rem; }
    &:hover { color: #fff; }
`;


// --- Componente de Gerenciamento de Capítulos ---
const ChapterManager = ({ lightNovel, onBack }) => {
    const [chapters, setChapters] = useState([]);
    const [chapterData, setChapterData] = useState({ chapterNumber: '', title: '', content: '' });
    const chaptersCollectionRef = collection(db, 'lightnovels', lightNovel.id, 'chapters');

    useEffect(() => {
        const q = query(chaptersCollectionRef, orderBy('chapterNumber'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chaptersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setChapters(chaptersData);
        });
        return () => unsubscribe();
    }, [lightNovel.id]);

    const handleChapterInputChange = (e) => {
        const { name, value } = e.target;
        const val = name === 'chapterNumber' ? parseInt(value, 10) || '' : value;
        setChapterData(prev => ({ ...prev, [name]: val }));
    };

    const handleAddChapter = async (e) => {
        e.preventDefault();
        if (!chapterData.chapterNumber || !chapterData.title || !chapterData.content) {
            alert('Número, Título e Conteúdo do capítulo são obrigatórios.');
            return;
        }
        await addDoc(chaptersCollectionRef, chapterData);
        setChapterData({ chapterNumber: '', title: '', content: '' });
    };

    const handleDeleteChapter = async (chapterId) => {
        if (window.confirm('Tem certeza que deseja deletar este capítulo?')) {
            const chapterDoc = doc(db, 'lightnovels', lightNovel.id, 'chapters', chapterId);
            await deleteDoc(chapterDoc);
        }
    };

    return (
        <AdminSectionContainer>
            <FormContainer>
                <BackButton onClick={onBack}><FaArrowLeft /> Voltar para Light Novels</BackButton>
                <FormTitle><FaPlus /> Adicionar Capítulo</FormTitle>
                <form onSubmit={handleAddChapter}>
                    <InputGroup>
                        <Label>Número do Capítulo</Label>
                        <Input type="number" name="chapterNumber" value={chapterData.chapterNumber} onChange={handleChapterInputChange} required />
                    </InputGroup>
                    <InputGroup>
                        <Label>Título do Capítulo</Label>
                        <Input type="text" name="title" value={chapterData.title} onChange={handleChapterInputChange} required />
                    </InputGroup>
                    <InputGroup>
                        <Label>Conteúdo do Capítulo</Label>
                        <TextArea name="content" value={chapterData.content} onChange={handleChapterInputChange} required style={{minHeight: '200px'}}/>
                    </InputGroup>
                    <SubmitButton type="submit">Adicionar Capítulo</SubmitButton>
                </form>
            </FormContainer>
            <ListContainer>
                <h3>Capítulos de: {lightNovel.title}</h3>
                {chapters.map(chapter => (
                    <Item key={chapter.id}>
                        <ItemInfo style={{ marginLeft: 0 }}>
                            <h3>Capítulo {chapter.chapterNumber}: {chapter.title}</h3>
                        </ItemInfo>
                        <ActionButtons>
                            <button onClick={() => handleDeleteChapter(chapter.id)}><FaTrash /></button>
                        </ActionButtons>
                    </Item>
                ))}
            </ListContainer>
        </AdminSectionContainer>
    );
};


// --- Componente Principal ---
const AdminLightNovel = () => {
    const [lightNovels, setLightNovels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: '', author: '', imageUrl: '', synopsis: '' });
    const [editingId, setEditingId] = useState(null);
    const [selectedLightNovel, setSelectedLightNovel] = useState(null);

    const novelsCollectionRef = collection(db, 'lightnovels');

    useEffect(() => {
        const unsubscribe = onSnapshot(novelsCollectionRef, (snapshot) => {
            const novelsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setLightNovels(novelsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.author) {
            alert('Título e Autor são obrigatórios.');
            return;
        }

        if (editingId) {
            const novelDoc = doc(db, 'lightnovels', editingId);
            await updateDoc(novelDoc, formData);
        } else {
            await addDoc(novelsCollectionRef, formData);
        }

        setFormData({ title: '', author: '', imageUrl: '', synopsis: '' });
        setEditingId(null);
    };

    const handleEdit = (novel) => {
        setEditingId(novel.id);
        setFormData({
            title: novel.title,
            author: novel.author,
            imageUrl: novel.imageUrl,
            synopsis: novel.synopsis,
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar esta Light Novel?')) {
            const novelDoc = doc(db, 'lightnovels', id);
            await deleteDoc(novelDoc);
        }
    };

    if (loading) return <Spinner />;
    
    if (selectedLightNovel) {
        return <ChapterManager lightNovel={selectedLightNovel} onBack={() => setSelectedLightNovel(null)} />;
    }

    return (
        <AdminSectionContainer>
            <FormContainer>
                <FormTitle>
                    {editingId ? <FaEdit /> : <FaPlus />}
                    {editingId ? 'Editar Light Novel' : 'Adicionar Nova Light Novel'}
                </FormTitle>
                <form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label htmlFor="title">Título</Label>
                        <Input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                    </InputGroup>
                    <InputGroup>
                        <Label htmlFor="author">Autor</Label>
                        <Input type="text" name="author" value={formData.author} onChange={handleInputChange} required />
                    </InputGroup>
                    <InputGroup>
                        <Label htmlFor="imageUrl">URL da Imagem de Capa</Label>
                        <Input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} />
                    </InputGroup>
                    <InputGroup>
                        <Label htmlFor="synopsis">Sinopse</Label>
                        <TextArea name="synopsis" value={formData.synopsis} onChange={handleInputChange} />
                    </InputGroup>
                    <SubmitButton type="submit">{editingId ? 'Salvar Alterações' : 'Adicionar Light Novel'}</SubmitButton>
                </form>
            </FormContainer>

            <ListContainer>
                {lightNovels.map(novel => (
                    <Item key={novel.id}>
                        <img src={novel.imageUrl || 'https://placehold.co/60x80/1e1e3f/a9a9d4?text=?'} alt={novel.title} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                        <ItemInfo>
                            <h3>{novel.title}</h3>
                            <p>{novel.author}</p>
                        </ItemInfo>
                        <ActionButtons>
                            <button onClick={() => setSelectedLightNovel(novel)} title="Gerenciar Capítulos"><FaBookOpen /></button>
                            <button onClick={() => handleEdit(novel)} title="Editar Light Novel"><FaEdit /></button>
                            <button onClick={() => handleDelete(novel.id)} title="Deletar Light Novel"><FaTrash /></button>
                        </ActionButtons>
                    </Item>
                ))}
            </ListContainer>
        </AdminSectionContainer>
    );
};

export default AdminLightNovel;