// --- IMPORTS ---
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Hls from 'hls.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft, FaPlay, FaPause, FaVolumeUp, FaVolumeDown, FaVolumeMute,
  FaExpand, FaListUl, FaStepBackward, FaStepForward, FaUndo, FaRedo
} from 'react-icons/fa';
import Spinner from '../components/shared/Spinner';
import { fetchEpisodeListFromUrl } from '../api/animes';

// --- TEMA E ANIMAÇÕES ---
const theme = {
  colors: {
    primary: '#8a2be2',
    primaryGlow: 'rgba(138, 43, 226, 0.7)',
    text: '#ffffff',
    textSecondary: '#cccccc',
    background: 'rgba(10, 10, 10, 0.9)',
    progressBg: 'rgba(255, 255, 255, 0.3)',
  },
  transitions: {
    fast: 'all 0.2s ease-in-out',
    default: 'all 0.3s ease-in-out',
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const centerButtonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};


// --- COMPONENTES ESTILIZADOS (CSS-in-JS) ---

const PlayerPageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  color: ${theme.colors.text};
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  cursor: ${props => (props.$isUiVisible ? 'default' : 'none')};
`;

const PlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const Overlay = styled(motion.div)`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 10;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.85) 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: ${props => (props.$isUiVisible ? 'auto' : 'none')};
`;

const TopControls = styled.div`
  padding: 2rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.2rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
  transition: ${theme.transitions.fast};
  
  svg {
    font-size: 2.2rem;
  }

  &:hover {
    transform: scale(1.1);
  }
`;

const EpisodeInfo = styled.div`
  color: ${theme.colors.text};
  text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
  text-align: right;
  max-width: 50%;
  
  h1 {
    font-size: 1.8rem;
    margin: 0;
    font-weight: 700;
  }
  p {
    font-size: 1.1rem;
    color: ${theme.colors.textSecondary};
    margin-top: 0.5rem;
  }
`;

const BottomControls = styled.div`
  padding: 1.5rem 3rem 2rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 5px;
  background-color: ${theme.colors.progressBg};
  cursor: pointer;
  border-radius: 10px;
  margin-bottom: 0.8rem;
  position: relative;
  transition: height 0.2s ease;

  &:hover {
    height: 8px;
  }
`;

const ProgressBar = styled.div.attrs(props => ({
  style: {
    width: `${props.$progress}%`,
  }
}))`
  height: 100%;
  background-color: ${theme.colors.primary};
  border-radius: 10px;
  box-shadow: 0 0 10px ${theme.colors.primaryGlow}, 0 0 5px ${theme.colors.primaryGlow};
`;

const MainControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text};
  font-size: 1.6rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: ${theme.transitions.fast};
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);

  &:hover {
    transform: scale(1.2);
    color: ${theme.colors.primary};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    color: ${theme.colors.text};
  }
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  
  &:hover > input[type='range'] {
    width: 100px;
    opacity: 1;
  }
`;

const VolumeSlider = styled.input.attrs({ type: 'range' })`
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  width: 0;
  opacity: 0;
  height: 5px;
  background: ${theme.colors.progressBg};
  border-radius: 10px;
  outline: none;
  transition: all 0.4s ease;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    background: ${theme.colors.text};
    border-radius: 50%;
    cursor: pointer;
  }
`;

const TimeDisplay = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
`;

const CenterPlayButton = styled(motion.button)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid ${theme.colors.text};
  color: ${theme.colors.text};
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  cursor: pointer;
  z-index: 15;
  backdrop-filter: blur(5px);
  padding-left: 5px;
  transition: ${theme.transitions.default};
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    background: rgba(0, 0, 0, 0.7);
  }
`;

const NextEpisodeButton = styled(motion.button)`
    position: absolute;
    bottom: 8rem;
    right: 3rem;
    z-index: 15;
    background: rgba(30, 30, 30, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: ${theme.colors.text};
    font-size: 1.1rem;
    padding: 0.8rem 1.5rem;
    border-radius: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    
    &:hover {
      background: rgba(40, 40, 40, 1);
    }
`;

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

const SidebarTitle = styled.h2`
    font-size: 1.6rem; 
    margin-bottom: 1rem; 
    color: white; 
    border-bottom: 1px solid #444; 
    padding-bottom: 1rem;
`;

const EpisodeList = styled.div`
    overflow-y: auto; 
    flex-grow: 1;
`;

const SidebarEpisodeItem = styled.button`
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    text-align: left;
    background: ${props => (props.$isActive ? theme.colors.primary : 'transparent')};
    color: ${props => (props.$isActive ? 'white' : theme.colors.textSecondary)};
    border: none;
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    font-size: 1rem;
    transition: ${theme.transitions.fast};

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
    }
`;

