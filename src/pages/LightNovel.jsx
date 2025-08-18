// ----------------------------------------------------------------
// ARQUIVO FINAL: src/pages/LightNovel.jsx
// Leitor de Light Novel robusto com configurações de leitura e UI refinada.
//
// Melhorias Chave:
// - Foco em Texto: Interface otimizada para leitura, não para imagens.
// - Navegação por Capítulo: Seleção de capítulo via dropdown e botões.
// - Configurações de Leitura: Ajuste de fonte, tema (claro/sépia/escuro) e largura do texto.
// - UI Inteligente: Painel de configurações não intrusivo e atalhos de teclado.
// - Qualidade de Código: Lógica adaptada do leitor de mangá, mantendo a alta qualidade.
// ----------------------------------------------------------------
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { css } from 'styled-components';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Header from '../components/Header';
import Spinner from '../components/shared/Spinner';

// --- Styled Components (Componentes de Estilo) ---

// (Estilos da página principal, idênticos ao Manga.jsx)
const MainContent = styled.main`
    padding: 100px 2rem 2rem 2rem;
`;
const SeriesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
`;
const SeriesCard = styled.div`
    background-color: #1e1e1e;
    border-radius: 8px;
    overflow: hidden;
    text-align: center;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
    &:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(138, 43, 226, 0.4);
    }
`;
const SeriesCover = styled.img`
    width: 100%;
    height: 250px;
    object-fit: cover;
    flex-shrink: 0;
`;
const SeriesTitle = styled.span`
    padding: 1rem 0.5rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: #E5E5E5;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
`;

// (Estilos do Leitor, adaptados para Light Novel)
const ReaderOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.97);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    user-select: none;
`;

const ReaderHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.5rem;
    background-color: #1a1a1a;
    flex-shrink: 0;
    z-index: 20;
    box-shadow: 0 2px 10px rgba(0,0,0,0.5);
`;

const ReaderTitle = styled.h2`
    font-size: 1.2rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 1rem;
`;

const ReaderControls = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    position: relative; // Para o painel de configurações
`;

const ReaderIconBtn = styled.i`
    font-size: 1.6rem;
    cursor: pointer;
    transition: color 0.2s, transform 0.2s;
    &:hover {
        color: #8a2be2;
        transform: scale(1.1);
    }
`;

const ChapterSelector = styled.select`
    background-color: #2a2a2a;
    color: #e5e5e5;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
`;

const ReaderBody = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 2rem 0;
    display: flex;
    justify-content: center;

    /* Estilização da barra de rolagem */
    &::-webkit-scrollbar {
      width: 10px;
    }
    &::-webkit-scrollbar-track {
      background: #1a1a1a;
    }
    &::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 5px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #8a2be2;
    }
`;

const themes = {
  light: { bg: '#e5e5e5', text: '#121212' },
  sepia: { bg: '#fbf0d9', text: '#5b4636' },
  dark: { bg: '#121212', text: '#e5e5e5' },
};

const ChapterContent = styled.div`
    font-family: 'Georgia', serif;
    line-height: 1.8;
    white-space: pre-wrap; // Mantém as quebras de linha do texto
    width: 100%;
    max-width: ${props => props.textWidth}px;
    font-size: ${props => props.fontSize}px;
    background-color: ${props => themes[props.theme].bg};
    color: ${props => themes[props.theme].text};
    padding: 3rem 4rem;
    transition: all 0.3s ease;
`;

const ChapterTitle = styled.h3`
    font-size: 2em;
    font-weight: bold;
    margin-bottom: 2rem;
    text-align: center;
`;

const ReaderFooter = styled.footer`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 2rem;
    background-color: #1a1a1a;
    flex-shrink: 0;
    z-index: 20;
`;

const NavButton = styled.button`
    background-color: #2a2a2a;
    border: 1px solid #555;
    color: white;
    font-size: 1rem;
    padding: 0.5rem 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        background-color: #8a2be2;
        border-color: #8a2be2;
    }

    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
