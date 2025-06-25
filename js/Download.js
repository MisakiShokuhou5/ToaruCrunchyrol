document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('save-image-btn');
    const imagePreview = document.getElementById('image-preview');
    const popup = document.getElementById('image-save-popup');
    const closeBtn = document.getElementById('close-image-save');
    const downloadBtn = document.getElementById('download-image-btn');

    saveBtn.addEventListener('click', () => {
        const isTierActive = document.getElementById('tierlist-container').classList.contains('active');
        const container = isTierActive
            ? document.getElementById('tierlist-zones')
            : document.getElementById('motelist-zones');
        const filename = isTierActive ? 'tierlist' : 'motelist';

        // Esconde os botões de engrenagem temporariamente
        const gearButtons = container.querySelectorAll('.gear-btn');
        gearButtons.forEach(btn => btn.style.display = 'none');

        // Espera o DOM atualizar antes de capturar
        setTimeout(() => {
            html2canvas(container, {
                backgroundColor: '#090B26',
                scrollY: -window.scrollY,
                useCORS: true
            }).then(canvas => {
                const dataURL = canvas.toDataURL('image/png');
                imagePreview.src = dataURL;
                downloadBtn.href = dataURL;
                downloadBtn.download = `${filename}.png`;
                popup.style.display = 'flex';

                // Restaura visibilidade dos botões
                gearButtons.forEach(btn => btn.style.display = '');
            });
        }, 50);
    });

    closeBtn.addEventListener('click', () => {
        popup.style.display = 'none';
        imagePreview.src = '';
    });
});