const ErrorMessage = styled.div`
    display: flex; 
    flex-direction: column; 
    justify-content: center; 
    align-items: center; 
    height: 100%; 
    h1 {
        color: #e50914; 
        font-size: 2rem;
    } 
    p {
        font-size: 1.2rem;
    }
`;

const BufferingSpinner = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 25;
`;

// --- COMPONENTE PRINCIPAL: PLAYER ---

const Player = () => {
  const { encodedUrl } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // --- State & Refs ---
  const [episodeData, setEpisodeData] = useState(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [lastVolume, setLastVolume] = useState(1);
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [isEpisodeListVisible, setIsEpisodeListVisible] = useState(false);
  const [showNextEpisodeButton, setShowNextEpisodeButton] = useState(false);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const uiTimeoutRef = useRef(null);
  const hlsRef = useRef(null);
  
  // --- Handlers e Lógica ---

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
  }, []);

  const goToNextEpisode = useCallback(() => {
    if (episodeData && currentEpisodeIndex < episodeData.episodios.length - 1) {
        setCurrentEpisodeIndex(prev => prev + 1);
        setShowNextEpisodeButton(false);
    }
  }, [episodeData, currentEpisodeIndex]);

  const hideUiWithDelay = useCallback(() => {
    clearTimeout(uiTimeoutRef.current);
    uiTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isEpisodeListVisible) {
        setIsUiVisible(false);
      }
    }, 3000);
  }, [isPlaying, isEpisodeListVisible]);

  const handleMouseMove = useCallback(() => {
    setIsUiVisible(true);
    hideUiWithDelay();
  }, [hideUiWithDelay]);
  
  const handleWrapperClick = () => {
    if (isEpisodeListVisible) {
        setIsEpisodeListVisible(false);
        return;
    }
    togglePlay();
  };
  
  const stopPropagation = (e) => e.stopPropagation();

  const handleKeyDown = useCallback((e) => {
    if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;

    if (e.code === 'Escape' && isEpisodeListVisible) {
        e.preventDefault();
        setIsEpisodeListVisible(false);
        return;
    }
    
    const video = videoRef.current;
    if (!video) return;

    const keyMap = {
        'Space': () => togglePlay(),
        'ArrowRight': () => video.currentTime += 10,
        'ArrowLeft': () => video.currentTime -= 10,
        'KeyF': () => {
            if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
            else document.exitFullscreen();
        },
        'KeyM': () => {
            if (video.volume > 0) {
                setLastVolume(video.volume);
                video.volume = 0;
            } else {
                video.volume = lastVolume;
            }
        },
        'ArrowUp': () => video.volume = Math.min(1, video.volume + 0.1),
        'ArrowDown': () => video.volume = Math.max(0, video.volume - 0.1),
    };

    if (keyMap[e.code]) {
        e.preventDefault();
        keyMap[e.code]();
    }
}, [isEpisodeListVisible, togglePlay, lastVolume]);


  // --- Effects ---

  useEffect(() => {
    const loadInitialData = async () => {
      // ... Lógica de fetch ...
        if (!encodedUrl) { setError("URL do episódio não fornecida."); setLoading(false); return; }
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
        if (hlsRef.current) hlsRef.current.destroy();
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(e => console.error("Autoplay bloqueado:", e));
        });
    } else {
        video.src = source;
        video.play().catch(e => console.error("Autoplay bloqueado:", e));
    }

    return () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
        }
    };
  }, [currentEpisodeIndex, episodeData]);

  useEffect(() => {
    if (isUiVisible) {
      hideUiWithDelay();
    }
    return () => clearTimeout(uiTimeoutRef.current);
  }, [isUiVisible, hideUiWithDelay]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const NEXT_EPISODE_THRESHOLD_S = 20;
    if (duration > 0 && currentTime > duration - NEXT_EPISODE_THRESHOLD_S) {
        if (episodeData && currentEpisodeIndex < episodeData.episodios.length - 1) {
            setShowNextEpisodeButton(true);
        }
    } else {
        setShowNextEpisodeButton(false);
    }
  }, [currentTime, duration, currentEpisodeIndex, episodeData]);

  // --- Funções Auxiliares ---
  
  const handleSeekbarClick = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newTime = ((e.clientX - rect.left) / rect.width) * duration;
    videoRef.current.currentTime = newTime;
  };
  
  const goToPreviousEpisode = () => {
    if (currentEpisodeIndex > 0) setCurrentEpisodeIndex(prev => prev - 1);
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <FaVolumeMute />;
    if (volume < 0.5) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  // --- RENDERIZAÇÃO ---
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage><h1>Erro ao Carregar</h1><p>{error}</p></ErrorMessage>;
  const currentEpisode = episodeData?.episodios[currentEpisodeIndex];
  if (!currentEpisode) return <ErrorMessage><h1>Erro</h1><p>Dados do episódio não encontrados.</p></ErrorMessage>;

  return (
    <PlayerPageContainer ref={containerRef} onMouseMove={handleMouseMove} $isUiVisible={isUiVisible}>
      <PlayerWrapper onClick={handleWrapperClick}>
        <VideoElement
            ref={videoRef}
            key={currentEpisode.link_video}
            playsInline
            onPlay={() => { setIsPlaying(true); setIsBuffering(false); }}
            onPause={() => setIsPlaying(false)}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onTimeUpdate={(e) => {
                setProgress((e.target.currentTime / e.target.duration) * 100 || 0);
                setCurrentTime(e.target.currentTime);
            }}
            onLoadedMetadata={(e) => setDuration(e.target.duration)}
            onEnded={goToNextEpisode}
            onVolumeChange={(e) => setVolume(e.target.volume)}
        />
      </PlayerWrapper>
      
      <AnimatePresence>
        {isBuffering && !loading && (
          <BufferingSpinner>
            <Spinner size="50px" />
          </BufferingSpinner>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isUiVisible && !isPlaying && !isBuffering && (
          <CenterPlayButton 
            variants={centerButtonVariants}
            initial="hidden" animate="visible" exit="hidden"
            onClick={(e) => { stopPropagation(e); togglePlay(); }}>
            <FaPlay />
          </CenterPlayButton>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showNextEpisodeButton && (
          <NextEpisodeButton
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={(e) => { stopPropagation(e); goToNextEpisode(); }}
          >
            <span>Próximo Episódio</span>
            <FaStepForward />
          </NextEpisodeButton>
        )}
      </AnimatePresence>

      <Overlay 
        $isUiVisible={isUiVisible} 
        variants={overlayVariants} 
        initial={false} 
        animate={isUiVisible ? "visible" : "hidden"}
      >
        <TopControls>
          <BackButton onClick={(e) => { stopPropagation(e); navigate(-1); }}>
            <FaArrowLeft />
            <span>Voltar</span>
          </BackButton>
          <EpisodeInfo>
            <h1>{`Ep ${currentEpisode.episodio}: ${currentEpisode.titulo}`}</h1>
            <p>{episodeData.titulo}</p>
          </EpisodeInfo>
        </TopControls>
        
        <BottomControls onClick={stopPropagation}>
          <ProgressBarContainer onClick={handleSeekbarClick}>
            <ProgressBar $progress={progress} />
          </ProgressBarContainer>
          <MainControls>
            <ControlGroup>
              <ControlButton onClick={togglePlay} title={isPlaying ? "Pausar (Espaço)" : "Tocar (Espaço)"}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </ControlButton>
              <ControlButton onClick={() => videoRef.current.currentTime -= 10} title="Voltar 10s"><FaUndo /></ControlButton>
              <ControlButton onClick={() => videoRef.current.currentTime += 10} title="Avançar 10s"><FaRedo /></ControlButton>
            </ControlGroup>
            
            <ControlGroup>
              <ControlButton onClick={goToPreviousEpisode} disabled={currentEpisodeIndex === 0} title="Episódio Anterior"><FaStepBackward /></ControlButton>
              <ControlButton onClick={goToNextEpisode} disabled={!episodeData || currentEpisodeIndex >= episodeData.episodios.length - 1} title="Próximo Episódio"><FaStepForward /></ControlButton>
            </ControlGroup>

            <ControlGroup>
              <VolumeContainer>
                <ControlButton onClick={() => {
                  if (videoRef.current.volume > 0) {
                      setLastVolume(videoRef.current.volume);
                      videoRef.current.volume = 0;
                  } else {
                      videoRef.current.volume = lastVolume;
                  }
                }} title="Mutar (M)">{getVolumeIcon()}</ControlButton>
                <VolumeSlider value={volume} min="0" max="1" step="0.01" onChange={(e) => videoRef.current.volume = parseFloat(e.target.value)} />
              </VolumeContainer>
              <TimeDisplay>{formatTime(currentTime)} / {formatTime(duration)}</TimeDisplay>
              <ControlButton onClick={() => setIsEpisodeListVisible(p => !p)} title="Lista de Episódios"><FaListUl /></ControlButton>
              <ControlButton onClick={() => {
                  if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
                  else document.exitFullscreen();
              }} title="Tela Cheia (F)"><FaExpand /></ControlButton>
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
              onClick={() => {
                  setCurrentEpisodeIndex(index);
                  setIsEpisodeListVisible(false);
              }}
            >
              <span>Ep {ep.episodio}: {ep.titulo}</span>
            </SidebarEpisodeItem>
          ))}
        </EpisodeList>
      </EpisodeSidebar>
    </PlayerPageContainer>
  );
};

export default Player;