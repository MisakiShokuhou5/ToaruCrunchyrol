document.addEventListener('DOMContentLoaded', () => {
    // Função para criar um ID único
    function generateUniqueId() {
        return 'tier-' + Math.random().toString(36).substr(2, 9);
    }

    // Função para obter o container correto (tierlist ou motelist)
    function getCurrentContainer() {
        const containerId = document.getElementById('btn-tierlist').classList.contains('active') ? 'tierlist-zones' : 'motelist-zones';
        return document.getElementById(containerId);
    }

    // Função para ligar eventos nos controles de cada tier
    function attachListenersToControls(controls, tierRow, dropzone) {
        const gear = tierRow.querySelector('.gear-btn');
        const colorPicker = controls.querySelector('.color-picker');
        const nameInput = controls.querySelector('.tier-name-input');
        const deleteBtn = controls.querySelector('.delete-tier-btn');

        // Abrir popup
        gear.addEventListener('click', () => {
            const overlay = document.getElementById('tier-popup-overlay');
            const content = document.getElementById('tier-popup-content');
            content.innerHTML = '';
            content.appendChild(controls);
            controls.style.display = 'block';
            overlay.style.display = 'flex';
        });

        // Mudar cor do fundo da tier inteira
        colorPicker.addEventListener('input', (ev) => {
            tierRow.style.backgroundColor = ev.target.value;
        });

        // Renomear tier (atualiza dataset no dropzone)
        // Renomear tier em tempo real (ajuste para alterar o texto da label visível)
        nameInput.addEventListener('input', () => {
            const label = tierRow.querySelector('.tier-label');
            if (label) label.textContent = nameInput.value || 'Nova';
            if (dropzone) dropzone.dataset.tierName = nameInput.value;
        });

        // Remover tier
        deleteBtn.addEventListener('click', () => {
            tierRow.remove();
            document.getElementById('tier-popup-overlay').style.display = 'none';
        });
    }

    // Inicializa tiers já existentes na página
    document.querySelectorAll('.tier-row').forEach(tierRow => {
        const controls = tierRow.querySelector('.tier-controls');
        const dropzone = tierRow.querySelector('.tier-dropzone');

        // Garantir ids únicos para controle
        if (!controls.dataset.parentId) {
            const uniqueId = generateUniqueId();
            tierRow.id = uniqueId;
            controls.dataset.parentId = uniqueId;
        }

        attachListenersToControls(controls, tierRow, dropzone);

        // Adicionar eventos drag & drop para tiers existentes
        dropzone.addEventListener('dragover', e => e.preventDefault());
        dropzone.addEventListener('drop', e => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const dragged = document.getElementById(id);
            if (dragged && dragged.classList.contains('character')) {
                dropzone.appendChild(dragged);
            }
        });
    });

    // Fechar popup e devolver controles à tier original
    document.getElementById('tier-popup-close').addEventListener('click', () => {
        const popupOverlay = document.getElementById('tier-popup-overlay');
        const popupContent = document.getElementById('tier-popup-content');

        const controls = popupContent.querySelector('.tier-controls');
        if (controls && controls.dataset.parentId) {
            const parent = document.getElementById(controls.dataset.parentId);
            if (parent) parent.appendChild(controls);
            controls.style.display = 'none';
        }

        popupOverlay.style.display = 'none';
    });

    // Delegação para adicionar nova tier, funciona para botões existentes e dinâmicos
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-tier-btn')) {
            const container = getCurrentContainer();
            if (!container) return;

            const newTier = document.createElement('div');
            newTier.className = 'tier-row';
            const uniqueId = generateUniqueId();
            newTier.id = uniqueId;

            const label = document.createElement('span');
            label.className = 'tier-label';
            label.textContent = 'Nova';

            const gear = document.createElement('button');
            gear.className = 'gear-btn';
            gear.textContent = '⚙️';

            const dropzone = document.createElement('div');
            dropzone.className = 'tier-dropzone';

            const controls = document.createElement('div');
            controls.className = 'tier-controls';
            controls.dataset.parentId = uniqueId;
            controls.style.display = 'none';
            controls.innerHTML = `
                <label>Cor: <input type="color" class="color-picker" value="#cccccc"></label>
                <label>Nome: <input type="text" class="tier-name-input" placeholder="Renomear tier"></label>
                <button class="delete-tier-btn">Remover esta tier</button>
                <button class="add-tier-btn">Adicionar Tier</button>
            `;

            newTier.appendChild(label);
            newTier.appendChild(gear);
            newTier.appendChild(dropzone);
            newTier.appendChild(controls);
            container.appendChild(newTier);

            attachListenersToControls(controls, newTier, dropzone);

            // Permitir drop de personagens na nova tier
            dropzone.addEventListener('dragover', e => e.preventDefault());
            dropzone.addEventListener('drop', e => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain');
                const dragged = document.getElementById(id);
                if (dragged && dragged.classList.contains('character')) {
                    dropzone.appendChild(dragged);
                }
            });
        }
    });
});
