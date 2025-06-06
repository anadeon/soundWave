// Configuração da API Last.fm
const LASTFM_API_KEY = 'd8436827f588cef95bb6e696e62b0f86';
const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

// Classe para gerenciar chamadas da API Last.fm
class LastFMService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async makeRequest(method, params = {}) {
        const url = new URL(LASTFM_BASE_URL);
        url.searchParams.append('method', method);
        url.searchParams.append('api_key', this.apiKey);
        url.searchParams.append('format', 'json');

        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        try {
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro na API Last.fm:', error);
            return null;
        }
    }

    // Buscar artistas mais populares
    async getTopArtists(limit = 12) {
        return await this.makeRequest('chart.gettopartists', { limit });
    }

    // Buscar álbuns mais populares
    async getTopAlbums(limit = 12) {
        return await this.makeRequest('chart.gettopalbums', { limit });
    }

    // Buscar faixas mais populares
    async getTopTracks(limit = 12) {
        return await this.makeRequest('chart.gettoptracks', { limit });
    }

    // Buscar informações de um artista
    async getArtistInfo(artist) {
        return await this.makeRequest('artist.getinfo', { artist, lang: 'pt' });

    }

    // Buscar álbuns de um artista
    async getArtistAlbums(artist, limit = 12) {
        return await this.makeRequest('artist.gettopalbums', { artist, limit });
    }

    // Buscar informações de um álbum
    async getAlbumInfo(artist, album) {
        return await this.makeRequest('album.getinfo', { artist, album });
    }

    // Buscar faixas similares
    async getSimilarTracks(artist, track, limit = 12) {
        return await this.makeRequest('track.getsimilar', { artist, track, limit });
    }

    // Buscar por termo
    async searchArtists(query, limit = 12) {
        return await this.makeRequest('artist.search', { artist: query, limit });
    }

    async searchAlbums(query, limit = 12) {
        return await this.makeRequest('album.search', { album: query, limit });
    }

    async searchTracks(query, limit = 12) {
        return await this.makeRequest('track.search', { track: query, limit });
    }
}

// Inicializar serviço Last.fm
const lastfm = new LastFMService(LASTFM_API_KEY);

// Função para criar cards de música
function createMusicCard(item, type = 'album') {
    const card = document.createElement('div');
    card.className = 'card';

    let title, description, imageUrl;

    if (type === 'artist') {
        title = item.name;
        description = `${item.playcount ? item.playcount.toLocaleString() : 'N/A'} reproduções`;
        imageUrl = item.image && item.image.find(img => img.size === 'large')?.['#text'] || '';
    } else if (type === 'album') {
        title = item.name;
        description = item.artist?.name || item.artist || 'Artista desconhecido';
        imageUrl = item.image && item.image.find(img => img.size === 'large')?.['#text'] || '';
    } else if (type === 'track') {
        title = item.name;
        description = item.artist?.name || item.artist || 'Artista desconhecido';
        imageUrl = item.image && item.image.find(img => img.size === 'large')?.['#text'] || '';
    }

    card.innerHTML = `
                <div class="card-image" style="${imageUrl ? `background-image: url('${imageUrl}'); background-size: cover; background-position: center;` : ''}">
                    ${!imageUrl ? '🎵' : ''}
                    <button class="play-button">Sobre</button>
                </div>
                <div class="card-title">${title}</div>
                <div class="card-description">${description}</div>
            `;

    return card;
}

// Função para carregar dados e atualizar seções
async function loadMusicData() {
    try {
        // Mostrar loading
        showLoading();

        // Carregar diferentes tipos de dados
        const [topArtists, topAlbums, topTracks] = await Promise.all([
            lastfm.getTopArtists(),
            lastfm.getTopAlbums(),
            lastfm.getTopTracks()
        ]);

        // Atualizar seção "artistas mais escutados" com top artistas
        if (topArtists && topArtists.artists) {
            updateSection('recently-played', topArtists.artists.artist, 'artist');
        }

        // Atualizar seção "músicas mais escutadas" com top tracks
        if (topTracks && topTracks.tracks) {
            updateSection('made-for-you', topTracks.tracks.track, 'track');
        }

        // Atualizar seção "álbuns mais escutados" com top álbuns
        if (topAlbums && topAlbums.albums) {
            updateSection('trending', topAlbums.albums.album, 'album');
        }



        hideLoading();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        hideLoading();
    }
}

// Função para atualizar uma seção específica
function updateSection(sectionId, data, type) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const grid = section.querySelector('.cards-grid');
    if (!grid) return;

    // Limpar cards existentes
    grid.innerHTML = '';

    // Adicionar novos cards
    data.forEach(item => {
        const card = createMusicCard(item, type);
        grid.appendChild(card);

        // Adicionar event listeners
        addCardEventListeners(card);
    });
}

// Função para adicionar event listeners aos cards
function addCardEventListeners(card) {
    const playButton = card.querySelector('.play-button');
    playButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        const artistName = card.querySelector('.card-title')?.textContent;
        const musicName = card.querySelector('.card-title')?.textContent;
        if (!artistName) return;

        // Buscar info do artista
        const artistInfo = await lastfm.getArtistInfo(artistName);

        if (artistInfo?.artist?.bio?.summary) {
            showArtistSummary(artistName, artistInfo.artist.bio.summary);
        } else {
            showNotification(`Informações de "${artistName}" não encontradas.`);
        }
    });
}

