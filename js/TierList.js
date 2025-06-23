// js/TierList.js

document.addEventListener('DOMContentLoaded', () => {
    // Estas variáveis globais já devem estar disponíveis do Characters.js
    const arcList = window.arcList || [];
    const personagens = window.personagens || [];
    const personagemArcos = window.personagemArcos || {};
    const personagemGeneros = window.personagemGeneros || {};

    // Elementos da interface
    const btnTierList = document.getElementById('btn-tierlist');
    const btnMoteList = document.getElementById('btn-motelist');
    const tierListContainer = document.getElementById('tierlist-container');
    const moteListContainer = document.getElementById('motelist-container');

    const arcInfoBtn = document.getElementById('arc-info-btn');
    const arcManager = document.getElementById('arc-manager');
    const showSpoilersCheckbox = document.getElementById('show-spoilers');

    const seenList = document.getElementById('arcs-seen');
    const unseenList = document.getElementById('arcs-unseen');
    const incompleteList = document.getElementById('arcs-incomplete');

    const btnMale = document.getElementById('filter-male');
    const btnFemale = document.getElementById('filter-female');

    const poolTier = document.getElementById('character-pool-tier');
    const poolMote = document.getElementById('character-pool-mote');

    // Variáveis de estado para filtros e pool ativo
    let filterMale = false;
    let filterFemale = false;
    let currentPool = poolTier; // Inicia com o pool da Tier List

    // Funções de exibição de lista
    function showTierList() {
        tierListContainer.classList.add('active');
        moteListContainer.classList.remove('active');
        btnTierList.classList.add('active');
        btnMoteList.classList.remove('active');
        document.getElementById('gender-filters').style.display = 'none'; // Esconde os filtros de gênero
        currentPool = poolTier;
        updateCharacterDisplay();
    }

    function showMoteList() {
        moteListContainer.classList.add('active');
        tierListContainer.classList.remove('active');
        btnMoteList.classList.add('active');
        btnTierList.classList.remove('active');
        document.getElementById('gender-filters').style.display = 'flex'; // Mostra os filtros de gênero
        currentPool = poolMote;
        // As flags filterMale e filterFemale são atualizadas dentro de updateGenderFilter
        updateGenderFilter(); // Garante que os filtros de gênero estejam atualizados ao mudar para MoteList
        updateCharacterDisplay(); // Aplica os filtros ao mudar de lista
    }

    // Gerenciamento de Arcos
    arcList.forEach(arc => {
        const li = document.createElement('li');
        li.textContent = arc;
        li.dataset.arc = arc;
        li.dataset.status = 'unseen';
        li.style.cursor = 'pointer';
        li.addEventListener('click', moveArc);
        unseenList.appendChild(li);
    });

    function moveArc() {
        const status = this.dataset.status;
        if (status === 'unseen') {
            seenList.appendChild(this);
            this.dataset.status = 'seen';
        } else if (status === 'seen') {
            incompleteList.appendChild(this);
            this.dataset.status = 'incomplete';
        } else { // status === 'incomplete'
            unseenList.appendChild(this);
            this.dataset.status = 'unseen';
        }
        reorderArcLists();
        updateCharacterDisplay(); // Recalcula a visibilidade dos personagens
    }

    function reorderArcLists() {
        const allLists = { seen: seenList, unseen: unseenList, incomplete: incompleteList };
        for (const status in allLists) {
            const list = allLists[status];
            const items = Array.from(list.children);
            const sortedItems = arcList
                .map(arcName => items.find(li => li.dataset.arc === arcName))
                .filter(Boolean); // Remove nulos/indefinidos
            sortedItems.forEach(li => list.appendChild(li));
        }
    }

    // Função principal de atualização da exibição dos personagens
    function updateCharacterDisplay() {
        console.groupCollapsed('--- updateCharacterDisplay chamada ---'); // Usa groupCollapsed para um console mais limpo

        // Sempre lê o estado atual dos filtros do DOM
        const showSpoilers = showSpoilersCheckbox.checked;
        const allowedArcs = Array.from(seenList.children).map(li => li.dataset.arc);

        console.log('Estado atual dos filtros GLOBAIS:');
        console.log('  Mostrar Spoilers:', showSpoilers);
        console.log('  Arcos Permitidos (da lista "Visto"):', allowedArcs);
        console.log('  Filtrar Masculino (variável filterMale):', filterMale);
        console.log('  Filtrar Feminino (variável filterFemale):', filterFemale);
        console.log('  Pool Ativo (currentPool.id):', currentPool.id);


        [poolTier, poolMote].forEach(pool => {
            pool.querySelectorAll('.character').forEach(char => {
                const name = char.id.split('-')[0];
                // Use as variáveis globais que vieram do Characters.js
                const arcs = personagemArcos[name] || [];
                const genero = personagemGeneros[name] || '';

                // Lógica de Spoiler: Mostra se spoilers estão ativos OU se o personagem tem algum arco visto
                const passesSpoilerFilter = showSpoilers || arcs.some(arc => allowedArcs.includes(arc));

                // Lógica de Gênero:
                let passesGenderFilter = true; // Por padrão, passa.
                if (currentPool === poolMote) { // Apenas aplica filtro de gênero na Motelist
                    if (filterMale && !filterFemale) { // Apenas Masculino selecionado
                        passesGenderFilter = (genero === 'masculino');
                    } else if (!filterMale && filterFemale) { // Apenas Feminino selecionado
                        passesGenderFilter = (genero === 'feminino');
                    } else if (filterMale && filterFemale) { // Ambos selecionados (mostra ambos os gêneros)
                        passesGenderFilter = true; // Não filtra por gênero, mostra todos os gêneros
                    } else { // Nenhum filtro de gênero selecionado (mostra todos os gêneros)
                        passesGenderFilter = true;
                    }
                } else {
                    passesGenderFilter = true; // Filtros de gênero não se aplicam na TierList
                }

                // Visibilidade final: Apenas se passar nos filtros E estiver no pool ativo
                const shouldShow = (pool === currentPool) && passesSpoilerFilter && passesGenderFilter;

                char.style.display = shouldShow ? 'inline-block' : 'none';

                // Logs detalhados para depuração (descomente se precisar de mais detalhes)
                // console.log(`  > Personagem: ${name} (Pool: ${pool.id})`);
                // console.log(`    - Arcos:`, arcs);
                // console.log(`    - Gênero: ${genero}`);
                // console.log(`    - Passa Spoiler: ${passesSpoilerFilter}`);
                // console.log(`    - Passa Gênero: ${passesGenderFilter}`);
                // console.log(`    - Decisão Final: ${shouldShow ? 'MOSTRAR' : 'ESCONDER'}`);
                // console.log(`    - display CSS: ${char.style.display}`);
            });
        });
        console.groupEnd();
    }

    // Função para atualizar as variáveis de estado dos filtros de gênero
    function updateGenderFilter() {
        filterMale = btnMale.classList.contains('active');
        filterFemale = btnFemale.classList.contains('active');
        updateCharacterDisplay(); // Chamar updateCharacterDisplay após atualizar as flags
    }

    // Event Listeners para botões e checkbox
    btnTierList.addEventListener('click', showTierList);
    btnMoteList.addEventListener('click', showMoteList);

    arcInfoBtn.addEventListener('click', () => {
        arcManager.style.display = arcManager.style.display === 'none' ? 'flex' : 'none';
    });

    showSpoilersCheckbox.addEventListener('change', () => {
        updateCharacterDisplay();
    });

    btnMale.addEventListener('click', () => {
        btnMale.classList.toggle('active');
        updateGenderFilter(); // Agora chama a função dedicada
    });

    btnFemale.addEventListener('click', () => {
        btnFemale.classList.toggle('active');
        updateGenderFilter(); // Agora chama a função dedicada
    });

    // Drag and Drop (Tier Zones e Pools)
    // Seleciona todas as zonas de drop (tier-dropzone e character-pool)
    document.querySelectorAll('.tier-dropzone, .character-pool-tier, .character-pool-mote').forEach(zone => {
        zone.addEventListener('dragover', e => e.preventDefault());
        zone.addEventListener('drop', e => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const dragged = document.getElementById(id);
            if (dragged) zone.appendChild(dragged);
        });
    });

    // Adiciona os personagens aos pools iniciais (executa apenas uma vez no carregamento)
    personagens.forEach(nome => {
        const genero = personagemGeneros[nome] || '';
        const arcos = JSON.stringify(personagemArcos[nome] || []);

        ['tier', 'mote'].forEach(type => {
            const img = document.createElement('img');
            // ATENÇÃO: Ajuste este caminho se suas imagens não estiverem em src/img/Characters/
            // Considerando que index.html está em 'pages/' e as imagens em 'src/img/Characters/'
            img.src = `../../img/Characters/${nome}.jpg`;
            img.className = 'character';
            img.id = `${nome}-${type}`; // ID único para cada personagem em cada pool
            img.setAttribute('draggable', 'true');
            img.dataset.arcos = arcos; // Armazena arcos como string JSON
            img.dataset.genero = genero;
            img.title = nome;

            img.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', img.id);
            });

            // Lógica de retorno para o pool se não for solto em uma zona válida (TierList)
            // Para a Motelist, esperamos que os personagens permaneçam no pool ou voltem pra lá.
            // Esta lógica garante que se o personagem for arrastado para fora de uma zona de drop válida, ele volte para seu pool original.
            img.addEventListener('dragend', () => {
                const parentId = img.parentElement ? img.parentElement.id : '';
                const isTierZone = parentId.includes('tier-') && !parentId.includes('pool'); // Verifica se é uma tier-dropzone
                const isPoolTier = parentId === 'character-pool-tier';
                const isPoolMote = parentId === 'character-pool-mote';

                // Se o personagem não foi solto em uma zona de tier (TierList) e não está no pool correto,
                // ou se ele foi solto em um lugar inválido na Motelist, retorne-o ao seu pool original.
                if (type === 'tier' && !isTierZone && !isPoolTier) {
                    poolTier.appendChild(img);
                } else if (type === 'mote' && !isPoolMote) {
                    // Para a Motelist, o personagem deve estar sempre no pool mote ou nas categorias temporárias,
                    // mas se for solto fora do pool mote, volta para lá.
                    // Isso é uma simplificação, pois a motelist geralmente não tem "tier-zones" para soltar.
                    poolMote.appendChild(img);
                }
            });

            // Adiciona o personagem ao seu pool inicial (tier ou mote)
            (type === 'tier' ? poolTier : poolMote).appendChild(img);
        });
    });

    // Inicializa a exibição com a Tier List ao carregar a página
    showTierList();
    // A chamada a updateCharacterDisplay() já está dentro de showTierList()
    // Então, não é necessário chamar novamente aqui: updateCharacterDisplay();
});