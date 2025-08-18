// ARQUIVO: src/pages/NotFoundPage.jsx
// DESCRIÇÃO: Página de erro 404 com o mesmo estilo e layout da página ImaginaryFest.
// -------------------------------------------------------------------------------
import React from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// --- Animações ---
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// --- Componentes Estilizados ---

const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #141414;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeroSection = styled.section`
  flex-grow: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end; /* Alinha o conteúdo na parte inferior */
  text-align: center;
`;

// Fundo como tag <img> para ser idêntico ao ImaginaryFest
const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
  z-index: 1;
`;

const GradientOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, #141414 10%, rgba(20, 20, 20, 0) 60%),
              radial-gradient(ellipse at center, rgba(20, 20, 20, 0) 0%, #141414 100%);
  z-index: 2;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 3;
  padding: 2rem;
  padding-bottom: 8vh; /* Espaçamento da parte inferior da tela */
  max-width: 700px;
  animation: ${fadeInUp} 1s ease-out forwards;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: 900;
  margin: 0;
  line-height: 1;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0px 0px 15px rgba(0, 0, 0, 0.8);

  @media (max-width: 768px) {
    font-size: 6rem;
  }
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  text-shadow: 0px 0px 15px rgba(0, 0, 0, 0.8);
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Message = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  color: #d1d1d1;
  margin-bottom: 2.5rem;
  text-shadow: 0px 0px 10px rgba(0, 0, 0, 0.7);

  strong {
    color: #fff;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const HomeButton = styled(Link)`
  display: inline-block;
  background-color: #e50914;
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 12px 30px;
  border-radius: 5px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f40612;
  }
`;

// --- Componente React ---

const NotFoundPage = () => {
  return (
    <PageContainer>
      <HeroSection>
        {/* Fundo copiado do ImaginaryFest */}
        <BackgroundImage 
          src="https://images3.alphacoders.com/813/thumb-1920-813368.png" 
          alt="Figura enigmática como plano de fundo" 
        />
        <GradientOverlay />
        <ContentWrapper>
          <ErrorCode>404</ErrorCode>
          <Title>Página Perdida em Outra Dimensão</Title>
          <Message>
            Parece que seu <strong>Personal Reality</strong> te levou a uma coordenada inexistente. O link pode ter sido desfeito por um <strong>Imagine Breaker</strong> ou a página simplesmente não está neste vetor.
          </Message>
          <HomeButton to="/browse">Voltar para a Home</HomeButton>
        </ContentWrapper>
      </HeroSection>
    </PageContainer>
  );
};

export default NotFoundPage;
