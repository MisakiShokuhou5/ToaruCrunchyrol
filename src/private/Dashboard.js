    const firebaseConfig = {
            apiKey: "AIzaSyATseyMtu7fbn-vvJQKDNVwQE0uMH36trc",
            authDomain: "toarucrunchyrol-29ce4.firebaseapp.com",
            projectId: "toarucrunchyrol-29ce4",
            storageBucket: "toarucrunchyrol-29ce4.firebasestorage.app",
            messagingSenderId: "338286357239",
            appId: "1:338286357239:web:63747e65b6f8df534301f2",
            measurementId: "G-BHE2WLLMDX"
        };

        firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const auth = firebase.auth();
        let currentUser = null;

        // --- ELEMENTOS DO DOM ---
        const dom = {
            profileSelectorView: document.getElementById('profile-selector-view'),
            profileList: document.getElementById('profile-list'),
            manageProfilesMainButton: document.getElementById('manage-profiles-main-button'),
            dashboardView: document.getElementById('dashboard-view'),
            appView: document.getElementById('app-view'),
            headerProfileIcon: document.getElementById('header-profile-icon'),
            profileDropdown: document.getElementById('profile-dropdown'),
            logoutButton: document.getElementById('logout-button'),
            manageProfilesLink: document.getElementById('manage-profiles-link'),
            accountLink: document.getElementById('account-link')
        };

        // --- BANCO DE DADOS LOCAL (IMAGENS E SÉRIES) ---
        // Os caminhos aqui são relativos ao arquivo HTML. Se este arquivo está em 'src/private/',
        // o caminho '../img/' aponta para a pasta 'img/' na raiz do projeto, o que está correto.
        const imageAssets = {
            'toaru-kagaku-no-accelerator': { backdrop: '../img/anime-bg/toaru-kagaku-no-accelerator.jpg', logo: 'https://cdn.fstatic.com/media/movies/covers/2019/07/99995l_fdo4TMM.jpg' },
            'toaru-kagaku-no-railgun': { backdrop: '../img/anime-bg/Toaru-Kagaku-no-Railgun.jpeg', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6B9TNESP0IH7NtWFHIJTDhikEMM4xOyUZiw&s' },
            'toaru-kagaku-no-railgun-s': { backdrop: '../img/anime-bg/toaru kagaku no railgun s.jpg', logo: 'https://m.media-amazon.com/images/I/714UT2rp-cL._AC_UF1000,1000_QL80_.jpg' },
            'toaru-kagaku-no-railgun-t': { backdrop: '../img/anime-bg/toaru kagaku no railgun T.jpg', logo: 'https://cdn.fstatic.com/media/movies/covers/2019/12/103287l_DFcWvU6.jpg' },
            'toaru-majutsu-no-index': { backdrop: '../img/anime-bg/Toaru Majutsu no Index.jpg', logo: 'https://m.media-amazon.com/images/M/MV5BYjdiNTFjYmEtODAwOS00MWVkLTg5NjgtMTA4OWZkNjk1ZGQ0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg' },
            'toaru-majutsu-no-index-ii': { backdrop: '../img/anime-bg/Toaru Majutsu no Index 2.jpg', logo: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx8937-i3AW4QZxQHMy.jpg' },
            'toaru-majutsu-no-index-iii': { backdrop: '../img/anime-bg/Toaru Majutsu no Index 3.jpg', logo: 'https://cdn.fstatic.com/media/movies/covers/2019/12/toaruindex3_QUiaapk.jpg' }
        };
        const seriesDatabase = [
            { id: 'toaru-kagaku-no-accelerator', title: 'Toaru Kagaku no Accelerator', category: 'Especial', overview: 'Após proteger Last Order ao custo de grande parte de seu poder, Accelerator é arrastado para um novo conflito.' },
            { id: 'toaru-kagaku-no-railgun', title: 'Toaru Kagaku no Railgun', category: 'Spin-off: Railgun', overview: 'A história foca em Misaka Mikoto, a terceira esper mais forte da Cidade Acadêmica, e suas aventuras.' },
            { id: 'toaru-kagaku-no-railgun-s', title: 'Toaru Kagaku no Railgun S', category: 'Spin-off: Railgun', overview: 'Mikoto descobre um lado sombrio dos experimentos da cidade ao se deparar com clones de si mesma.' },
            { id: 'toaru-kagaku-no-railgun-t', title: 'Toaru Kagaku no Railgun T', category: 'Spin-off: Railgun', overview: 'Durante o Grande Festival Daihasei, forças externas e internas conspiram para mergulhar a cidade no caos.' },
            { id: 'toaru-majutsu-no-index', title: 'Toaru Majutsu no Index', category: 'Série Principal: Index', overview: 'Kamijou Touma encontra uma jovem freira chamada Index, que carrega 103.000 grimórios em sua mente.' },
            { id: 'toaru-majutsu-no-index-ii', title: 'Toaru Majutsu no Index II', category: 'Série Principal: Index', overview: 'As tensões entre o lado da ciência e da magia aumentam, e Touma se encontra novamente no centro de conflitos.' },
            { id: 'toaru-majutsu-no-index-iii', title: 'Toaru Majutsu no Index III', category: 'Série Principal: Index', overview: 'A Terceira Guerra Mundial se aproxima enquanto facções buscam poder, com Touma lutando para proteger a todos.' },
        ];

        // --- LÓGICA DA APLICAÇÃO ---

        function runProtectedPageLogic(user) {
            currentUser = user;
            loadProfileSelector();
            setupGlobalEventListeners();
        }

        /**
         * MODIFICAÇÃO: Carrega os perfis do Firestore e exibe na tela de seleção.
         */
        async function loadProfileSelector() {
            dom.manageProfilesMainButton.href = `./perfil.html?uid=${currentUser.uid}`;
            try {
                const profilesRef = db.collection('users').doc(currentUser.uid).collection('profiles');
                const snapshot = await profilesRef.orderBy('createdAt', 'asc').get();

                if (snapshot.empty) {
                    // Se não há perfis, redireciona para a página de criação/gerenciamento
                    alert("Nenhum perfil encontrado. Vamos criar o seu primeiro!");
                    window.location.href = `./perfil.html?uid=${currentUser.uid}`;
                    return;
                }

                dom.profileList.innerHTML = ''; // Limpa a lista
                snapshot.forEach(doc => {
                    const profile = { id: doc.id, ...doc.data() };
                    dom.profileList.innerHTML += `
                    <div class="profile-card" data-profile-img="${profile.imageUrl}">
                        <div class="profile-icon-bg">
                            <img src="${profile.imageUrl}" alt="${profile.name}">
                        </div>
                        <p class="profile-name">${profile.name}</p>
                    </div>
                `;
                });

                // Adiciona o listener de clique a cada card de perfil criado
                document.querySelectorAll('#profile-list .profile-card').forEach(card => {
                    card.addEventListener('click', handleProfileSelection);
                });

            } catch (error) {
                console.error("Erro ao carregar perfis:", error);
                alert("Não foi possível carregar os perfis. Verifique suas regras de segurança no Firebase.");
            }
        }

        function handleProfileSelection(event) {
            const card = event.currentTarget;
            const profileImg = card.dataset.profileImg;

            dom.headerProfileIcon.src = profileImg; // Atualiza o ícone do cabeçalho
            dom.profileSelectorView.style.opacity = '0';

            setTimeout(() => {
                dom.profileSelectorView.style.display = 'none';
                dom.dashboardView.classList.add('visible');
                initializeApp();
            }, 500);
        }

        function initializeApp() {
            // Define os links do dropdown com o UID do usuário
            dom.manageProfilesLink.href = `./perfil.html?uid=${currentUser.uid}`;
            dom.accountLink.href = `./conta.html?uid=${currentUser.uid}`;
            renderHomeView();
        }

        function renderHomeView() {
            const featuredAnime = seriesDatabase[Math.floor(Math.random() * seriesDatabase.length)];
            const featuredImages = imageAssets[featuredAnime.id] || {};

            const categories = [...new Set(seriesDatabase.map(a => a.category))];
            const carouselHTML = categories.map(category => {
                const animesInCategory = seriesDatabase.filter(a => a.category === category);
                return `
                <div class="category-row">
                    <h2 class="category-title">${category}</h2>
                    <div class="series-carousel">
                        <div class="series-list">
                            ${animesInCategory.map(anime => createSeriesCardHTML(anime)).join('')}
                        </div>
                    </div>
                </div>`;
            }).join('');

            dom.appView.innerHTML = `
            <section class="billboard">
                <img src="${featuredImages.backdrop}" class="billboard-backdrop">
                <div class="billboard-content">
                    <div class="billboard-title"><img src="${featuredImages.logo}" alt="${featuredAnime.title}"></div>
                    <p class="billboard-description">${featuredAnime.overview}</p>
                    <div class="billboard-actions">
                        <button class="btn btn-primary play-btn" data-series-id="${featuredAnime.id}" data-ep="1"><i class="fa-solid fa-play"></i> Assistir</button>
                    </div>
                </div>
            </section>
            <section class="catalog">
                <div class="category-row" id="continue-watching-row">
                    <h2 class="category-title">Continuar Assistindo</h2>
                    <div class="series-carousel"><div class="series-list"></div></div>
                </div>
                ${carouselHTML}
            </section>
        `;
            fetchAndRenderContinueWatching();
        }

        function createSeriesCardHTML(anime) {
            const images = imageAssets[anime.id] || {};
            return `<div class="series-card play-btn" data-series-id="${anime.id}" data-ep="1"><img src="${images.backdrop}" /></div>`;
        }

        async function fetchAndRenderContinueWatching() {
            const continueWatchingRow = document.getElementById('continue-watching-row');
            if (!continueWatchingRow) return;
            const seriesList = continueWatchingRow.querySelector('.series-list');

            const historyRef = db.collection('userWatchHistory').doc(currentUser.uid).collection('series');
            const snapshot = await historyRef.orderBy('lastWatchedTimestamp', 'desc').limit(10).get();

            if (snapshot.empty) {
                continueWatchingRow.style.display = 'none';
                return;
            }

            seriesList.innerHTML = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                // A imagem salva no Firestore já tem o caminho correto (ex: ../img/...)
                const progressPercent = data.duration > 0 ? (data.currentTime / data.duration) * 100 : 0;
                seriesList.innerHTML += `
                <div class="series-card continue-watching-card play-btn" data-series-id="${data.seriesId}" data-ep="${data.currentEpisode}">
                    <img src="${data.backdrop}" />
                    <div class="continue-info">EP ${data.currentEpisode}</div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                    </div>
                </div>`;
            });
            continueWatchingRow.style.display = 'block';
        }

        async function registerAnimeClick(seriesId, ep = 1) {
            const seriesData = seriesDatabase.find(s => s.id === seriesId);
            if (!seriesData) return;

            const historyRef = db.collection('userWatchHistory').doc(currentUser.uid).collection('series').doc(seriesId);

            const doc = await historyRef.get();
            if (doc.exists) {
                await historyRef.update({
                    lastWatchedTimestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                ep = doc.data().currentEpisode || ep;
            } else {
                await historyRef.set({
                    seriesId: seriesId,
                    title: seriesData.title,
                    backdrop: imageAssets[seriesId]?.backdrop || '', // Salva o caminho relativo correto
                    currentEpisode: 1,
                    currentTime: 0,
                    duration: 1410, // Duração placeholder em segundos (aprox. 23.5 min)
                    lastWatchedTimestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            window.open(`./src/player.html?uid=${currentUser.uid}&seriesId=${seriesId}&ep=${ep}`, '_blank');
        }

        function toggleProfileDropdown() {
            dom.profileDropdown.style.display = dom.profileDropdown.style.display === 'block' ? 'none' : 'block';
        }

        function handleLogout() {
            auth.signOut();
        }

        function setupGlobalEventListeners() {
            dom.headerProfileIcon.addEventListener('click', toggleProfileDropdown);
            dom.logoutButton.addEventListener('click', handleLogout);

            // Listener de eventos para os botões de play
            document.body.addEventListener('click', (e) => {
                const playButton = e.target.closest('.play-btn');
                if (playButton && currentUser) {
                    const seriesId = playButton.dataset.seriesId;
                    const ep = parseInt(playButton.dataset.ep, 10);
                    registerAnimeClick(seriesId, ep);
                }
            });
        }

        // ---- GATEKEEPER DE AUTENTICAÇÃO ----
        document.addEventListener('DOMContentLoaded', () => {
            const params = new URLSearchParams(window.location.search);
            const urlUid = params.get('uid');

            if (!urlUid) {
                window.location.href = '../index.html';
                return;
            }

            auth.onAuthStateChanged(user => {
                if (user && user.uid === urlUid) {
                    runProtectedPageLogic(user);
                } else {
                    window.location.href = '../../index.html';
                }
            });
        });