// js/TierList.js

document.addEventListener('DOMContentLoaded', () => {
    const arcList = window.arcList || [];
    const personagens = window.personagens || [];
    const personagemArcos = window.personagemArcos || {};
    const personagemGeneros = window.personagemGeneros || {};

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

    let filterMale = false;
    let filterFemale = false;
    let currentPool = poolTier;

    function showTierList() {
        tierListContainer.classList.add('active');
        moteListContainer.classList.remove('active');
        btnTierList.classList.add('active');
        btnMoteList.classList.remove('active');
        document.getElementById('gender-filters').style.display = 'none';
        currentPool = poolTier;
        updateCharacterDisplay();
    }

    function showMoteList() {
        moteListContainer.classList.add('active');
        tierListContainer.classList.remove('active');
        btnMoteList.classList.add('active');
        btnTierList.classList.remove('active');
        document.getElementById('gender-filters').style.display = 'flex';
        currentPool = poolMote;
        updateGenderFilter();
        updateCharacterDisplay();
    }

    arcList.forEach(arc => {
        const li = document.createElement('li');
        li.textContent = arc;
        li.dataset.arc = arc;
        li.dataset.status = 'unseen';
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
            moveArc.call(li);
        });
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
        } else {
            unseenList.appendChild(this);
            this.dataset.status = 'unseen';
        }
        reorderArcLists();
        updateCharacterDisplay();
    }

    function reorderArcLists() {
        const allLists = { seen: seenList, unseen: unseenList, incomplete: incompleteList };
        for (const status in allLists) {
            const list = allLists[status];
            const items = Array.from(list.children);
            const sortedItems = arcList.map(arcName => items.find(li => li.dataset.arc === arcName)).filter(Boolean);
            sortedItems.forEach(li => list.appendChild(li));
        }
    }

    function updateCharacterDisplay() {
        const showSpoilers = showSpoilersCheckbox.checked;
        const allowedArcs = Array.from(seenList.children).map(li => li.dataset.arc);

        [poolTier, poolMote].forEach(pool => {
            pool.querySelectorAll('.character').forEach(char => {
                const name = char.id.split('-')[0];
                const arcs = personagemArcos[name] || [];
                const genero = personagemGeneros[name] || '';

                const passesSpoilerFilter = showSpoilers || arcs.some(arc => allowedArcs.includes(arc));

                let passesGenderFilter = true;
                if (currentPool === poolMote) {
                    if (filterMale && !filterFemale) passesGenderFilter = (genero === 'masculino');
                    else if (!filterMale && filterFemale) passesGenderFilter = (genero === 'feminino');
                }

                const shouldShow = (pool === currentPool) && passesSpoilerFilter && passesGenderFilter;
                char.style.display = shouldShow ? 'inline-block' : 'none';
            });
        });
    }

    function updateGenderFilter() {
        filterMale = btnMale.classList.contains('active');
        filterFemale = btnFemale.classList.contains('active');
        updateCharacterDisplay();
    }

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
        updateGenderFilter();
    });

    btnFemale.addEventListener('click', () => {
        btnFemale.classList.toggle('active');
        updateGenderFilter();
    });

    poolTier.innerHTML = '';
    poolMote.innerHTML = '';

    personagens.forEach(nome => {
        const genero = personagemGeneros[nome] || '';
        const arcos = JSON.stringify(personagemArcos[nome] || []);

        ['tier', 'mote'].forEach(type => {
            const img = document.createElement('img');
            img.src = `../img/Characters/${nome}.jpg`;
            img.className = 'character';
            img.id = `${nome}-${type}`;
            img.setAttribute('draggable', 'true');
            img.dataset.arcos = arcos;
            img.dataset.genero = genero;
            img.title = nome;

            (type === 'tier' ? poolTier : poolMote).appendChild(img);
        });
    });

    function getDragAfterElement(container, x) {
        const draggables = [...container.querySelectorAll('.character:not(.dragging)')];
        return draggables.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - (box.left + box.width / 2);
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
    }

    function enableDragAndDrop() {
        document.querySelectorAll('.character').forEach(img => {
            img.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', img.id);
                img.classList.add('dragging');
            });
            img.addEventListener('dragend', () => {
                img.classList.remove('dragging');
            });
        });

        document.querySelectorAll('.tier-dropzone, .character-pool-tier, .character-pool-mote').forEach(zone => {
            zone.addEventListener('dragover', e => {
                e.preventDefault();
            });

            zone.addEventListener('drop', e => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain');
                const dragged = document.getElementById(id);
                if (!dragged) return;

                const after = getDragAfterElement(zone, e.clientX);
                if (after == null) {
                    zone.appendChild(dragged);
                } else {
                    zone.insertBefore(dragged, after);
                }

                updateCharacterDisplay();
            });
        });
    }

    enableDragAndDrop();
    showTierList();
});
