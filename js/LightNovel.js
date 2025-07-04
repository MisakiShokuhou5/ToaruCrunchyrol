const container = document.getElementById('site-view');

let currentSeries = null;
let currentSaga = null;
let currentArc = null;

function clearContainer() {
  container.innerHTML = '';
}

function renderSeriesList(lightNovelsData) {
  clearContainer();
  container.innerHTML = `<h2>Escolha uma série de Light Novel</h2>`;
  const seriesGrid = document.createElement('div');
  seriesGrid.className = 'series-grid';

  Object.keys(lightNovelsData).forEach(seriesName => {
    const seriesCard = document.createElement('div');
    seriesCard.className = 'series-card';
    seriesCard.textContent = seriesName;
    seriesCard.style.cursor = 'pointer';
    seriesCard.addEventListener('click', () => {
      currentSeries = seriesName;
      renderSagaList(lightNovelsData[seriesName]);
    });
    seriesGrid.appendChild(seriesCard);
  });

  container.appendChild(seriesGrid);
}

function renderSagaList(sagasData) {
  clearContainer();
  container.innerHTML = `<h2>${currentSeries} - Sagas</h2>`;
  const sagaList = document.createElement('div');
  sagaList.className = 'cards-container';

  Object.entries(sagasData).forEach(([sagaName, sagaContent]) => {
    const sagaCard = document.createElement('div');
    sagaCard.className = 'card';
    sagaCard.textContent = sagaName;
    sagaCard.style.cursor = 'pointer';
    sagaCard.addEventListener('click', () => {
      currentSaga = sagaName;
      renderArcList(sagaContent);
    });
    sagaList.appendChild(sagaCard);
  });

  container.appendChild(sagaList);
}

function renderArcList(arcsData) {
  clearContainer();
  container.innerHTML = `<h2>${currentSaga} - Arcos</h2>`;
  const arcList = document.createElement('div');
  arcList.className = 'cards-container';

  Object.entries(arcsData).forEach(([arcName, volumes]) => {
    const arcCard = document.createElement('div');
    arcCard.className = 'card';
    arcCard.textContent = arcName;
    arcCard.style.cursor = 'pointer';
    arcCard.addEventListener('click', () => {
      currentArc = arcName;
      renderVolumeList(volumes);
    });
    arcList.appendChild(arcCard);
  });

  container.appendChild(arcList);
}

function renderVolumeList(volumesData) {
  clearContainer();
  container.innerHTML = `<h2>${currentArc} - Volumes</h2>`;
  const volumeList = document.createElement('div');
  volumeList.className = 'cards-container';

  Object.entries(volumesData).forEach(([volumeName, volumeData]) => {
    if (
      volumeName.toLowerCase() === 'capa' ||
      typeof volumeData !== 'object' ||
      Array.isArray(volumeData)
    ) {
      return; // Ignorar entradas inválidas
    }

    const volumeCard = document.createElement('div');
    volumeCard.className = 'card volume-card';
    volumeCard.style.textAlign = 'center';

    // Capa
    let capaSrc = '';
    if (Array.isArray(volumeData.Capa)) {
      capaSrc = volumeData.Capa[0];
    } else {
      capaSrc = volumeData.Capa || '';
    }

    volumeCard.innerHTML = `
      <img src="../src/img/Light Novel/${capaSrc}" alt="Capa do volume" style="max-width:150px; display:block; margin: 0 auto 10px;">
      <strong>${volumeName}</strong>
    `;

    // Botões para idiomas
    const btnsDiv = document.createElement('div');
    btnsDiv.style.display = 'flex';
    btnsDiv.style.justifyContent = 'center';
    btnsDiv.style.gap = '12px';
    btnsDiv.style.marginTop = '10px';

    ['Português', 'English'].forEach(idioma => {
      let arquivo = volumeData[idioma];
      if (Array.isArray(arquivo)) arquivo = arquivo[0];

      if (arquivo) {
        const link = document.createElement('a');
        link.href = `src/img/Light Novel/${arquivo}`;
        link.target = '_blank';
        link.textContent = idioma;
        link.style.padding = '6px 14px';
        link.style.backgroundColor = '#007BFF';
        link.style.color = '#fff';
        link.style.textDecoration = 'none';
        link.style.border = 'none';
        link.style.borderRadius = '4px';
        link.style.fontWeight = 'bold';
        link.style.transition = 'background-color 0.3s';
        link.onmouseenter = () => link.style.backgroundColor = '#339CFF';
        link.onmouseleave = () => link.style.backgroundColor = '#007BFF';

        btnsDiv.appendChild(link);
      }
    });

    volumeCard.appendChild(btnsDiv);
    volumeList.appendChild(volumeCard);
  });

  container.appendChild(volumeList);
}

// Início
fetch('../../json/LightNovel.json')
  .then(res => res.json())
  .then(data => {
    renderSeriesList(data);
  })
  .catch(err => {
    container.innerHTML = `<p>Erro ao carregar os dados da Light Novel.</p>`;
    console.error(err);
  });
