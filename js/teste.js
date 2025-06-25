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

    function saveState() {
        const tierOrder = [...poolTier.querySelectorAll('.character')].map(img => img.id);
        const moteOrder = [...poolMote.querySelectorAll('.character')].map(img => img.id);
        const arcsSeen = [...seenList.children].map(li => li.dataset.arc);
        const arcsIncomplete = [...incompleteList.children].map(li => li.dataset.arc);
        const arcsUnseen = [...unseenList.children].map(li => li.dataset.arc);

        const saveData = {
            tierOrder,
            moteOrder,
            arcsSeen,
            arcsIncomplete,
            arcsUnseen,
            filterMale,
            filterFemale,
            currentPoolId: currentPool.id,
            showSpoilers: showSpoilersCheckbox.checked
        };

        localStorage.setItem('tierMoteState', JSON.stringify(saveData));
    }

    function loadState() {
        const saved = localStorage.getItem('tierMoteState');
        if (!saved) return;

        const { tierOrder, moteOrder, arcsSeen, arcsIncomplete, arcsUnseen, filterMale: fMale, filterFemale: fFemale, currentPoolId, showSpoilers } = JSON.parse(saved);

        tierOrder.forEach(id => {
            const el = document.getElementById(id);
            if (el) poolTier.appendChild(el);
        });

        moteOrder.forEach(id => {
            const el = document.getElementById(id);
            if (el) poolMote.appendChild(el);
        });

        arcsSeen.forEach(arc => {
            const li = [...seenList.children].find(li => li.dataset.arc === arc);
            if (li) seenList.appendChild(li);
        });

        arcsIncomplete.forEach(arc => {
            const li = [...incompleteList.children].find(li => li.dataset.arc === arc);
            if (li) incompleteList.appendChild(li);
        });

        arcsUnseen.forEach(arc => {
            const li = [...unseenList.children].find(li => li.dataset.arc === arc);
            if (li) unseenList.appendChild(li);
        });

        filterMale = fMale;
        filterFemale = fFemale;
        btnMale.classList.toggle('active', filterMale);
        btnFemale.classList.toggle('active', filterFemale);
        showSpoilersCheckbox.checked = !!showSpoilers;

        if (currentPoolId === 'character-pool-mote') {
            currentPool = poolMote;
            showMoteList();
        } else {
            currentPool = poolTier;
            showTierList();
        }
    }

    function showTierList() {
        tierListContainer.classList.add('active');
        moteListContainer.classList.remove('active');
        btnTierList.classList.add('active');
        btnMoteList.classList.remove('active');
        document.getElementById('gender-filters').style.display = 'none';
        currentPool = poolTier;
        updateCharacterDisplay();
        saveState();
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
        saveState();
    }

    arcList.forEach(arc => {
        const li = document.createElement('li');
        li.textContent = arc;
        li.dataset.arc = arc;
        li.dataset.status = 'unseen';
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
            moveArc.call(li);
            saveState();
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
        saveState();
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

        saveState();
    }

    function updateGenderFilter() {
        filterMale = btnMale.classList.contains('active');
        filterFemale = btnFemale.classList.contains('active');
        updateCharacterDisplay();
        saveState();
    }

    btnTierList.addEventListener('click', showTierList);
    btnMoteList.addEventListener('click', showMoteList);

    arcInfoBtn.addEventListener('click', () => {
        arcManager.style.display = arcManager.style.display === 'none' ? 'flex' : 'none';
    });

    showSpoilersCheckbox.addEventListener('change', () => {
        updateCharacterDisplay();
        saveState();
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
            img.src = `../../img/Characters/${nome}.jpg`;
            img.className = 'character';
            img.id = `${nome}-${type}`;
            img.setAttribute('draggable', 'true');
            img.dataset.arcos = arcos;
            img.dataset.genero = genero;
            img.title = nome;

            img.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', img.id);
                img.classList.add('dragging');
            });

            img.addEventListener('dragend', () => {
                img.classList.remove('dragging');
            });

            (type === 'tier' ? poolTier : poolMote).appendChild(img);
        });
    });

    function getDragAfterElement(container, axis, pos) {
        const draggables = [...container.querySelectorAll('.character:not(.dragging)')];

        return draggables.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = axis === 'x'
                ? pos - (box.left + box.width / 2)
                : pos - (box.top + box.height / 2);

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
    }

    function enableDropzone(zone) {
        zone.addEventListener('dragover', e => {
            e.preventDefault();
        });

        zone.addEventListener('drop', e => {
            e.preventDefault();

            const id = e.dataTransfer.getData('text/plain');
            const dragged = document.getElementById(id);
            if (!dragged) return;

            let axis = 'x';
            if (zone.classList.contains('tier-dropzone')) {
                axis = 'y';
            }

            const after = getDragAfterElement(zone, axis, axis === 'x' ? e.clientX : e.clientY);
            if (after == null) {
                zone.appendChild(dragged);
            } else {
                zone.insertBefore(dragged, after);
            }

            saveState();
        });
    }

    document.getElementById('tierlist-zones').addEventListener('click', e => {
        if (!e.target.classList.contains('add-tier-btn')) return;

        const btn = e.target;
        const tierRow = btn.closest('.tier-row');
        if (!tierRow) return;

        const clone = tierRow.cloneNode(true);

        const label = clone.querySelector('.tier-label');
        const novaLabel = prompt('Nome da nova tier:', label.textContent + ' Nova');
        if (!novaLabel) return;

        label.textContent = novaLabel;

        const dropzone = clone.querySelector('.tier-dropzone');
        dropzone.innerHTML = '';
        dropzone.dataset.tier = novaLabel.toLowerCase().replace(/\s+/g, '-');

        const controls = clone.querySelector('.tier-controls');
        controls.style.display = 'none';

        clone.querySelector('.gear-btn').addEventListener('click', () => {
            const controls = clone.querySelector('.tier-controls');
            controls.style.display = controls.style.display === 'none' ? 'flex' : 'none';
        });

        clone.querySelector('.delete-tier-btn').addEventListener('click', () => {
            clone.remove();
            saveState();
        });

        enableDropzone(dropzone);

        document.getElementById('tierlist-zones').appendChild(clone);

        saveState();
    });

    document.querySelectorAll('.tier-dropzone, .character-pool-tier, .character-pool-mote')
        .forEach(enableDropzone);

    loadState();
});

if (!clone.querySelector('.gear-btn')) {
    const gearBtn = document.createElement('button');
    gearBtn.className = 'gear-btn';
    gearBtn.textContent = '⚙';
    clone.appendChild(gearBtn);
}
