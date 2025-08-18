// ARQUIVO COMPLETO E CORRIGIDO: src/components/Browse/Hero.jsx

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { episodeFiles } from '../../api/animes';

// --- ESTILOS ATUALIZADOS ---

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

const HeroContainer = styled.div`
  height: 90vh;
  position: relative;
  display: flex;
  align-items: center;
  padding-left: 4rem;
  color: white;
  transition: background-image 1s ease-in-out;
  background-size: cover;
  background-position: center;
  background-image: url(${props => props.$bgImage});

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 60%;
    height: 100%;
    background: linear-gradient(to right, rgba(20, 20, 20, 1) 0%, rgba(20, 20, 20, 0) 100%);
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 10rem;
   background: linear-gradient(0deg,rgba(0, 0, 0, 1) 49%, rgba(0, 0, 0, 0) 91%);
    z-index: 1;
  }
`;

const HeroContent = styled.div`
  max-width: 45%;
  z-index: 2;
  position: relative;
  animation: ${fadeIn} 0.8s ease-out;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9);
  margin-bottom: 1.5rem;
`;

const HeroDescription = styled.p`
  font-size: 1.2rem;
  line-height: 1.5;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.9);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeroButtons = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
`;

const PlayButton = styled(Link)`
  padding: 0.8rem 2.2rem;
  background-color: white;
  color: black;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
  }
`;

const InfoButton = styled(Link)`
  padding: 0.8rem 2.2rem;
  background-color: rgba(109, 109, 110, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(109, 109, 110, 0.4);
  }
`;

const CarouselNav = styled.div`
  position: absolute;
  bottom: 5%;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 2;
 transform: translateX(-50%);
`;

const NavDots = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const NavDot = styled.button`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 1px solid white;
  background-color: ${props => (props.$isActive ? 'white' : 'transparent')};
  cursor: pointer;
  transition: background-color 0.3s;
`;

const ProgressCircle = styled.svg`
  width: 40px;
  height: 40px;
  transform: rotate(-90deg);
`;

const CircleBg = styled.circle`
  fill: none;
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 4;
`;

const CircleProgress = styled.circle`
  fill: none;
  stroke: white;
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.1s linear;
`;

// --- COMPONENTE COM LÓGICA E RENDERIZAÇÃO ---

const Hero = ({ heroAnimes }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const DURATION = 7000; // 7 segundos

    const startTimer = () => {
        clearInterval(intervalRef.current);
        clearInterval(progressIntervalRef.current);
        setProgress(0);

        intervalRef.current = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % heroAnimes.length);
        }, DURATION);

        let startTime = Date.now();
        progressIntervalRef.current = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const newProgress = Math.min((elapsedTime / DURATION) * 100, 100);
            setProgress(newProgress);
        }, 50);
    };

    useEffect(() => {
        if (heroAnimes && heroAnimes.length > 0) {
            startTimer();
        }
        return () => {
            clearInterval(intervalRef.current);
            clearInterval(progressIntervalRef.current);
        };
    }, [currentIndex, heroAnimes]);

    const handleDotClick = (index) => {
        setCurrentIndex(index);
    };

    if (!heroAnimes || heroAnimes.length === 0) return null;

    const currentAnime = heroAnimes[currentIndex];
    const animeId = currentAnime.nome.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-');
    const jsonFilename = episodeFiles[animeId];
    let watchUrl = '/browse'; 
    if (jsonFilename) {
        const fullJsonUrl = `https://a-certain-digital-database.netlify.app/src/json/${jsonFilename}`;
        const encodedUrl = btoa(fullJsonUrl); 
        watchUrl = `/watch/${animeId}/${encodedUrl}`;
    }

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