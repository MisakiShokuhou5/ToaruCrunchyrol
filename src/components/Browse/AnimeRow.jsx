

// ----------------------------------------------------------------
// ARQUIVO ATUALIZADO: src/components/Browse/AnimeRow.jsx
// Lógica refeita para criar um carrossel com setas de navegação.
// ----------------------------------------------------------------
import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import AnimeCard from './AnimeCard';

const RowContainer = styled.div`
    margin-bottom: 3rem;
`;

const RowTitle = styled.h2`
    color: #e5e5e5;
    margin-bottom: 1rem;
    padding-left: 3rem;
`;

const RowWrapper = styled.div`
    position: relative;

    &:hover .scroll-arrow {
        opacity: 1;
    }
`;

const ScrollArrow = styled.button`
    position: absolute;
    top: 0;
    bottom: 0;
    width: 3rem;
    background-color: rgba(20, 20, 20, 0.5);
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;

    &.left {
        left: 0;
    }
    &.right {
        right: 0;
    }
    
    &:hover {
        background-color: rgba(20, 20, 20, 0.8);
    }

    &:disabled {
        opacity: 0.2;
        cursor: default;
    }
`;

const RowContent = styled.div`
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0 3rem;
    gap: 10px;
    scroll-behavior: smooth; /* Animação de scroll */

    &::-webkit-scrollbar {
        display: none; /* Esconde a barra de rolagem */
    }
`;

const AnimeRow = ({ title, animes }) => {
    const scrollRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkArrows = () => {
        const { current } = scrollRef;
        if (current) {
            setShowLeftArrow(current.scrollLeft > 0);
            setShowRightArrow(current.scrollLeft < current.scrollWidth - current.clientWidth - 1);
        }
    };

    useEffect(() => {
        checkArrows(); // Verifica no carregamento inicial
        const currentRef = scrollRef.current;
        currentRef.addEventListener('scroll', checkArrows);
        return () => currentRef.removeEventListener('scroll', checkArrows);
    }, [animes]);


    const handleScroll = (direction) => {
        const { current } = scrollRef;
        if (current) {
            const scrollAmount = current.clientWidth * 0.8;
            current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
        }
    };

    return (
        <RowContainer>
            <RowTitle>{title}</RowTitle>
            <RowWrapper>
                {showLeftArrow && (
                    <ScrollArrow className="left" onClick={() => handleScroll('left')}>
                        &#8249;
                    </ScrollArrow>
                )}
                <RowContent ref={scrollRef}>
                    {animes.map((anime, index) => (
                        <AnimeCard 
                            key={`${title}-${index}`} 
                            anime={anime} 
                            watchHistory={anime.watchHistory}
                        />
                    ))}
                </RowContent>
                {showRightArrow && (
                    <ScrollArrow className="right" onClick={() => handleScroll('right')}>
                        &#8250;
                    </ScrollArrow>
                )}
            </RowWrapper>
        </RowContainer>
    );
};

export default AnimeRow;
