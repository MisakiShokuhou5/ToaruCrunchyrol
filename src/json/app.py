import requests
import json
import os
import time

# --- CONFIGURAÇÃO ---
# Sua chave de API do The Movie Database (TMDB)
API_KEY = 'b973c7ca178790420b1b57f2e3ee0149'
# URL base da API do TMDB
TMDB_API_URL = 'https://api.themoviedb.org/3'

def gerar_json_anime(nome_anime, link_exemplo, tmdb_id_fornecido=None, numero_temporada=1):
    """
    Gera um arquivo JSON para um anime com informações dos episódios e links de vídeo.
    Pode receber um ID do TMDB e um número de temporada para buscas mais precisas.
    """
    print("---------------------------------------------------------")
    print(f"🔎 Iniciando processo para: {nome_anime}")

    anime_id = tmdb_id_fornecido
    
    # 1. Se não tivermos um ID, procuramos pelo nome
    if not anime_id:
        print(f"   Procurando ID para '{nome_anime}'...")
        search_url = f"{TMDB_API_URL}/search/tv"
        params = {'api_key': API_KEY, 'query': nome_anime, 'language': 'pt-BR'}
        
        try:
            response = requests.get(search_url, params=params)
            response.raise_for_status()  # Lança um erro para status ruins (4xx ou 5xx)
        except requests.exceptions.RequestException as e:
            print(f"❌ Erro de rede ao buscar ID: {e}")
            return

        search_results = response.json().get('results', [])
        if not search_results:
            print(f"❌ Anime '{nome_anime}' não encontrado no TMDB.")
            return

        anime_id = search_results[0]['id']
        nome_oficial = search_results[0]['name']
        print(f"✅ Anime encontrado: {nome_oficial} (ID: {anime_id})")
    else:
        print(f"   Usando ID fornecido: {anime_id}")

    # 2. Obter detalhes da temporada específica para pegar os episódios
    season_url = f"{TMDB_API_URL}/tv/{anime_id}/season/{numero_temporada}"
    params = {'api_key': API_KEY, 'language': 'pt-BR'}

    print(f"   Buscando detalhes da Temporada {numero_temporada}...")
    try:
        response = requests.get(season_url, params=params)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de rede ao buscar detalhes da temporada: {e}")
        # Tenta buscar pelo nome da série principal se a temporada falhar
        if "Index" in nome_anime and nome_anime != "Toaru Majutsu no Index":
             print("   Tentando com o nome da série principal 'Toaru Majutsu no Index'...")
             gerar_json_anime("Toaru Majutsu no Index", link_exemplo, tmdb_id_fornecido=46298, numero_temporada=numero_temporada)
        return

    season_details = response.json()
    episodios_api = season_details.get('episodes', [])

    if not episodios_api:
        print(f"❌ Nenhum episódio encontrado para a Temporada {numero_temporada} deste anime.")
        return
        
    print(f"📄 Encontrados {len(episodios_api)} episódios.")

    # 3. Preparar a base da URL do vídeo
    base_video_url = link_exemplo.rsplit('/', 1)[0]
    
    # 4. Montar a lista de episódios para o JSON
    lista_de_episodios_json = []
    for ep in episodios_api:
        numero_ep = ep['episode_number']
        ep_formatado = f"{numero_ep:02d}"
        video_url = f"{base_video_url}/{ep_formatado}.mp4"
        
        lista_de_episodios_json.append({
            'episodio': numero_ep,
            'titulo': ep.get('name', f'Episódio {numero_ep}'),
            'descricao': ep.get('overview', 'Descrição não disponível.'),
            'link_video': video_url
        })

    # 5. Criar o objeto JSON final e salvar em um arquivo
    json_final = {
        'anime': nome_anime, # Usamos o nome que definimos para manter consistência
        'sinopse': season_details.get('overview', 'Sinopse não disponível.'),
        'episodios': lista_de_episodios_json
    }

    # Gera um nome de arquivo a partir do nome do anime
    # Ex: toaru-kagaku-no-railgun-s.json
    nome_arquivo = f"{nome_anime.lower().replace(' ', '-')}.json"
    
    # Garante que o diretório 'json' exista
    if not os.path.exists('json'):
        os.makedirs('json')

    caminho_arquivo = os.path.join('json', nome_arquivo)

    with open(caminho_arquivo, 'w', encoding='utf-8') as f:
        json.dump(json_final, f, ensure_ascii=False, indent=4)

    print(f"🎉 Sucesso! O arquivo '{caminho_arquivo}' foi criado.")
    print("---------------------------------------------------------")


# --- EXECUÇÃO DO SCRIPT ---
if __name__ == '__main__':
    
    # Lista de todos os animes que você quer gerar.
    # Adicione ou remova animes aqui.
    # Para séries com várias temporadas no mesmo ID do TMDB (como Index),
    # fornecemos o ID e o número da temporada.
    animes_para_gerar = [
        {
            "nome_anime": "Toaru Kagaku no Accelerator",
            "link_exemplo": "https://p1.animescomix.com/stream/animes/t/toaru-kagaku-no-accelerator/01.mp4",
        },
        {
            "nome_anime": "Toaru Kagaku no Railgun",
            "link_exemplo": "https://p1.animescomix.com/stream/animes/t/to-aru-kagaku-no-railgun/01.mp4",
            "tmdb_id": 36252, # ID específico para Railgun
            "season": 1
        },
        {
            "nome_anime": "Toaru Kagaku no Railgun S",
            "link_exemplo": "https://p1.animescomix.com/stream/animes/t/toaru-kagaku-no-railgun-s/01.mp4",
            "tmdb_id": 60987, # ID específico para Railgun S
            "season": 1
        },
        {
            "nome_anime": "Toaru Kagaku no Railgun T",
            "link_exemplo": "https://p1.animescomix.com/stream/animes/t/toaru-kagaku-no-railgun-t/01.mp4",
            "tmdb_id": 84974, # ID específico para Railgun T
            "season": 1
        },
        {
            "nome_anime": "Toaru Majutsu no Index",
            "link_exemplo": "https://p1.animescomix.com/stream/animes/t/to-aru-majutsu-no-Index/01.mp4",
            "tmdb_id": 46298, # ID principal de Index
            "season": 1
        },
        {
            "nome_anime": "Toaru Majutsu no Index II",
            "link_exemplo": "https://p1.animescomix.com/stream/animes/t/to-aru-majutsu-no-Index-2/01.mp4",
            "tmdb_id": 46298, # Mesmo ID de Index
            "season": 2 # Apenas muda a temporada
        },
        {
            "nome_anime": "Toaru Majutsu no Index III",
            "link_exemplo": "https://p1.animescomix.com/stream/animes/t/to-aru-majutsu-no-Index-3/01.mp4",
            "tmdb_id": 46298, # Mesmo ID de Index
            "season": 3 # Apenas muda a temporada
        }
    ]

    # Itera sobre a lista e gera um JSON para cada anime
    for anime in animes_para_gerar:
        gerar_json_anime(
            nome_anime=anime["nome_anime"],
            link_exemplo=anime["link_exemplo"],
            tmdb_id_fornecido=anime.get("tmdb_id"), # Usa .get() para não dar erro se a chave não existir
            numero_temporada=anime.get("season", 1) # Padrão é 1 se não for especificado
        )
        # Pequena pausa para não sobrecarregar a API
        time.sleep(1)

    print("\n✅✅✅ TODOS OS ARQUIVOS JSON FORAM GERADOS COM SUCESSO! ✅✅✅")