// ----------------------------------------------------------------
// ARQUIVO COMPLETO: src/pages/Map.jsx
// Versão interativa (simulada) do mapa de Academy City.
// ----------------------------------------------------------------
import React, { useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';

// --- Dados do Mapa (Pode vir de um banco de dados no futuro) ---
const mapLocations = [
    { id: 1, name: "Distrito 7", description: "O distrito escolar central, onde se encontram a escola de Touma e o apartamento de Mikoto. É um centro de atividades comerciais e educacionais.", position: { top: '40%', left: '35%' } },
    { id: 2, name: "Distrito 10", description: "Conhecido por suas instalações de pesquisa de grande escala, incluindo o Laboratório de Pesquisa de Partículas Elementares. Um local crucial para muitos experimentos científicos.", position: { top: '25%', left: '60%' } },
    { id: 3, name: "Distrito 18", description: "Área de instalações de treinamento especializadas e escolas de elite. Frequentemente utilizado para testes de habilidades de espers de alto nível.", position: { top: '65%', left: '20%' } },
    { id: 4, name: "Distrito 23", description: "O distrito espacial e aéreo, contendo o aeroporto internacional da Cidade Academia e centros de desenvolvimento aeroespacial.", position: { top: '50%', left: '75%' } },
    { id: 5, name: "Prédio Sem Janelas", description: "A estrutura mais segura da Cidade Academia, servindo como quartel-general para o Superintendente Aleister Crowley.", position: { top: '45%', left: '50%' } },
];

// --- Styled Components ---
const MainContent = styled.main`
  padding-top: 80px;
  background-color: #0c0c0c;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const MapContainer = styled.div`
  width: 90vw;
  height: 85vh;
  max-width: 1400px;
  background: #1a1a1a url('https://i.imgur.com/g0jZzNf.png') no-repeat center center; // Imagem de fundo sutil
  background-size: cover;
  border-radius: 20px;
  border: 2px solid #333;
  box-shadow: 0 0 30px rgba(0,0,0,0.5);
  position: relative;
  display: flex;
  font-family: 'Roboto', sans-serif;
`;

const LocationsWrapper = styled.div`
  position: relative;
  width: 70%;
  height: 100%;
`;

const LocationPin = styled.div`
  position: absolute;
  top: ${props => props.position.top};
  left: ${props => props.position.left};
  width: 20px;
  height: 20px;
  background-color: #8a2be2;
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    background-color: #fff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  &:hover {
    transform: translate(-50%, -50%) scale(1.5);
    background-color: #ff00ff;
  }
`;

const InfoPanel = styled.div`
  width: 30%;
  background-color: rgba(20, 20, 20, 0.85);
  backdrop-filter: blur(10px);
  padding: 2rem;
  color: #e5e5e5;
  border-left: 1px solid #333;
  overflow-y: auto;
`;

const InfoTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #8a2be2;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #8a2be2;
  padding-bottom: 0.5rem;
`;

const InfoDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
`;


const Map = () => {
  const [selectedLocation, setSelectedLocation] = useState(mapLocations[0]);

  return (
    <>
      <Header />
      <MainContent>
        <MapContainer>
          <LocationsWrapper>
            {mapLocations.map(loc => (
              <LocationPin
                key={loc.id}
                position={loc.position}
                onClick={() => setSelectedLocation(loc)}
                title={loc.name}
              />
            ))}
          </LocationsWrapper>
          <InfoPanel>
            {selectedLocation ? (
              <>
                <InfoTitle>{selectedLocation.name}</InfoTitle>
                <InfoDescription>{selectedLocation.description}</InfoDescription>
              </>
            ) : (
              <InfoTitle>Selecione um local no mapa</InfoTitle>
            )}
          </InfoPanel>
        </MapContainer>
      </MainContent>
    </>
  );
};

export default Map;