`;

const SettingsPanel = styled.div`
    position: absolute;
    top: 130%;
    right: 0;
    background-color: #2a2a2a;
    border-radius: 8px;
    padding: 1.5rem;
    z-index: 2100;
    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    width: 280px;
`;

const SettingRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const SettingLabel = styled.label`
    font-size: 0.9rem;
    color: #ccc;
`;

const SettingControl = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ThemeButton = styled.button`
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid ${props => props.isActive ? '#8a2be2' : '#555'};
    cursor: pointer;
    background-color: ${props => props.color};
`;


// --- Leitor de Light Novel Aprimorado ---
const LightNovelReader = ({ lightNovel, onClose }) => {
    // Estado do conteúdo
    const [chapters, setChapters] = useState([]);
    const [loadingChapters, setLoadingChapters] = useState(true);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

    // Estado da interface e configurações
    const [settings, setSettings] = useState({
        fontSize: 18, // Tamanho de fonte padrão
        theme: 'dark', // 'light', 'sepia', 'dark'
        textWidth: 800, // Largura máxima do texto em pixels
    });
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const readerBodyRef = useRef(null);

    // --- CARREGAMENTO DE DADOS ---
    useEffect(() => {
        const chaptersCollectionRef = collection(db, 'lightnovels', lightNovel.id, 'chapters');
        const q = query(chaptersCollectionRef, orderBy('chapterNumber'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chaptersData = snapshot.docs.map(doc => doc.data());
            setChapters(chaptersData);
            setLoadingChapters(false);
            setCurrentChapterIndex(0);
        });
        return () => unsubscribe();
    }, [lightNovel.id]);

    // Scroll para o topo ao mudar de capítulo
    useEffect(() => {
        if (readerBodyRef.current) {
            readerBodyRef.current.scrollTop = 0;
        }
    }, [currentChapterIndex]);

    // --- FUNÇÕES DE CONTROLE ---
    const goToNextChapter = useCallback(() => {
        if (currentChapterIndex < chapters.length - 1) {
            setCurrentChapterIndex(prev => prev + 1);
        }
    }, [currentChapterIndex, chapters.length]);

    const goToPrevChapter = useCallback(() => {
        if (currentChapterIndex > 0) {
            setCurrentChapterIndex(prev => prev - 1);
        }
    }, [currentChapterIndex]);

    const handleChapterSelect = (e) => {
        setCurrentChapterIndex(parseInt(e.target.value, 10));
    };

    const updateSettings = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // --- ATALHOS DE TECLADO ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') goToNextChapter();
            if (e.key === 'ArrowLeft') goToPrevChapter();
            if (e.key === 's' || e.key === 'S') setSettingsOpen(prev => !prev);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, goToNextChapter, goToPrevChapter]);

    // --- RENDERIZAÇÃO ---
    const currentChapter = chapters[currentChapterIndex];

    return (
        <ReaderOverlay>
            <ReaderHeader>
                <ReaderTitle>{lightNovel.title}</ReaderTitle>
                <ReaderControls>
                    {chapters.length > 0 && (
                        <ChapterSelector value={currentChapterIndex} onChange={handleChapterSelect}>
                            {chapters.map((chap, index) => (
                                <option key={chap.chapterNumber} value={index}>
                                    Capítulo {chap.chapterNumber}: {chap.title}
                                </option>
                            ))}
                        </ChapterSelector>
                    )}
                    <ReaderIconBtn className="fas fa-cog" onClick={() => setSettingsOpen(!isSettingsOpen)} title="Configurações (S)" />
                    <ReaderIconBtn className="fas fa-times" onClick={onClose} title="Fechar (Esc)" />
                    
                    {isSettingsOpen && (
                        <SettingsPanel>
                            <SettingRow>
                                <SettingLabel>Tamanho da Fonte: {settings.fontSize}px</SettingLabel>
                                <SettingControl>
                                    <button onClick={() => updateSettings('fontSize', Math.max(12, settings.fontSize - 1))}>A-</button>
                                    <input 
                                        type="range" 
                                        min="12" 
                                        max="32" 
                                        value={settings.fontSize} 
                                        onChange={(e) => updateSettings('fontSize', parseInt(e.target.value, 10))} 
                                    />
                                    <button onClick={() => updateSettings('fontSize', Math.min(32, settings.fontSize + 1))}>A+</button>
                                </SettingControl>
                            </SettingRow>
                             <SettingRow>
                                <SettingLabel>Largura do Texto</SettingLabel>
                                <input 
                                    type="range" 
                                    min="500" 
                                    max="1200" 
                                    step="50"
                                    value={settings.textWidth} 
                                    onChange={(e) => updateSettings('textWidth', parseInt(e.target.value, 10))} 
                                />
                            </SettingRow>
                            <SettingRow>
                                <SettingLabel>Tema</SettingLabel>
                                <SettingControl>
                                    <ThemeButton title="Claro" color={themes.light.bg} isActive={settings.theme === 'light'} onClick={() => updateSettings('theme', 'light')} />
                                    <ThemeButton title="Sépia" color={themes.sepia.bg} isActive={settings.theme === 'sepia'} onClick={() => updateSettings('theme', 'sepia')} />
                                    <ThemeButton title="Escuro" color={themes.dark.bg} isActive={settings.theme === 'dark'} onClick={() => updateSettings('theme', 'dark')} />
                                </SettingControl>
                            </SettingRow>
                        </SettingsPanel>
                    )}
                </ReaderControls>
            </ReaderHeader>

            <ReaderBody ref={readerBodyRef}>
                {loadingChapters ? <Spinner /> : !currentChapter ? (
                    <p>Nenhum capítulo encontrado.</p>
                ) : (
                    <ChapterContent {...settings}>
                        <ChapterTitle>{currentChapter.title}</ChapterTitle>
                        {currentChapter.content}
                    </ChapterContent>
                )}
            </ReaderBody>

            <ReaderFooter>
                <NavButton onClick={goToPrevChapter} disabled={currentChapterIndex === 0}>
                    <i className="fas fa-arrow-left"></i> Capítulo Anterior
                </NavButton>
                <NavButton onClick={goToNextChapter} disabled={currentChapterIndex >= chapters.length - 1}>
                    Próximo Capítulo <i className="fas fa-arrow-right"></i>
                </NavButton>
            </ReaderFooter>
        </ReaderOverlay>
    );
};


// --- Página Principal de Light Novels ---
const LightNovel = () => {
    const [novelList, setNovelList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReaderOpen, setReaderOpen] = useState(false);
    const [selectedNovel, setSelectedNovel] = useState(null);

    useEffect(() => {
        const novelsCollectionRef = collection(db, 'lightnovels');
        const q = query(novelsCollectionRef, orderBy('title'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const novelsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNovelList(novelsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        document.body.style.overflow = isReaderOpen ? 'hidden' : 'auto';
    }, [isReaderOpen]);

    const openReader = (novel) => {
        setSelectedNovel(novel);
        setReaderOpen(true);
    };

    const closeReader = () => {
        setReaderOpen(false);
        setSelectedNovel(null);
    };

    if (loading) {
        return (
            <>
                <Header />
                <MainContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Spinner />
                </MainContent>
            </>
        );
    }

    return (
        <>
            <Header />
            <MainContent>
                <SeriesGrid>
                    {novelList.map(novel => (
                        <SeriesCard key={novel.id} onClick={() => openReader(novel)}>
                            <SeriesCover src={novel.imageUrl || 'https://placehold.co/180x250/1e1e1e/fff?text=Capa'} alt={`Capa de ${novel.title}`} />
                            <SeriesTitle>{novel.title}</SeriesTitle>
                        </SeriesCard>
                    ))}
                </SeriesGrid>
            </MainContent>
            {isReaderOpen && <LightNovelReader lightNovel={selectedNovel} onClose={closeReader} />}
        </>
    );
};

export default LightNovel;