function showArtistSummary(artist, summary) {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'artist-modal';

    modal.innerHTML = `
                <div class="modal-header">
                    <button class="modal-close" aria-label="Fechar modal">×</button>
                    <h2 class="artist-name">${artist}</h2>
                    <span class="artist-tag">Artista</span>
                </div>
                <div class="modal-content">
                    <p class="summary-text">${summary}</p>
                </div>
            `;

    // Adicionar ao DOM
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Animar entrada
    requestAnimationFrame(() => {
        overlay.classList.add('show');
        modal.classList.add('show');
    });

    // Event listeners
    const closeModal = () => {
        overlay.classList.remove('show');
        modal.classList.remove('show');

        setTimeout(() => {
            overlay.remove();
            modal.remove();
        }, 300);
    };

    // Fechar com botão X
    modal.querySelector('.modal-close').addEventListener('click', closeModal);

    // Fechar com botão Fechar
    modal.querySelector('[data-action="close"]').addEventListener('click', closeModal);

    // Botão Saber Mais (placeholder)
    modal.querySelector('[data-action="more"]').addEventListener('click', () => {
        alert('Redirecionaria para página do artista!');
    });

    // Fechar com clique no overlay
    overlay.addEventListener('click', closeModal);

    // Fechar com ESC
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    document.addEventListener('keydown', handleKeyDown);
}

// Função para mostrar loading
function showLoading() {
    document.querySelectorAll('.cards-grid').forEach(grid => {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #b3b3b3; padding: 40px;">Carregando músicas...</div>';
    });
}

// Função para esconder loading
function hideLoading() {
    // Loading será removido quando os dados forem carregados
}

// Função para mostrar notificações
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #1db954;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: 500;
                z-index: 1000;
                animation: slideIn 0.3s ease;
            `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Função de busca
async function performSearch(query) {
    if (!query.trim()) return;

    try {
        showLoading();

        const [artists, albums, tracks] = await Promise.all([
            lastfm.searchArtists(query, 6),
            lastfm.searchAlbums(query, 6),
            lastfm.searchTracks(query, 6)
        ]);

        // Atualizar seções com resultados da busca
        if (artists && artists.results && artists.results.artistmatches) {
            updateSection('recently-played', artists.results.artistmatches.artist, 'artist');
        }

        if (albums && albums.results && albums.results.albummatches) {
            updateSection('made-for-you', albums.results.albummatches.album, 'album');
        }

        if (tracks && tracks.results && tracks.results.trackmatches) {
            updateSection('trending', tracks.results.trackmatches.track, 'track');
        }

        hideLoading();
    } catch (error) {
        console.error('Erro na busca:', error);
        hideLoading();
    }
}

// Event listeners para interatividade
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar IDs às seções para facilitar a atualização
    const sections = document.querySelectorAll('.section');
    const sectionIds = ['recently-played', 'made-for-you', 'trending'];
    sections.forEach((section, index) => {
        if (sectionIds[index]) {
            section.id = sectionIds[index];
        }
    });

    // Event listeners para navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.nav-item.active').classList.remove('active');
            item.classList.add('active');

            // Carregar dados baseado na navegação
            const navText = item.textContent.trim();
            if (navText === 'Início') {
                loadMusicData();
            }
        });
    });

    // Event listeners para cards existentes
    document.querySelectorAll('.card').forEach(addCardEventListeners);

    // Event listeners para quick picks
    document.querySelectorAll('.quick-pick').forEach(pick => {
        pick.addEventListener('click', () => {
            const playlistName = pick.querySelector('.quick-pick-info').textContent;
            showNotification(`Abrindo: ${playlistName}`);
        });
    });

    // Adicionar campo de busca (exemplo simples)
    const topBar = document.querySelector('.top-bar');
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = 'display: flex; align-items: center; gap: 12px;';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar artistas, álbuns ou músicas...';
    searchInput.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                padding: 8px 16px;
                color: white;
                width: 300px;
                outline: none;
            `;

    const searchButton = document.createElement('button');
    searchButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="#fff">
                <g transform="scale(5.12,5.12)">
                    <path d="M21,3c-9.39844,0 -17,7.60156 -17,17c0,9.39844 7.60156,17 17,17c3.35547,0 6.46094,-0.98437 9.09375,-2.65625l12.28125,12.28125l4.25,-4.25l-12.125,-12.09375c2.17969,-2.85937 3.5,-6.40234 3.5,-10.28125c0,-9.39844 -7.60156,-17 -17,-17zM21,7c7.19922,0 13,5.80078 13,13c0,7.19922 -5.80078,13 -13,13c-7.19922,0 -13,-5.80078 -13,-13c0,-7.19922 5.80078,-13 13,-13z" />
                </g>
                </svg>
                `;
    searchButton.style.cssText = `
                background: #1db954;
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);

    // Inserir campo de busca no meio da top bar
    const navButtons = topBar.querySelector('.nav-buttons');
    const userProfile = topBar.querySelector('.user-profile');
    topBar.insertBefore(searchContainer, userProfile);

    // Event listeners para busca
    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });

    // Carregar dados iniciais (remova se não tiver API key)
    // if (LASTFM_API_KEY !== 'SUA_API_KEY_AQUI') {
    loadMusicData();
    // } else {
    //     console.log('Configure sua API key do Last.fm para carregar dados reais');
    // }
});

// Adicionar CSS para animações
const style = document.createElement('style');
style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            input:focus {
                background: rgba(255, 255, 255, 0.15) !important;
                border-color: #1db954 !important;
            }
        `;
document.head.appendChild(style);