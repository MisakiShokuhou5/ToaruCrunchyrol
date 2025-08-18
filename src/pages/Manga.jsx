// ----------------------------------------------------------------
// ARQUIVO FINAL: src/pages/Manga.jsx
// Leitor de mangá robusto com múltiplos modos, zoom, pan e UI refinada.
//
// Melhorias Chave:
// - Zoom e Pan (Arrastar): Ao dar zoom, clique e arraste para mover a imagem.
// - Modos de Leitura: Página Única, Dupla e Vertical (Webtoon).
// - UI Inteligente: Interface se adapta ao contexto (zoom, modo, etc.).
// - Otimização: Uso de useCallback para performance.
// - Qualidade de Código: Componentes e lógica bem organizados e comentados.
// ----------------------------------------------------------------
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { css } from 'styled-components';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Header from '../components/Header';
import Spinner from '../components/shared/Spinner';

// --- Styled Components (Componentes de Estilo) ---

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

const ReaderBody = styled.div`
    flex-grow: 1;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden; // Essencial para o pan/zoom funcionar dentro dos limites
`;

const NavButton = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    ${props => props.position === 'left' ? 'left: 20px;' : 'right: 20px;'}
    background-color: rgba(30, 30, 30, 0.6);
    border: 1px solid #555;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    transition: all 0.2s;
    opacity: ${props => props.isInteracting ? 0 : 1}; // Desaparece durante o pan

    &:hover:not(:disabled) {
        background-color: #8a2be2;
        border-color: #8a2be2;
    }

    &:disabled {
        opacity: 0.2;
        cursor: not-allowed;
    }
`;

const PageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    transition: transform 0.3s ease, opacity 0.3s ease;
    cursor: ${props => props.isZoomed ? 'grab' : 'default'};
    cursor: ${props => props.isPanning ? 'grabbing' : (props.isZoomed ? 'grab' : 'default')};
    transform: ${props => `translate(${props.pan.x}px, ${props.pan.y}px) scale(${props.zoom})`};
`;

const PageImage = styled.img`
    max-width: ${props => props.isDoublePage ? 'calc(50vw - 2rem)' : 'calc(95vw - 2rem)'};
    max-height: calc(95vh - 80px); // 95% da altura da viewport menos cabeçalho/rodapé
    object-fit: contain;
    background-color: #111;
    box-shadow: 0 0 15px rgba(0,0,0,0.5);
    -webkit-user-drag: none; // Impede o arrasto fantasma da imagem
`;

const VerticalPageContainer = styled.div`
    height: 100%;
    width: 100%;
    overflow-y: auto;
    text-align: center;
    padding-top: 1rem;
`;

const VerticalPageImage = styled.img`
    max-width: 90%;
    width: auto;
    height: auto;
    margin: 0 auto 8px auto;
    display: block;
    -webkit-user-drag: none;
`;

const ReaderFooter = styled.footer`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.8rem;
    background-color: #1a1a1a;
    flex-shrink: 0;
    z-index: 20;
`;

const PageIndicator = styled.span`
    font-size: 1rem;
    font-weight: 500;
`;

