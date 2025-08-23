// src/components/Browse/Hero.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { episodeFiles } from '../../api/animes';

// --- ANIMATIONS ---
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// --- STYLED COMPONENTS ---

const HeroContainer = styled.section`
  height: 90vh;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 4rem;
  color: white;
  background-size: cover;
  background-position: center;
  background-image: url(${props => props.$bgImage});
  transition: background-image 1s ease-in-out;

  &::before, &::after {
    content: '';
    position: absolute;
    left: 0;
    z-index: 1;
  }

  // Gradiente lateral para legibilidade do texto
  &::before {
    top: 0;
    width: 60%;
    height: 100%;
    background: linear-gradient(to right, rgba(20, 20, 20, 1) 0%, rgba(20, 20, 20, 0) 100%);
  }
  
  // Gradiente inferior para suavizar a transição com o resto da página
  &::after {
    bottom: 0;
    width: 100%;
    height: 10rem;
    background: linear-gradient(to top, rgba(20, 20, 20, 1) 20%, transparent 100%);
  }
`;

const HeroContent = styled.div`
  max-width: 45%;
  z-index: 2;
  position: relative;
  animation: ${fadeIn} 0.8s ease-out forwards;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9);
  margin-bottom: 1.5rem;
`;

const HeroDescription = styled.p`
  font-size: 1.2rem;
  line-height: 1.5;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeroButtons = styled.div`
  margin-top: 2.5rem;
  display: flex;
  gap: 1rem;
`;

const BaseButton = styled(Link)`
  padding: 0.8rem 2.2rem;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  transition: all 0.2s ease-in-out;

  i {
    font-size: 1.1rem;
  }
`;

const PlayButton = styled(BaseButton)`
  background-color: white;
  color: black;

  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
    transform: scale(1.05);
  }
`;

const InfoButton = styled(BaseButton)`
  background-color: rgba(109, 109, 110, 0.7);
  color: white;

  &:hover {
    background-color: rgba(109, 109, 110, 0.5);
    transform: scale(1.05);
  }
`;

const CarouselNav = styled.div`
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 2;
`;

const NavDots = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const NavDot = styled.button`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background-color: ${props => (props.$isActive ? 'white' : 'transparent')};
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.2);
    border-color: white;
  }
`;

const ProgressCircle = styled.svg`
  width: 40px;
  height: 40px;
  transform: rotate(-90deg);
`;

const Circle = styled.circle`
  fill: none;
  stroke-width: 3;
`;

const CircleBg = styled(Circle)`
  stroke: rgba(255, 255, 255, 0.3);
`;

const CircleProgress = styled(Circle)`
  stroke: white;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.1s linear;
`;


// --- REACT COMPONENT ---

const SLIDE_DURATION_MS = 7000; // Duração de cada slide em milissegundos
const PROGRESS_UPDATE_INTERVAL_MS = 50; // Intervalo de atualização da barra de progresso

/**
 * Componente Hero que exibe um carrossel de animes em destaque.
 * @param {{ heroAnimes: Array<Object> }} props - Props do componente.
 * @param {Array<Object>} props.heroAnimes - Lista de animes para exibir no carrossel.
 */
const Hero = ({ heroAnimes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const slideIntervalRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Usamos useCallback para memoizar a função e evitar recriações desnecessárias
  const startTimer = useCallback(() => {
    // Limpa timers anteriores para evitar múltiplos intervalos rodando
    clearInterval(slideIntervalRef.current);
    clearInterval(progressIntervalRef.current);
    setProgress(0);

    // Inicia o timer principal para trocar de slide
    slideIntervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % heroAnimes.length);
    }, SLIDE_DURATION_MS);

    // Inicia o timer para atualizar a animação de progresso
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const newProgress = Math.min((elapsedTime / SLIDE_DURATION_MS) * 100, 100);
      setProgress(newProgress);
    }, PROGRESS_UPDATE_INTERVAL_MS);
  }, [heroAnimes.length]);

  // Efeito que reinicia o timer sempre que o slide atual (currentIndex) ou a lista de animes mudar
  useEffect(() => {
    if (heroAnimes && heroAnimes.length > 0) {
      startTimer();
    }
    // Função de limpeza: interrompe os timers quando o componente for desmontado ou o efeito for re-executado
    return () => {
      clearInterval(slideIntervalRef.current);
      clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, heroAnimes, startTimer]);

  const handleDotClick = (index) => {
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  if (!heroAnimes || heroAnimes.length === 0) {
    return null; // Renderiza nada se não houver animes para exibir
  }

  const currentAnime = heroAnimes[currentIndex];

  // Lógica para gerar a URL de "Assistir"
  const animeId = currentAnime.nome.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-');
  const jsonFilename = episodeFiles[animeId];
  let watchUrl = '/browse'; // URL de fallback
  if (jsonFilename) {
    const fullJsonUrl = `https://a-certain-digital-database.netlify.app/src/json/${jsonFilename}`;
    // A codificação em Base64 pode ser uma forma de ofuscar a URL ou passar parâmetros complexos.
    const encodedUrl = btoa(fullJsonUrl); 
    watchUrl = `/watch/${animeId}/${encodedUrl}`;
  }

  // Cálculos para o círculo de progresso
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <HeroContainer $bgImage={currentAnime.FundoImagem}>
      <HeroContent key={currentIndex}> 
        <HeroTitle>{currentAnime.nome}</HeroTitle>
        <HeroDescription>{currentAnime.sinopse || 'Sinopse não disponível.'}</HeroDescription>
        <HeroButtons>
          <PlayButton to={watchUrl}>
            <i className="fas fa-play"></i> Assistir
          </PlayButton>
          <InfoButton to={`/details/${animeId}`}>
            <i className="fas fa-info-circle"></i> Mais Infos
          </InfoButton>
        </HeroButtons>
      </HeroContent>

      <CarouselNav>
        <NavDots>
          {heroAnimes.map((_, index) => (
            <NavDot 
              key={index} 
              $isActive={index === currentIndex} 
              onClick={() => handleDotClick(index)}
              aria-label={`Ir para o slide ${index + 1}`}
            />
          ))}
        </NavDots>
        <ProgressCircle>
          <CircleBg cx="20" cy="20" r={radius} />
          <CircleProgress
            cx="20"
            cy="20"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </ProgressCircle>
      </CarouselNav>
    </HeroContainer>
  );
};

export default Hero;