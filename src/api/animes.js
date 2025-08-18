// ----------------------------------------------------------------
// ARQUIVO: src/api/animes.js
// (Sem alterações, apenas para garantir que está correto)
// ----------------------------------------------------------------
const ANIME_LIST_URL = 'https://a-certain-digital-database.netlify.app/src/json/Anime.json';

export const episodeFiles = {
    "a-certain-magical-index": "toaru-majutsu-no-index.json",
    "a-certain-magical-index-ii": "toaru-majutsu-no-index-II.json",
    "a-certain-magical-index-iii": "toaru-majutsu-no-index-III.json",
    "a-certain-scientific-accelerator": "toaru-kagaku-no-accelerator.json",
    "a-certain-scientific-railgun": "toaru-kagaku-no-railgun.json",
    "a-certain-scientific-railgun-s": "toaru-kagaku-no-railgun-S.json",
    "a-certain-scientific-railgun-t": "toaru-kagaku-no-railgun-T.json",
};

export const fetchAnimeList = async () => {
    try {
        const response = await fetch(ANIME_LIST_URL);
        if (!response.ok) throw new Error(`Falha ao buscar ${ANIME_LIST_URL}: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar a lista de animes:", error);
        return null;
    }
};

export const fetchEpisodeListFromUrl = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Falha ao buscar ${url}: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(`Erro ao buscar episódios da URL ${url}:`, error);
        return null;
    }
};
