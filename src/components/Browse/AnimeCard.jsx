// ----------------------------------------------------------------
// ARQUIVO ATUALIZADO: src/components/Browse/AnimeCard.jsx
// O link do card agora aponta para a página de detalhes do anime.
// ----------------------------------------------------------------
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const CardWrapper = styled(Link)`
    position: relative;
    display: block;
    min-width: 250px;
    height: 140px;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    flex-shrink: 0;
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        z-index: 5;
    }
`;

const ProgressBar = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    height: 5px;
    background-color: #8a2be2; /* Cor Roxa */
    width: ${props => props.$progress}%;
`;

const AnimeCard = ({ anime }) => {
    // A prop watchHistory é derivada de anime, então podemos acessá-la diretamente
    const { watchHistory } = anime;

    const animeId = anime.nome.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-');

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = 'https://placehold.co/400x225/141414/FFF?text=Imagem+Indisponivel';
    };

    // MUDANÇA PRINCIPAL: O card agora gera a URL para a página de detalhes.
    const detailsUrl = `/details/${animeId}`;

    // A lógica da barra de progresso continua a mesma.
    // Assumindo que a duração de um episódio é de 24 minutos (1440 segundos)
    const progressPercent = watchHistory ? (watchHistory.progressSeconds / 1440) * 100 : 0;

    return (
        <CardWrapper to={detailsUrl}> {/* <<< LINK ATUALIZADO AQUI */}
            <img 
                src={anime.imagem || anime.FundoImagem || 'https://placehold.co/400x225/141414/FFF?text=?'} 
                alt={anime.nome}
                onError={handleImageError} 
            />
            {watchHistory && <ProgressBar $progress={progressPercent} />}
        </CardWrapper>
    );
};

export default AnimeCard;