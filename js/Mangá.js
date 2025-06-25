const container = document.getElementById('site-view');

// Quando o usuário clicar numa série
document.querySelectorAll('.series-card').forEach(card => {
  card.addEventListener('click', () => {
    const seriesName = card.querySelector('span').textContent;
    showArcs(seriesName);
  });
});

function showArcs(series) {
  container.innerHTML = `<h2>${series}</h2>`;
  const arcs = Object.keys(toaruData[series]);

  arcs.forEach(arc => {
    const arcDiv = document.createElement('div');
    arcDiv.textContent = arc;
    arcDiv.classList.add('arc');
    arcDiv.addEventListener('click', () => showVolumes(series, arc));
    container.appendChild(arcDiv);
  });
}

function showVolumes(series, arc) {
  container.innerHTML = `<h2>${arc}</h2>`;
  const volumes = Object.keys(toaruData[series][arc]);

  volumes.forEach(vol => {
    const volDiv = document.createElement('div');
    volDiv.textContent = vol;
    volDiv.classList.add('volume');
    volDiv.addEventListener('click', () => showChapters(series, arc, vol));
    container.appendChild(volDiv);
  });
}

function showChapters(series, arc, vol) {
  container.innerHTML = `<h2>${vol}</h2>`;
  const chapters = Object.keys(toaruData[series][arc][vol]);

  chapters.forEach(chap => {
    const chapDiv = document.createElement('div');
    chapDiv.textContent = chap;
    chapDiv.classList.add('chapter');
    chapDiv.addEventListener('click', () =>
      showPages(toaruData[series][arc][vol][chap])
    );
    container.appendChild(chapDiv);
  });
}

function showPages(pages) {
  container.innerHTML = `<h2>Páginas</h2>`;
  pages.forEach(src => {
    const img = document.createElement('img');
    img.src = `../../img/manga/${src}`; // caminho ajustável
    img.classList.add('page-img');
    container.appendChild(img);
  });
}
