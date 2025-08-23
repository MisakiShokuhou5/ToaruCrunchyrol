// ARQUIVO: src/pages/LightNovel/LightNovelReader.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Spinner from '../../components/shared/Spinner';
import SettingsPanel from './SettingsPanel';
import { useReadingSettings } from './useReadingSettings';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import { 
    ReaderOverlay, ReaderHeader, ReaderTitle, ReaderControls, ChapterSelector, ReaderIconBtn,
    ReaderBody, ChapterContent, ChapterTitle, ReaderFooter, NavButton, GlobalReaderStyle,
    ScrollToTopButton
} from './styles';

const LightNovelReader = ({ lightNovel, onClose }) => {
    const [chapters, setChapters] = useState([]);
    const [loadingChapters, setLoadingChapters] = useState(true);
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const [settings, updateSetting] = useReadingSettings();
    const readerBodyRef = useRef(null);
    const settingsPanelRef = useRef(null);

    useOnClickOutside(settingsPanelRef, () => setSettingsOpen(false));

    // Carregamento dos capítulos
    useEffect(() => {
        const chaptersRef = collection(db, 'lightnovels', lightNovel.id, 'chapters');
        const q = query(chaptersRef, orderBy('chapterNumber'));
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

    // Lógica para mostrar/esconder o botão "Voltar ao Topo"
    useEffect(() => {
        const body = readerBodyRef.current;
        const handleScroll = () => {
            if (body) {
                setShowScrollTop(body.scrollTop > 400);
            }
        };
        body?.addEventListener('scroll', handleScroll);
        return () => body?.removeEventListener('scroll', handleScroll);
    }, [loadingChapters]);
    
    // Funções de navegação
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

    const scrollToTop = () => {
        readerBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Atalhos de teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
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
            <GlobalReaderStyle />
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
                        <ReaderIconBtn onClick={() => setSettingsOpen(!isSettingsOpen)} title="Configurações (S)">
                            <i className="fas fa-cog" />
                        </ReaderIconBtn>
                        {isSettingsOpen && <SettingsPanel settings={settings} updateSetting={updateSetting} />}
                    </div>
                    <ReaderIconBtn onClick={onClose} title="Fechar (Esc)">
                        <i className="fas fa-times" />
                    </ReaderIconBtn>
                </ReaderControls>
            </ReaderHeader>

            <ReaderBody ref={readerBodyRef} theme={settings.theme}>
                {loadingChapters ? <Spinner /> : !currentChapter ? (
                    <p>Nenhum capítulo encontrado para esta novel.</p>
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

export default LightNovelReader;