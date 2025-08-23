// ----------------------------------------------------------------
// ARQUIVO FINAL: src/pages/LightNovel.jsx (VERSÃO COM MARCADOR DE PÁGINA)
//
// NOVO: Sistema de marcador de página automático que salva e carrega o último
// capítulo lido para cada novel individualmente.
// ----------------------------------------------------------------
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Header from '../components/Header';
import Spinner from '../components/shared/Spinner';

// --- ANIMAÇÕES, STYLES, ETC. (sem alterações aqui) ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;
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
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(138, 43, 226, 0.5);
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
const ReaderOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.98);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    user-select: none;
    animation: ${fadeIn} 0.3s ease;
`;
const ReaderHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.5rem;
    background-color: #1a1a1a;
    flex-shrink: 0;
    z-index: 2010;
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
    position: relative;
`;
const ReaderIconBtn = styled.button`
    background: none;
    border: none;
    color: #e5e5e5;
    font-size: 1.6rem;
    cursor: pointer;
    transition: color 0.2s, transform 0.2s;
    padding: 0;
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
const themes = {
  light: { bg: '#f5f5f5', text: '#121212' },
  sepia: { bg: '#fbf0d9', text: '#5b4636' },
  dark: { bg: '#121212', text: '#e5e5e5' },
};
const ReaderBody = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 2rem 0;
    display: flex;
    justify-content: center;
    position: relative;
    transition: background-color 0.3s ease;
    background-color: ${props => themes[props.theme].bg};
    
    &::-webkit-scrollbar { width: 10px; }
    &::-webkit-scrollbar-track { background: #1a1a1a; }
    &::-webkit-scrollbar-thumb { background: #444; border-radius: 5px; }
    &::-webkit-scrollbar-thumb:hover { background: #8a2be2; }
`;
const ChapterContent = styled.div`
    font-family: 'Georgia', serif;
    white-space: pre-wrap;
    width: 100%;
    transition: all 0.3s ease;
    padding: 3rem 4rem;
    max-width: ${props => props.textWidth}px;
    font-size: ${props => props.fontSize}px;
    line-height: ${props => props.lineHeight};
    text-align: ${props => props.textAlign};
    color: ${props => themes[props.theme].text};
    min-height: 100%;
    box-sizing: border-box;
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
    z-index: 2010;
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
    gap: 1.5rem;
    width: 300px;
    animation: ${slideIn} 0.2s ease-out;
`;
const SettingRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;
const SettingLabel = styled.label`
    font-size: 0.9rem;
    color: #ccc;
    display: flex;
    justify-content: space-between;
    align-items: center;
    & > span {
        font-weight: bold;
        color: #fff;
    }
`;
const SettingControl = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
`;
const ThemeButton = styled.button`
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid ${props => props.isActive ? '#8a2be2' : '#555'};
    cursor: pointer;
    background-color: ${props => props.color};
    transition: border-color 0.2s, transform 0.2s;
    &:hover {
        transform: scale(1.1);
    }
`;
const CustomSlider = styled.input.attrs({ type: 'range' })`
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 8px;
  background: #444; border-radius: 5px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 20px; height: 20px;
    background: #8a2be2; cursor: pointer;
    border-radius: 50%;
  }
  &::-moz-range-thumb {
    width: 20px; height: 20px;
    background: #8a2be2; cursor: pointer;
    border-radius: 50%; border: none;
  }
`;
const ToggleButtonGroup = styled.div`
  display: flex; border: 1px solid #555;
  border-radius: 5px; overflow: hidden; width: 100%;
