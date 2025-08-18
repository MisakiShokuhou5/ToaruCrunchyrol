// ----------------------------------------------------------------
// ARQUIVO ATUALIZADO: src/pages/Player.jsx
// Estilos refinados para uma aparência mais moderna e profissional.
// ----------------------------------------------------------------
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Hls from 'hls.js';
import Spinner from '../components/shared/Spinner';
import { fetchEpisodeListFromUrl } from '../api/animes';

// --- Styled Components Refinados ---

const PlayerPageContainer = styled.div`
     /* ALTERAÇÕES PRINCIPAIS AQUI */
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    /* Estilos existentes mantidos */
    background-color: black;
    color: white;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    overflow: hidden; /* Garante que nada vaze do container do player */
    cursor: ${props => (props.$isUiVisible ? 'default' : 'none')};
`;

const PlayerWrapper = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
`;

const VideoElement = styled.video`
    width: 100%;
    height: 100%;
    object-fit: contain;
`;

const Overlay = styled.div`
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 10;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.85) 100%);
    opacity: ${props => (props.$isUiVisible ? 1 : 0)};
    transition: opacity 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: ${props => (props.$isUiVisible ? 'auto' : 'none')};
`;

const TopControls = styled.div`
    padding: 2rem 4rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const BackButton = styled.button`
    font-size: 2.5rem;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
    transition: transform 0.2s;
    &:hover {
        transform: scale(1.1);
    }
`;

const EpisodeInfo = styled.div`
    color: white;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
    text-align: right;
    max-width: 50%;
    h1 {
        font-size: 2rem;
        margin: 0;
        font-weight: bold;
    }
    p {
        font-size: 1.2rem;
        color: #ccc;
        margin-top: 0.5rem;
    }
`;

const BottomControls = styled.div`
    padding: 1.5rem 4rem 2.5rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;

const ProgressBarContainer = styled.div`
    width: 100%;
    height: 6px;
    background-color: rgba(255, 255, 255, 0.25);
    cursor: pointer;
    border-radius: 10px;
    margin-bottom: 0.8rem;
    transition: height 0.2s ease;
    &:hover {
        height: 10px;
    }
`;

const ProgressBar = styled.div`
    width: ${props => props.$progress}%;
    height: 100%;
    background-color: #8a2be2; // Seu roxo tema
    border-radius: 10px;
    box-shadow: 0 0 10px #8a2be2, 0 0 5px #8a2be2;
`;

const MainControls = styled.div`display: flex; justify-content: space-between; align-items: center; width: 100%;`;
const ControlGroup = styled.div`display: flex; align-items: center; gap: 2rem;`;
const CenterControls = styled(ControlGroup)`flex-grow: 1; justify-content: center;`;

const ControlButton = styled.button`
    background: none;
    border: none;
    color: white;
    font-size: 1.8rem;
    cursor: pointer;
    transition: transform 0.2s ease, color 0.2s ease;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
    &:hover {
        transform: scale(1.15);
        color: #8a2be2;
    }
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
        color: white;
    }
`;

const VolumeContainer = styled.div`display: flex; align-items: center; gap: 0.8rem;`;

const VolumeSlider = styled.input.attrs({ type: 'range' })`
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    width: 100px;
    height: 6px;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 10px;
    outline: none;
    transition: opacity 0.2s;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
    }
    &::-moz-range-thumb {
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
    }
`;

const TimeDisplay = styled.div`color: #ccc; font-size: 1.1rem;`;
const ErrorMessage = styled.div`display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; h1 {color: #e50914; font-size: 2rem;} p {font-size: 1.2rem;}`;
const EpisodeSidebar = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    width: clamp(300px, 25vw, 400px);
    height: 100%;
    background-color: rgba(10, 10, 10, 0.9);
    z-index: 20;
    transform: translateX(${props => (props.$isOpen ? '0%' : '100%')});
    transition: transform 0.4s ease-in-out;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    backdrop-filter: blur(12px);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
`;
const SidebarTitle = styled.h2`font-size: 1.6rem; margin-bottom: 1rem; color: white; border-bottom: 1px solid #444; padding-bottom: 1rem;`;
const EpisodeList = styled.div`overflow-y: auto; flex-grow: 1;`;

const SidebarEpisodeItem = styled.button`
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    text-align: left;
    background: ${props => (props.$isActive ? '#8a2be2' : 'transparent')};
    color: ${props => (props.$isActive ? 'white' : '#ccc')};
    border: none;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
    }
`;

