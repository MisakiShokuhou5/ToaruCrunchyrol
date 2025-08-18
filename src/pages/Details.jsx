// ARQUIVO ATUALIZADO: src/pages/Details.jsx
// Corrigida a lógica de criação do link para o Player.

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { fetchAnimeList, episodeFiles } from '../api/animes';
import Spinner from '../components/shared/Spinner';
import Header from '../components/Header';
import Footer from '../components/Footer';

// --- Styled Components (sem alterações) ---
const DetailsContainer = styled.div`
  color: white;
  background-color: #141414;
`;
const Banner = styled.div`
  height: 80vh;
  background-image: linear-gradient(to top, #141414 10%, transparent 50%), url(${props => props.$bgImage});
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 4rem;
`;
const Title = styled.h1`font-size: 4rem; text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9);`;
const Synopsis = styled.p`font-size: 1.2rem; max-width: 50%; margin-top: 1rem; text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.9);`;
const ContentArea = styled.div`padding: 2rem 4rem;`;
const EpisodesList = styled.div`margin-top: 2rem;`;
const EpisodeItem = styled.div`display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid #222; transition: background-color 0.2s; &:hover { background-color: #1f1f1f; }`;
const EpisodeTitle = styled.h3`font-size: 1.1rem; font-weight: normal;`;
const PlayButton = styled(Link)`padding: 0.5rem 1.5rem; background-color: #e50914; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; &:hover { background-color: #f40612; }`;

// --- Componente Principal ---
const Details = () => {
    const { animeId } = useParams();
    const [anime, setAnime] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jsonUrl, setJsonUrl] = useState(''); // NOVO: Estado para guardar a URL do JSON

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Encontrar os dados do anime
                const allAnimes = await fetchAnimeList();
                const flatList = Object.values(allAnimes).flatMap(cat => Object.values(cat));
                const foundAnime = flatList.find(a => 
                    a.nome.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-') === animeId
                );
                
                if (!foundAnime) throw new Error("Anime não encontrado.");
                setAnime(foundAnime);

                // 2. Buscar a lista de episódios do JSON correspondente
                const jsonFilename = episodeFiles[animeId];
                if (jsonFilename) {
                    const fullJsonUrl = `https://a-certain-digital-database.netlify.app/src/json/${jsonFilename}`;
                    setJsonUrl(fullJsonUrl); // NOVO: Salva a URL do JSON
                    const response = await fetch(fullJsonUrl);
                    const episodeData = await response.json();
                    setEpisodes(episodeData.episodios || []);
                }
            } catch (error) {
                console.error("Erro ao carregar detalhes do anime:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [animeId]);

    if (loading) return <Spinner />;
    if (!anime) return <div>Anime não encontrado.</div>;

    // ALTERAÇÃO PRINCIPAL AQUI
    // Codificamos a URL do arquivo JSON que contém a lista de episódios
    const encodedJsonUrl = btoa(jsonUrl);

    return (
        <DetailsContainer>
            <Header />
            <Banner $bgImage={anime.FundoImagem || anime.imagem}>
                <Title>{anime.nome}</Title>
                <Synopsis>{anime.sinopse}</Synopsis>
            </Banner>
            <ContentArea>
                <h2>Episódios</h2>
                <EpisodesList>
                    {episodes.length > 0 ? (
                        episodes.map(ep => {
                            // O link para o player agora contém a URL do JSON e o número do episódio
                            const watchUrl = `/watch/${animeId}/${encodedJsonUrl}?ep=${ep.episodio}`;
                            
                            return (
                                <EpisodeItem key={ep.episodio}>
                                    {/* CORREÇÃO: Usando ep.episodio, que é o nome correto da propriedade */}
                                    <EpisodeTitle>Episódio {ep.episodio}: {ep.titulo}</EpisodeTitle>
                                    <PlayButton to={watchUrl}>Assistir</PlayButton>
                                </EpisodeItem>
                            );
                        })
                    ) : (
                        <p>Nenhum episódio encontrado para este anime.</p>
                    )}
                </EpisodesList>
            </ContentArea>
            <Footer />
        </DetailsContainer>
    );
};

export default Details;