// --- Leitor de Mangá Aprimorado ---
const MangaReader = ({ manga, onClose }) => {
    // Estado do conteúdo
    const [pages, setPages] = useState([]);
    const [loadingPages, setLoadingPages] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    // Estado da interface e interação
    const [viewMode, setViewMode] = useState('single'); // 'single', 'double', 'vertical'
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Estado do Zoom e Pan
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0 });

    // Referência ao container para cálculos
    const readerBodyRef = useRef(null);

    // --- CARREGAMENTO DE DADOS ---
    useEffect(() => {
        const pagesCollectionRef = collection(db, 'mangas', manga.id, 'pages');
        const q = query(pagesCollectionRef, orderBy('pageNumber'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const pagesData = snapshot.docs.map(doc => doc.data());
            setPages(pagesData);
            setLoadingPages(false);
            setCurrentPage(0);
        });
        return () => unsubscribe();
    }, [manga.id]);

    // Pré-carregamento de imagens
    useEffect(() => {
        if (pages.length === 0 || viewMode === 'vertical') return;
        const indicesToPreload = viewMode === 'single' ? [currentPage + 1] : [currentPage + 2, currentPage + 3];
        indicesToPreload.forEach(index => {
            if (index < pages.length) new Image().src = pages[index].imageUrl;
        });
    }, [currentPage, pages, viewMode]);
    
    // --- FUNÇÕES DE CONTROLE ---
    const resetZoomAndPan = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    const pageIncrement = viewMode === 'double' && currentPage > 0 ? 2 : 1;

    const goToNextPage = useCallback(() => {
        if (currentPage + pageIncrement < pages.length) {
            setCurrentPage(prev => prev + pageIncrement);
            resetZoomAndPan();
        }
    }, [currentPage, pageIncrement, pages.length, resetZoomAndPan]);

    const goToPrevPage = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage(prev => Math.max(0, prev - pageIncrement));
            resetZoomAndPan();
        }
    }, [currentPage, pageIncrement, resetZoomAndPan]);

    const toggleViewMode = useCallback(() => {
        const modes = ['single', 'double', 'vertical'];
        const nextMode = modes[(modes.indexOf(viewMode) + 1) % modes.length];
        setViewMode(nextMode);
        resetZoomAndPan();
    }, [viewMode, resetZoomAndPan]);

    const handleZoom = useCallback((factor) => {
        setZoom(prev => {
            const newZoom = Math.max(1, Math.min(prev * factor, 5)); // Zoom mínimo 1x, máximo 5x
            if (newZoom === 1) resetZoomAndPan();
            return newZoom;
        });
    }, [resetZoomAndPan]);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    // --- LÓGICA DE PAN (ARRASTAR) ---
    const onPanStart = useCallback((e) => {
        if (zoom <= 1 || viewMode === 'vertical') return;
        e.preventDefault();
        setIsPanning(true);
        panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }, [zoom, pan, viewMode]);

    const onPanMove = useCallback((e) => {
        if (!isPanning) return;
        e.preventDefault();
        const newX = e.clientX - panStart.current.x;
        const newY = e.clientY - panStart.current.y;
        setPan({ x: newX, y: newY });
    }, [isPanning]);

    const onPanEnd = useCallback(() => {
        setIsPanning(false);
    }, []);

    // --- ATALHOS DE TECLADO E EVENTOS GLOBAIS ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (viewMode !== 'vertical') {
                if (e.key === 'ArrowRight') goToNextPage();
                if (e.key === 'ArrowLeft') goToPrevPage();
            }
            if (e.key === 'm' || e.key === 'M') toggleViewMode();
            if (e.key === 'f' || e.key === 'F') toggleFullscreen();
        };
        const handleWheel = (e) => {
            if (e.ctrlKey) { // Zoom com Ctrl + Roda do Mouse
                e.preventDefault();
                handleZoom(e.deltaY > 0 ? 0.9 : 1.1);
            }
        };

        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('wheel', handleWheel);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [onClose, goToNextPage, goToPrevPage, toggleViewMode, toggleFullscreen, handleZoom, viewMode]);

    // --- RENDERIZAÇÃO ---

    const renderPageIndicator = () => {
        const total = pages.length;
        if (viewMode === 'double' && currentPage > 0 && currentPage + 1 < total) {
            return `Páginas ${currentPage + 1}-${currentPage + 2} / ${total}`;
        }
        return `Página ${currentPage + 1} / ${total}`;
    };

    const getModeIcon = () => {
        if (viewMode === 'single') return { icon: 'fas fa-book-open', title: 'Modo Duplo (M)' };
        if (viewMode === 'double') return { icon: 'fas fa-stream', title: 'Modo Vertical (M)' };
        return { icon: 'fas fa-file', title: 'Modo Página Única (M)' };
    };

    const isDoubleView = viewMode === 'double' && currentPage > 0 && pages.length > 1;

    return (
        <ReaderOverlay onMouseMove={onPanMove} onMouseUp={onPanEnd} onMouseLeave={onPanEnd}>
            <ReaderHeader>
                <ReaderTitle>{manga.title}</ReaderTitle>
                <ReaderControls>
                    {viewMode !== 'vertical' && (
                       <>
                         <ReaderIconBtn className="fas fa-search-plus" onClick={() => handleZoom(1.25)} title="Aumentar Zoom (Ctrl+Scroll)" />
                         <ReaderIconBtn className="fas fa-search-minus" onClick={() => handleZoom(0.8)} title="Diminuir Zoom (Ctrl+Scroll)" />
                       </>
                    )}
                    <ReaderIconBtn className={getModeIcon().icon} onClick={toggleViewMode} title={getModeIcon().title} />
                    <ReaderIconBtn className={isFullscreen ? "fas fa-compress" : "fas fa-expand"} onClick={toggleFullscreen} title="Tela Cheia (F)" />
                    <ReaderIconBtn className="fas fa-times" onClick={onClose} title="Fechar (Esc)" />
                </ReaderControls>
            </ReaderHeader>

            <ReaderBody ref={readerBodyRef}>
                {loadingPages ? <Spinner /> : pages.length === 0 ? (
                    <PageIndicator>Nenhuma página encontrada.</PageIndicator>
                ) : viewMode === 'vertical' ? (
                    <VerticalPageContainer>
                        {pages.map(page => (
                            <VerticalPageImage key={page.pageNumber} src={page.imageUrl} alt={`Página ${page.pageNumber}`} />
                        ))}
                    </VerticalPageContainer>
                ) : (
                    <>
                        <NavButton onClick={goToPrevPage} disabled={currentPage === 0} position="left" isInteracting={isPanning}>
                            <i className="fas fa-chevron-left"></i>
                        </NavButton>

                        <PageContainer
                            onMouseDown={onPanStart}
                            zoom={zoom}
                            pan={pan}
                            isZoomed={zoom > 1}
                            isPanning={isPanning}
                        >
                            {isDoubleView ? (
                                <>
                                    <PageImage key={pages[currentPage+1].pageNumber} src={pages[currentPage+1].imageUrl} alt={`Página ${currentPage + 2}`} isDoublePage />
                                    <PageImage key={pages[currentPage].pageNumber} src={pages[currentPage].imageUrl} alt={`Página ${currentPage + 1}`} isDoublePage />
                                </>
                            ) : (
                                <PageImage key={pages[currentPage].pageNumber} src={pages[currentPage].imageUrl} alt={`Página ${currentPage + 1}`} />
                            )}
                        </PageContainer>
                        
                        <NavButton onClick={goToNextPage} disabled={currentPage + pageIncrement >= pages.length} position="right" isInteracting={isPanning}>
                            <i className="fas fa-chevron-right"></i>
                        </NavButton>
                    </>
                )}
            </ReaderBody>

            <ReaderFooter>
                {pages.length > 0 && !loadingPages && viewMode !== 'vertical' && (
                    <PageIndicator>{renderPageIndicator()}</PageIndicator>
                )}
            </ReaderFooter>
        </ReaderOverlay>
    );
};


