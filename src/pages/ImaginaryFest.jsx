// ARQUIVO: src/pages/ImaginaryFest.jsx
// DESCRIÇÃO: Página de manutenção com estilo cinematográfico inspirado na Netflix.
// -------------------------------------------------------------------------------
import React from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '../components/Header'; // Supondo que você tenha um componente de cabeçalho

// --- Animações ---
// Animação para o conteúdo aparecer de baixo para cima com fade-in.
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// --- Componentes Estilizados ---

// Container principal da página
const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #141414; /* Tom de preto usado pela Netflix */
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Evita barras de rolagem indesejadas */
`;

// Seção principal que ocupa toda a tela
const HeroSection = styled.section`
  flex-grow: 1;
  position: relative;
  display: flex;
  justify-content: center;
   align-items: flex-end;
  text-align: center;
`;

// Imagem de fundo
const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5; /* Opacidade reduzida para um visual mais sutil */
  z-index: 1;
`;

// Sobreposição de gradiente para garantir a legibilidade do texto
const GradientOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 20px;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, #141414 10%, rgba(20, 20, 20, 0) 60%),
              radial-gradient(ellipse at center, rgba(20, 20, 20, 0) 0%, #141414 100%);
  z-index: 2;
`;

// Wrapper para o conteúdo textual, aplica a animação
const ContentWrapper = styled.div`
  position: relative;
  z-index: 3;
  padding: 2rem;
  max-width: 700px;
  animation: ${fadeInUp} 1s ease-out forwards;
`;

// Título principal (a mensagem)
const Title = styled.h1`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; /* Fonte similar à da Netflix */
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0px 0px 15px rgba(0, 0, 0, 0.8);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

// Assinatura (o autor da citação)
const Signature = styled.p`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 1.2rem;
  font-weight: 400;
  color: #a1a1b2;
  margin-top: 1.5rem;
  text-shadow: 0px 0px 10px rgba(0, 0, 0, 0.7);

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

// --- Componente React ---

const ImaginaryFest = () => {
  return (
    <PageContainer>
      <Header />
      <HeroSection>
        {/* NOTA: Coloque suas imagens na pasta `public` para acesso direto. */}
        <BackgroundImage 
          src="https://images3.alphacoders.com/813/thumb-1920-813368.png" 
          alt="Figura enigmática como plano de fundo" 
        />
        <GradientOverlay />
        <ContentWrapper>
          <Title>
            "Peço desculpas, mas esta seção ainda não foi implementada. Por favor, aproveite outras funções enquanto trabalhamos."
          </Title>
          <Signature>— Aleister Crowley</Signature>
        </ContentWrapper>
      </HeroSection>
    </PageContainer>
  );
};

export default ImaginaryFest;