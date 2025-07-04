const container = document.getElementById('site-view');

let idioma = new URLSearchParams(window.location.search).get('lang') || 'pt';
let duasPaginas = false; // controla modo de visualização dupla

function createLanguageSelector() {
  const langContainer = document.createElement('div');
  langContainer.style.textAlign = 'center';
  langContainer.style.margin = '16px 0';

  const label = document.createElement('label');
  label.for = 'language-select';
  label.textContent = 'Idioma: ';
  label.style.color = 'var(--text-color)';
  label.style.fontFamily = "'Inter', sans-serif";
  label.style.fontWeight = 'bold';

  const select = document.createElement('select');
  select.id = 'language-select';
  select.style.padding = '4px 8px';
  select.style.borderRadius = '4px';
  select.style.fontSize = '16px';
  select.style.fontFamily = "'Inter', sans-serif";

  const options = [
    { value: 'pt', label: 'Português' },
    { value: 'en', label: 'English' }
  ];

  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    if (opt.value === idioma) option.selected = true;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    idioma = select.value;
    if (currentChapterData) {
      showPages(currentChapterData, capituloAtual);
    }
  });

  langContainer.appendChild(label);
  langContainer.appendChild(select);

  return langContainer;
}

let currentChapterData = null;
let listaCapitulos = [];
let capituloAtual = 0;

if (!window.location.search) {
  document.querySelectorAll('.series-card').forEach(card => {
    card.addEventListener('click', () => {
      const serie = card.dataset.serie;
      const lang = card.dataset.lang || 'pt';
      window.location.href = `Mangá.html?serie=${encodeURIComponent(serie)}&lang=${encodeURIComponent(lang)}`;
    });
  });
} else {
  const urlParams = new URLSearchParams(window.location.search);
  const urlSerie = urlParams.get('serie');

  fetch('../../json/Mangá.json')
    .then(res => res.json())
    .then(mangaData => {
      const serieKey = Object.keys(mangaData).find(key => key.toLowerCase().includes(urlSerie.toLowerCase()));

      if (!serieKey) {
        container.innerHTML = `<p>Série "${urlSerie}" não encontrada no JSON.</p>`;
        return;
      }

      const serieData = mangaData[serieKey];
      const isSagaStructure = Object.keys(serieData).some(key => key.toLowerCase().includes('saga'));

      if (isSagaStructure) {
        container.innerHTML += `<h2>${serieKey} - Sagas</h2>`;
        const sagaList = document.createElement('div');
        sagaList.className = 'cards-container';

        Object.entries(serieData).forEach(([sagaName, sagaContent]) => {
          const sagaDiv = document.createElement('div');
          sagaDiv.classList.add('card');
          sagaDiv.innerHTML = `<span>${sagaName}</span>`;
          sagaDiv.addEventListener('click', () => renderArcs(serieKey, sagaName, sagaContent));
          sagaList.appendChild(sagaDiv);
        });

        container.appendChild(sagaList);
      } else {
        renderArcs(serieKey, null, serieData);
      }
    })
    .catch(err => {
      container.innerHTML = `<p>Erro ao carregar dados para a série: ${urlSerie}</p>`;
      console.error(err);
    });

  function renderArcs(serieKey, sagaName, arcs) {
    container.innerHTML = `<h2>${sagaName || serieKey} - Arcos</h2>`;
    const arcList = document.createElement('div');
    arcList.className = 'cards-container';

    Object.entries(arcs).forEach(([arcName, volumes]) => {
      const arcDiv = document.createElement('div');
      arcDiv.classList.add('card');

      const volKeys = Object.keys(volumes);
      const firstVolume = volumes[volKeys[0]];
      const cover = firstVolume?.Capa?.[0] || '';

      arcDiv.innerHTML = `<img src="src/img/Manga/${cover}" alt="Capa do arco"><span>${arcName}</span>`;

      arcDiv.addEventListener('click', () => showVolumes(serieKey, arcName, volumes));
      arcList.appendChild(arcDiv);
    });

    container.appendChild(arcList);
  }

  function showVolumes(serieKey, arcName, volumesData) {
    container.innerHTML = `<h2>${arcName} - Volumes</h2>`;
    const volList = document.createElement('div');
    volList.className = 'cards-container';

    Object.entries(volumesData).forEach(([volumeName, volumeData]) => {
      if (volumeName === 'Sagas') return;

      const cover = volumeData?.Capa?.[0] || '';
      const volDiv = document.createElement('div');
      volDiv.classList.add('card', 'volume-card');
      volDiv.innerHTML = `
        <img src="../src/img/Manga/${cover}" alt="Capa do volume">
        <span>${volumeName}</span>
      `;

      volDiv.addEventListener('click', () => showChapters(volumeData, volumeName));
      volList.appendChild(volDiv);
    });

    container.appendChild(volList);
  }

  function showChapters(volumeData, volumeName) {
    container.innerHTML = `<h2>${volumeName} - Capítulos</h2>`;
    const chapList = document.createElement('div');
    chapList.className = 'cards-container';

    listaCapitulos = [];

    Object.entries(volumeData).forEach(([chapterName, chapterData], index) => {
      if (chapterName === 'Capa') return;

      const cover = chapterData?.Capa || '';
      const chapDiv = document.createElement('div');
      chapDiv.classList.add('card', 'chapter-card');

      chapDiv.innerHTML = `
        <img src="../src/img/Manga/${cover}" alt="Capa do capítulo">
        <span>${chapterName}</span>
      `;

      chapDiv.addEventListener('click', () => {
        currentChapterData = chapterData;
        showPages(chapterData, index);
      });

      chapList.appendChild(chapDiv);
      listaCapitulos.push(chapterData);
    });

    container.appendChild(chapList);
  }

  function showPages(chapterData, indexCapitulo) {
    container.innerHTML = `<h2>Páginas</h2>`;

    currentChapterData = chapterData;

    if (typeof indexCapitulo === 'number') {
      capituloAtual = indexCapitulo;
    }

    // Cria seletor de idioma só aqui, pra não repetir em outras views
    container.prepend(createLanguageSelector());

    // Cria botão para alternar visualização simples/dupla
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = duasPaginas ? "Visualização Simples" : "Visualização Dupla";
    toggleBtn.style.margin = "10px auto";
    toggleBtn.style.display = "block";
    toggleBtn.style.padding = "8px 16px";
    toggleBtn.style.backgroundColor = "#007BFF";
    toggleBtn.style.color = "#fff";
    toggleBtn.style.border = "1px solid #0056b3";
    toggleBtn.style.cursor = "pointer";
    toggleBtn.onmouseenter = () => toggleBtn.style.backgroundColor = "#339CFF";
    toggleBtn.onmouseleave = () => toggleBtn.style.backgroundColor = "#007BFF";

    toggleBtn.onclick = () => {
      duasPaginas = !duasPaginas;
      showPages(currentChapterData, capituloAtual);
    };
    container.prepend(toggleBtn);

    const info = chapterData.Páginas;

    // Container para as páginas para aplicar CSS grid de duas colunas
    const pagesWrapper = document.createElement('div');
    pagesWrapper.classList.add('pages-wrapper');
    if (duasPaginas) {
      pagesWrapper.classList.add('duas-paginas');
    }

    for (let i = 1; i <= info.Número; i++) {
      const img = document.createElement('img');
      const imgPath = `../img/Manga/${info.Prefixo}${i}_${idioma}.${info.Extensão}`;

      img.src = imgPath;
      img.classList.add('page-img');
      img.onerror = () => {
        img.alt = 'Imagem não encontrada';
        img.style.border = '2px dashed red';
      };

      pagesWrapper.appendChild(img);
    }

    container.appendChild(pagesWrapper);

    criarSetasNavegacao();
  }
}