`;
const ToggleButton = styled.button`
  flex: 1; padding: 0.5rem;
  background-color: ${props => props.isActive ? '#8a2be2' : '#333'};
  color: white; border: none; cursor: pointer;
  transition: background-color 0.2s;
  &:not(:last-child) { border-right: 1px solid #555; }
`;
const ScrollToTopButton = styled.button`
  position: fixed;
  bottom: 100px; right: 30px;
  z-index: 2020;
  background-color: rgba(138, 43, 226, 0.8);
  color: white; border: none;
  border-radius: 50%; width: 50px; height: 50px;
  font-size: 1.5rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
  transition: transform 0.2s, opacity 0.3s;
  opacity: ${props => props.visible ? 1 : 0};
  transform: ${props => props.visible ? 'scale(1)' : 'scale(0.5)'};
  pointer-events: ${props => props.visible ? 'auto' : 'none'};

  &:hover {
    background-color: rgba(138, 43, 226, 1);
    transform: scale(1.1);
  }
`;

// --- LÓGICA DO MARCADOR DE PÁGINA ---

const PROGRESS_STORAGE_KEY = 'lightNovelProgress';

// Função para salvar o progresso
const saveProgress = (novelId, chapterIndex) => {
    try {
        const progressData = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY)) || {};
        progressData[novelId] = chapterIndex;
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressData));
    } catch (error) {
        console.error("Falha ao salvar progresso:", error);
    }
};

// Função para carregar o progresso
const loadProgress = (novelId) => {
    try {
        const progressData = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY)) || {};
        // Retorna o índice salvo ou 0 se não houver nada
        return progressData[novelId] || 0;
    } catch (error) {
        console.error("Falha ao carregar progresso:", error);
        return 0; // Retorna 0 em caso de erro
    }
};


// --- RESTANTE DO CÓDIGO ---

const getInitialSettings = () => {
    const defaults = {
        fontSize: 18,
        theme: 'dark',
        textWidth: 800,
        lineHeight: 1.8,
        textAlign: 'left',
    };
    try {
        const savedSettings = localStorage.getItem('lightNovelReaderSettings');
        return savedSettings ? { ...defaults, ...JSON.parse(savedSettings) } : defaults;
    } catch (error) {
        console.error("Falha ao carregar configurações:", error);
        return defaults;
    }
};

const LightNovelReader = ({ lightNovel, onClose }) => {
    const [chapters, setChapters] = useState([]);
    const [loadingChapters, setLoadingChapters] = useState(true);
    
    // ALTERAÇÃO: Inicia o estado do capítulo com o progresso salvo
    const [currentChapterIndex, setCurrentChapterIndex] = useState(() => loadProgress(lightNovel.id));

    const [settings, setSettings] = useState(getInitialSettings);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    
    const readerBodyRef = useRef(null);
    const settingsPanelRef = useRef(null);

    // ALTERAÇÃO: Novo useEffect para salvar o progresso sempre que o capítulo mudar
    useEffect(() => {
        // Apenas salva se os capítulos já tiverem sido carregados
        if (!loadingChapters) {
            saveProgress(lightNovel.id, currentChapterIndex);
        }
    }, [currentChapterIndex, lightNovel.id, loadingChapters]);

    useEffect(() => {
        try {
            localStorage.setItem('lightNovelReaderSettings', JSON.stringify(settings));
        } catch (error) {
            console.error("Falha ao salvar configurações:", error);
        }
    }, [settings]);
    
    useEffect(() => {
        const chaptersRef = collection(db, 'lightnovels', lightNovel.id, 'chapters');
        const q = query(chaptersRef, orderBy('chapterNumber'));
        const unsubscribe = onSnapshot(q, snapshot => {
            const chaptersData = snapshot.docs.map(doc => doc.data());
            setChapters(chaptersData);
            setLoadingChapters(false);
            
            // Valida se o progresso salvo ainda é válido (ex: capítulos foram removidos)
            const savedIndex = loadProgress(lightNovel.id);
            if (savedIndex >= chaptersData.length) {
                setCurrentChapterIndex(0);
            }
        });
        return () => unsubscribe();
    }, [lightNovel.id]);

    useEffect(() => {
        if (readerBodyRef.current) readerBodyRef.current.scrollTop = 0;
    }, [currentChapterIndex]);

    useEffect(() => {
        const body = readerBodyRef.current;
        const handleScroll = () => setShowScrollTop(body?.scrollTop > 400);
        body?.addEventListener('scroll', handleScroll);
        return () => body?.removeEventListener('scroll', handleScroll);
    }, [loadingChapters]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsPanelRef.current && !settingsPanelRef.current.contains(event.target)) {
                setSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const goToNextChapter = useCallback(() => {
        if (currentChapterIndex < chapters.length - 1) setCurrentChapterIndex(prev => prev + 1);
    }, [currentChapterIndex, chapters.length]);

    const goToPrevChapter = useCallback(() => {
        if (currentChapterIndex > 0) setCurrentChapterIndex(prev => prev - 1);
    }, [currentChapterIndex]);
    
    const handleChapterSelect = (e) => setCurrentChapterIndex(parseInt(e.target.value, 10));
    const updateSetting = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
    const scrollToTop = () => readerBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') goToNextChapter();
            if (e.key === 'ArrowLeft') goToPrevChapter();
            if (e.key.toLowerCase() === 's') setSettingsOpen(prev => !prev);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, goToNextChapter, goToPrevChapter]);
    
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
                    <div ref={settingsPanelRef}>
                        <ReaderIconBtn onClick={() => setSettingsOpen(p => !p)} title="Configurações (S)">
                            <i className="fas fa-cog" />
                        </ReaderIconBtn>
                        {isSettingsOpen && (
                            <SettingsPanel>
                                <SettingRow>
                                    <SettingLabel>Tema</SettingLabel>
                                    <SettingControl>
                                        <ThemeButton title="Claro" color={themes.light.bg} isActive={settings.theme === 'light'} onClick={() => updateSetting('theme', 'light')} />
                                        <ThemeButton title="Sépia" color={themes.sepia.bg} isActive={settings.theme === 'sepia'} onClick={() => updateSetting('theme', 'sepia')} />
                                        <ThemeButton title="Escuro" color={themes.dark.bg} isActive={settings.theme === 'dark'} onClick={() => updateSetting('theme', 'dark')} />
                                    </SettingControl>
                                </SettingRow>
                                {/* ... Demais configurações ... */}
                                <SettingRow>
                                    <SettingLabel>Tamanho da Fonte: <span>{settings.fontSize}px</span></SettingLabel>
                                    <CustomSlider min="12" max="32" value={settings.fontSize} onChange={(e) => updateSetting('fontSize', parseInt(e.target.value, 10))} />
                                </SettingRow>
                                <SettingRow>
                                    <SettingLabel>Largura do Texto: <span>{settings.textWidth}px</span></SettingLabel>
                                    <CustomSlider min="500" max="1200" step="50" value={settings.textWidth} onChange={(e) => updateSetting('textWidth', parseInt(e.target.value, 10))} />
                                </SettingRow>
                                <SettingRow>
                                    <SettingLabel>Altura da Linha: <span>{settings.lineHeight}</span></SettingLabel>
                                    <CustomSlider min="1.4" max="2.4" step="0.1" value={settings.lineHeight} onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))} />
                                </SettingRow>
                                <SettingRow>
                                    <SettingLabel>Alinhamento</SettingLabel>
                                    <ToggleButtonGroup>
                                        <ToggleButton isActive={settings.textAlign === 'left'} onClick={() => updateSetting('textAlign', 'left')}>Esquerda</ToggleButton>
                                        <ToggleButton isActive={settings.textAlign === 'justify'} onClick={() => updateSetting('textAlign', 'justify')}>Justificado</ToggleButton>
                                    </ToggleButtonGroup>
                                </SettingRow>
                            </SettingsPanel>
                        )}
                    </div>
                    <ReaderIconBtn onClick={onClose} title="Fechar (Esc)">
                        <i className="fas fa-times" />
                    </ReaderIconBtn>
                </ReaderControls>
            </ReaderHeader>

            <ReaderBody ref={readerBodyRef} theme={settings.theme}>
                {loadingChapters ? <Spinner /> : !currentChapter ? (
                    <p>Nenhum capítulo encontrado.</p>
                ) : (
                    <ChapterContent {...settings}>
                        <ChapterTitle>{currentChapter.title}</ChapterTitle>
                        {currentChapter.content}
                    </ChapterContent>
                )}
                 <ScrollToTopButton visible={showScrollTop} onClick={scrollToTop} title="Voltar ao Topo">
                    <i className="fas fa-arrow-up"></i>
                </ScrollToTopButton>
            </ReaderBody>

            <ReaderFooter>
                <NavButton onClick={goToPrevChapter} disabled={currentChapterIndex === 0}>
                    <i className="fas fa-arrow-left"></i> Anterior
                </NavButton>
                <NavButton onClick={goToNextChapter} disabled={currentChapterIndex >= chapters.length - 1}>
                    Próximo <i className="fas fa-arrow-right"></i>
                </NavButton>
            </ReaderFooter>
        </ReaderOverlay>
    );
};

const LightNovel = () => {
    const [novelList, setNovelList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReaderOpen, setReaderOpen] = useState(false);
    const [selectedNovel, setSelectedNovel] = useState(null);

    useEffect(() => {
        const novelsRef = collection(db, 'lightnovels');
        const q = query(novelsRef, orderBy('title'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNovelList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
                <MainContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 80px)' }}>
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