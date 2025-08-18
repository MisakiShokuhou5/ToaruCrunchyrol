// ARQUIVO ATUALIZADO: src/pages/Browse.jsx
// REATORADO PARA MAIOR PERFORMANCE, MODULARIDADE E LEGIBILIDADE

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/Browse/Hero';
import AnimeRow from '../components/Browse/AnimeRow';
import Spinner from '../components/shared/Spinner';
import { fetchAnimeList } from '../api/animes';

// ----------------------------------------------------------------
// HOOKS CUSTOMIZADOS PARA SEPARAR A LÓGICA
// ----------------------------------------------------------------

// Hook para buscar a lista principal de animes
const useAnimeData = () => {
    const [animeData, setAnimeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const allAnimes = await fetchAnimeList();
                if (!allAnimes) {
                    throw new Error("Não foi possível carregar a lista de animes.");
                }
                setAnimeData(allAnimes);
            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return { animeData, loading, error };
};

// Hook para buscar e processar a lista "Continuar Assistindo"
const useContinueWatching = (animeData) => {
    const { user, selectedProfile } = useAuth();
    const [continueWatching, setContinueWatching] = useState([]);
    const [loading, setLoading] = useState(true);

    // OTIMIZAÇÃO: Cria um mapa de animes para busca rápida (O(1) em média)
    // useMemo garante que o mapa só seja recalculado se a lista de animes mudar.
    const animeMap = useMemo(() => {
        if (!animeData) return new Map();
        
        const flatList = Object.values(animeData).flatMap(category => Object.values(category));
        const map = new Map();
        flatList.forEach(anime => {
            // A chave do mapa será o ID do anime, como você gerava antes.
            const animeId = anime.nome.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-');
            map.set(animeId, anime);
        });
        return map;
    }, [animeData]);

    useEffect(() => {
        if (!user || !selectedProfile || !animeData) {
            setLoading(false);
            return;
        }

        const fetchHistory = async () => {
            try {
                setLoading(true);
                const historyRef = collection(db, `userWatchHistory/${user.uid}/profiles/${selectedProfile.id}/history`);
                const q = query(historyRef, orderBy('lastWatched', 'desc'));
                const historySnapshot = await getDocs(q);
                const historyList = historySnapshot.docs.map(doc => doc.data());

                // LÓGICA OTIMIZADA: Usa o mapa para encontrar os animes rapidamente.
                const watchingList = historyList.map(historyItem => {
                    const foundAnime = animeMap.get(historyItem.animeId);
                    if (foundAnime) {
                        return { ...foundAnime, watchHistory: historyItem };
                    }
                    return null;
                }).filter(Boolean); // Remove os nulos caso um anime do histórico não seja encontrado

                setContinueWatching(watchingList);

            } catch (error) {
                console.error("Erro ao buscar histórico:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user, selectedProfile, animeData, animeMap]);

    return { continueWatching, loading };
};


// ----------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------

const BrowseContainer = styled.div`
    background-color: #000000ff;
    color: white;
    min-height: 100vh;
`;

const Browse = () => {
    // O componente agora apenas consome os hooks. Muito mais limpo!
    const { animeData, loading: animesLoading, error: animesError } = useAnimeData();
    const { continueWatching, loading: historyLoading } = useContinueWatching(animeData);

    // Carregamento principal: Se a lista de animes ainda não chegou, mostre um spinner.
    if (animesLoading) {
        return <Spinner />;
    }

    // Estado de erro principal
    if (animesError) {
        return <div>Erro ao carregar dados: {animesError}</div>;
    }

    // Prepara os dados para os componentes filhos
    const allAnimesForHero = Object.values(animeData).flatMap(category => Object.values(category));
    const categories = Object.keys(animeData);

    return (
        <BrowseContainer>
            <Header />
            {/* O Hero pode ser exibido mesmo que o "Continuar Assistindo" ainda esteja carregando */}
            <Hero heroAnimes={allAnimesForHero} />

            <main>
                {/* A seção "Continuar Assistindo" aparece assim que seus dados estiverem prontos,
                  sem bloquear o resto da página.
                */}
                {!historyLoading && continueWatching.length > 0 && (
                    <AnimeRow 
                        title="Continuar Assistindo"
                        animes={continueWatching}
                    />
                )}

                {/* As categorias de animes são renderizadas normalmente */}
                {categories.map(category => (
                    <AnimeRow 
                        key={category} 
                        title={category} 
                        animes={Object.values(animeData[category])} 
                    />
                ))}
            </main>
            <Footer />
        </BrowseContainer>
    );
};

export default Browse;