function criarSetasNavegacao() {
  const setasExistentes = document.querySelectorAll('.nav-arrow');
  setasExistentes.forEach(seta => seta.remove());

  if (!container.querySelector('h2') || !container.querySelector('h2').textContent.includes('Páginas')) {
    return;
  }

  const setaEsquerda = document.createElement("div");
  const setaDireita = document.createElement("div");

  setaEsquerda.innerHTML = "&#8592;";
  setaDireita.innerHTML = "&#8594;";

  setaEsquerda.classList.add("nav-arrow", "left");
  setaDireita.classList.add("nav-arrow", "right");

  setaEsquerda.onclick = voltarCapitulo;
  setaDireita.onclick = proximoCapitulo;

  const style = document.createElement("style");
  style.textContent = `
    .nav-arrow {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      font-size: 2rem;
      background-color: #007BFF;
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 0;
      cursor: pointer;
      z-index: 1000;
      user-select: none;
      transition: background-color 0.3s;
    }
    .nav-arrow:hover {
      background-color: #339CFF;
    }
    .nav-arrow.left {
      left: 10px;
    }
    .nav-arrow.right {
      right: 10px;
    }
    .pages-wrapper.duas-paginas {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      justify-items: center;
    }
    .page-img {
      max-width: 90vw;
      margin: 10px auto;
      display: block;
    }
    .pages-wrapper.duas-paginas img.page-img {
      width: 100%;
      max-width: 45vw;
    }
  `;

  if (!document.head.querySelector('style.duas-paginas-style')) {
    style.classList.add('duas-paginas-style');
    document.head.appendChild(style);
  }
  document.body.appendChild(setaEsquerda);
  document.body.appendChild(setaDireita);
}

function voltarCapitulo() {
  if (capituloAtual > 0) {
    capituloAtual--;
    carregarCapitulo(capituloAtual);
  }
}

function proximoCapitulo() {
  if (capituloAtual < listaCapitulos.length - 1) {
    capituloAtual++;
    carregarCapitulo(capituloAtual);
  }
}

function carregarCapitulo(numero) {
  if (listaCapitulos[numero]) {
    showPages(listaCapitulos[numero], numero);
  }
}
// uma vez Flamengo