// O resto do seu componente (lógica funcional) permanece o mesmo
const Player = () => {
    // ... toda a sua lógica de state, refs, effects e handlers aqui ...
    const { encodedUrl } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // --- State & Refs ---
    const [episodeData, setEpisodeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
    const [isUiVisible, setIsUiVisible] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [lastVolume, setLastVolume] = useState(1);
    const [isEpisodeListVisible, setIsEpisodeListVisible] = useState(false);

    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const uiTimeoutRef = useRef(null);
    const hlsRef = useRef(null);

    // --- Effects ---
    useEffect(() => {
        const loadInitialData = async () => {
            if (!encodedUrl) {
                setError("URL do episódio não fornecida.");
                setLoading(false);
                return;
            }
            try {
                const decodedJsonUrl = atob(encodedUrl);
                const data = await fetchEpisodeListFromUrl(decodedJsonUrl);
                
                if (!data || !data.episodios || data.episodios.length === 0) {
                    setError("Nenhum episódio encontrado.");
                } else {
                    setEpisodeData(data);
                    const queryParams = new URLSearchParams(location.search);
                    const startEpisodeNumber = parseInt(queryParams.get('ep') || data.episodios[0].episodio, 10);
                    const startIndex = data.episodios.findIndex(ep => ep.episodio === startEpisodeNumber);
                    setCurrentEpisodeIndex(startIndex >= 0 ? startIndex : 0);
                }
            } catch (err) {
                console.error("Erro ao decodificar ou buscar dados:", err);
                setError("Não foi possível carregar os dados do episódio.");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [encodedUrl, location.search]);
    
    useEffect(() => {
        if (!episodeData || !videoRef.current) return;

        const video = videoRef.current;
        const source = episodeData.episodios[currentEpisodeIndex].link_video;

        if (Hls.isSupported() && source.includes('.m3u8')) {
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => console.error("Autoplay bloqueado:", e));
            });
        } else {
            video.src = source;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [currentEpisodeIndex, episodeData]);

    useEffect(() => {
        const resetUiTimeout = () => {
            clearTimeout(uiTimeoutRef.current);
            uiTimeoutRef.current = setTimeout(() => {
                if (isPlaying) setIsUiVisible(false);
            }, 3000);
        };
        
        if (isUiVisible) {
            resetUiTimeout();
        }

        return () => clearTimeout(uiTimeoutRef.current);
    }, [isUiVisible, isPlaying]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
            if (isEpisodeListVisible && e.code === 'Escape') {
                setIsEpisodeListVisible(false);
                return;
            }
            e.preventDefault();
            switch (e.code) {
                case 'Space': togglePlay(); break;
                case 'ArrowRight': seek(10); break;
                case 'ArrowLeft': seek(-10); break;
                case 'KeyF': toggleFullscreen(); break;
                case 'KeyM': toggleMute(); break;
                case 'ArrowUp': changeVolume(0.1); break;
                case 'ArrowDown': changeVolume(-0.1); break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEpisodeListVisible]);

    // --- Handlers ---
    const handleEpisodeSelect = (index) => {
        setCurrentEpisodeIndex(index);
        setIsEpisodeListVisible(false);
    };
    const toggleEpisodeList = (e) => {
        e.stopPropagation();
        setIsEpisodeListVisible(prev => !prev);
    };
    const handleMouseMove = () => setIsUiVisible(true);
    const togglePlay = () => videoRef.current?.paused ? videoRef.current.play() : videoRef.current.pause();
    const seek = (amount) => videoRef.current.currentTime += amount;
    const handleSeekbarClick = (e) => {
        if (!duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const newTime = ((e.clientX - rect.left) / rect.width) * duration;
        videoRef.current.currentTime = newTime;
    };
    const changeVolume = (amount) => {
        const newVolume = Math.max(0, Math.min(1, videoRef.current.volume + amount));
        videoRef.current.volume = newVolume;
    };
    const toggleMute = () => {
        if (videoRef.current.volume > 0) {
            setLastVolume(videoRef.current.volume);
            videoRef.current.volume = 0;
        } else {
            videoRef.current.volume = lastVolume;
        }
    };
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };
    const goToNextEpisode = () => {
        if (currentEpisodeIndex < episodeData.episodios.length - 1) {
            setCurrentEpisodeIndex(prev => prev + 1);
        }
    };
    const goToPreviousEpisode = () => {
        if (currentEpisodeIndex > 0) {
            setCurrentEpisodeIndex(prev => prev - 1);
        }
    };
    const formatTime = (time) => {
        if (isNaN(time) || time === 0) return '00:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // --- Render ---
    if (loading) return <Spinner />;
    if (error) return <ErrorMessage><h1>Erro ao Carregar</h1><p>{error}</p></ErrorMessage>;
    if (!episodeData || !episodeData.episodios[currentEpisodeIndex]) return <ErrorMessage><h1>Erro</h1><p>Dados do episódio não encontrados.</p></ErrorMessage>;

    const currentEpisode = episodeData.episodios[currentEpisodeIndex];
    const getVolumeIcon = () => {
        if (volume === 0) return 'fa-volume-xmark';
        if (volume < 0.5) return 'fa-volume-low';
        return 'fa-volume-high';
    };

    return (
        <PlayerPageContainer ref={containerRef} onMouseMove={handleMouseMove} $isUiVisible={isUiVisible}>
            <PlayerWrapper onClick={togglePlay}>
                <VideoElement
                    ref={videoRef}
                    key={currentEpisode.link_video}
                    autoPlay
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={(e) => {
                        setProgress((e.target.currentTime / e.target.duration) * 100);
                        setCurrentTime(e.target.currentTime);
                    }}
                    onLoadedMetadata={(e) => setDuration(e.target.duration)}
                    onEnded={goToNextEpisode}
                    onVolumeChange={(e) => setVolume(e.target.volume)}
                />
            </PlayerWrapper>
            <Overlay $isUiVisible={isUiVisible} onClick={(e) => { if(e.currentTarget === e.target) togglePlay(); }}>
                <TopControls>
                    <BackButton onClick={(e) => { e.stopPropagation(); navigate(-1); }}>&larr;</BackButton>
                    <EpisodeInfo>
                        <h1>{`Ep ${currentEpisode.episodio}: ${currentEpisode.titulo}`}</h1>
                        <p>{episodeData.titulo}</p>
                    </EpisodeInfo>
                </TopControls>
                <BottomControls onClick={(e) => e.stopPropagation()}>
                    <ProgressBarContainer onClick={handleSeekbarClick}>
                        <ProgressBar $progress={progress} />
                    </ProgressBarContainer>
                    <MainControls>
                        <ControlGroup>
                            <ControlButton onClick={togglePlay} title={isPlaying ? "Pausar (Espaço)" : "Tocar (Espaço)"}><i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i></ControlButton>
                            <VolumeContainer>
                                <ControlButton onClick={toggleMute} title="Mutar (M)"><i className={`fas ${getVolumeIcon()}`}></i></ControlButton>
                                <VolumeSlider value={volume} min="0" max="1" step="0.01" onChange={(e) => videoRef.current.volume = e.target.value} />
                            </VolumeContainer>
                        </ControlGroup>
                        <CenterControls>
                            <ControlButton onClick={goToPreviousEpisode} disabled={currentEpisodeIndex === 0} title="Episódio Anterior"><i className="fas fa-backward-step"></i></ControlButton>
                            <ControlButton onClick={goToNextEpisode} disabled={currentEpisodeIndex >= episodeData.episodios.length - 1} title="Próximo Episódio"><i className="fas fa-forward-step"></i></ControlButton>
                        </CenterControls>
                        <ControlGroup>
                            <TimeDisplay>{formatTime(currentTime)} / {formatTime(duration)}</TimeDisplay>
                            <ControlButton onClick={toggleEpisodeList} title="Lista de Episódios"><i className="fas fa-list-ul"></i></ControlButton>
                            <ControlButton onClick={toggleFullscreen} title="Tela Cheia (F)"><i className="fas fa-expand"></i></ControlButton>
                        </ControlGroup>
                    </MainControls>
                </BottomControls>
            </Overlay>
            <EpisodeSidebar $isOpen={isEpisodeListVisible}>
                <SidebarTitle>{episodeData.titulo}</SidebarTitle>
                <EpisodeList>
                    {episodeData.episodios.map((ep, index) => (
                        <SidebarEpisodeItem
                            key={ep.episodio}
                            $isActive={index === currentEpisodeIndex}
                            onClick={() => handleEpisodeSelect(index)}
                        >
                            <i className={`fas ${index === currentEpisodeIndex ? 'fa-circle-play' : 'fa-play'}`}></i>
                            <span>Ep {ep.episodio}: {ep.titulo}</span>
                        </SidebarEpisodeItem>
                    ))}
                </EpisodeList>
            </EpisodeSidebar>
        </PlayerPageContainer>
    );
};

export default Player;