// --- Página Principal de Mangás (sem alterações) ---
const Manga = () => {
    const [mangaList, setMangaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReaderOpen, setReaderOpen] = useState(false);
    const [selectedManga, setSelectedManga] = useState(null);

    useEffect(() => {
        const mangasCollectionRef = collection(db, 'mangas');
        const q = query(mangasCollectionRef, orderBy('title'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const mangasData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMangaList(mangasData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        document.body.style.overflow = isReaderOpen ? 'hidden' : 'auto';
    }, [isReaderOpen]);

    const openReader = (manga) => {
        setSelectedManga(manga);
        setReaderOpen(true);
    };

    const closeReader = () => {
        setReaderOpen(false);
        setSelectedManga(null);
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
                    {mangaList.map(manga => (
                        <SeriesCard key={manga.id} onClick={() => openReader(manga)}>
                            <SeriesCover src={manga.imageUrl || 'https://placehold.co/180x250/1e1e1e/fff?text=Capa'} alt={`Capa de ${manga.title}`} />
                            <SeriesTitle>{manga.title}</SeriesTitle>
                        </SeriesCard>
                    ))}
                </SeriesGrid>
            </MainContent>
            {isReaderOpen && <MangaReader manga={selectedManga} onClose={closeReader} />}
        </>
    );
};

export default Manga;