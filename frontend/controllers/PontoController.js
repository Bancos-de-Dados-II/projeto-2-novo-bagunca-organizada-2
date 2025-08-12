import Ponto from '../models/Ponto.js';
import pontoService from '../services/PontoService.js';

/**
 * Controlador principal da aplicação
 */
class PontoController {
    constructor() {
        this.markers = new Map();
        this.editando = false;
        this.chartPorTipo = null;
        this.chartGeografico = null;
        this.chartCrescimento = null;

        this.init();
    }

    /**
     * Inicializa a aplicação
     */
    async init() {
        this.setupEventListeners();
        this.initMapa();
        await this.carregarPontos();
    }

    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        // Botões principais
        document.getElementById('btnNovoPonto').addEventListener('click', () => this.abrirModalNovoPonto());
        document.getElementById('btnAtualizarLista').addEventListener('click', () => this.carregarPontos());
        document.getElementById('btnDashboard').addEventListener('click', () => this.abrirDashboard());
        document.getElementById('btnAtualizarDashboard').addEventListener('click', () => this.atualizarDashboard());

        // Formulário
        document.getElementById('formPonto').addEventListener('submit', (e) => this.salvarPonto(e));

        // Modal
        document.getElementById('modalPonto').addEventListener('hidden.bs.modal', () => this.limparFormulario());
        document.getElementById('modalPonto').addEventListener('shown.bs.modal', () => {
            if (this.miniMapa) {
                this.miniMapa.invalidateSize();
                if (this.editando && this.pontoSelecionado) {
                    this.atualizarMiniMapa();
                }
            }
        });

        // Confirmação de exclusão
        document.getElementById('btnConfirmarExclusao').addEventListener('click', () => this.confirmarExclusao());

        // Inputs de coordenadas
        document.getElementById('inputLatitude').addEventListener('input', () => this.atualizarMiniMapa());
        document.getElementById('inputLongitude').addEventListener('input', () => this.atualizarMiniMapa());

        // Busca de endereço
        document.getElementById('btnBuscarEndereco').addEventListener('click', () => this.buscarEndereco());
        document.getElementById('inputEndereco').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.buscarEndereco();
            }
        });

        // Busca textual
        document.getElementById('btnBuscar').addEventListener('click', () => this.buscarPontos());
        document.getElementById('btnLimparBusca').addEventListener('click', () => this.limparBusca());
        document.getElementById('inputBusca').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.buscarPontos();
            }
        });
    }

    /**
     * Inicializa os mapas
     */
    initMapa() {
        // Mapa principal - inicia no centro do Brasil temporariamente
        this.mapa = L.map('mapa').setView([-15.7801, -47.9292], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.mapa);

        // Tenta obter localização do usuário imediatamente
        this.obterLocalizacaoUsuario();

        // Mini mapa do modal - também será centralizado na localização do usuário
        this.miniMapa = L.map('miniMapa').setView([-15.7801, -47.9292], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.miniMapa);

        this.miniMapa.on('click', (e) => {
            document.getElementById('inputLatitude').value = e.latlng.lat.toFixed(6);
            document.getElementById('inputLongitude').value = e.latlng.lng.toFixed(6);
            this.atualizarMiniMapa();
        });
    }

    /**
     * Obtém localização do usuário e centraliza o mapa
     */
    obterLocalizacaoUsuario() {
        if (navigator.geolocation) {
            // Mostra feedback visual que está obtendo localização
            this.showAlert('📍 Obtendo sua localização...', 'info');
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Armazena localização do usuário para uso posterior
                    this.localizacaoUsuario = { lat, lng };
                    
                    // Centraliza o mapa na localização do usuário com zoom adequado
                    this.mapa.setView([lat, lng], 15);
                    
                    // Adiciona marker da localização atual com ícone personalizado
                    const userIcon = L.divIcon({
                        html: '<i class="fas fa-user-circle text-primary" style="font-size: 28px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);"></i>',
                        iconSize: [28, 28],
                        className: 'user-location-marker'
                    });
                    
                    this.userLocationMarker = L.marker([lat, lng], { icon: userIcon })
                        .addTo(this.mapa)
                        .bindPopup(`
                            <div class="text-center">
                                <i class="fas fa-location-arrow text-primary mb-2"></i>
                                <br><b>Sua localização atual</b>
                                <br><small class="text-muted">${lat.toFixed(6)}, ${lng.toFixed(6)}</small>
                                <br><button class="btn btn-sm btn-primary mt-2" onclick="pontoController.centralizarNaLocalizacaoUsuario()">
                                    <i class="fas fa-crosshairs me-1"></i>Centralizar aqui
                                </button>
                            </div>
                        `)
                        .openPopup();
                    
                    // Também centraliza o mini mapa na localização do usuário
                    this.miniMapa.setView([lat, lng], 15);
                        
                    console.log('✅ Localização do usuário obtida:', lat, lng);
                    this.showAlert('✅ Localização obtida com sucesso!', 'success');
                },
                (error) => {
                    let errorMessage = 'Não foi possível obter sua localização';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Permissão de localização negada. Por favor, permita o acesso à localização para uma melhor experiência.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Localização indisponível no momento.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Timeout ao obter localização. Tente novamente.';
                            break;
                    }
                    
                    console.warn('⚠️ Erro de geolocalização:', error.message);
                    this.showAlert(`⚠️ ${errorMessage}`, 'warning');
                    // Mantém o centro padrão do Brasil
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000, // Aumentado para 15 segundos
                    maximumAge: 300000 // 5 minutos (reduzido para ser mais atual)
                }
            );
        } else {
            console.warn('⚠️ Geolocalização não suportada pelo navegador');
            this.showAlert('⚠️ Seu navegador não suporta geolocalização', 'warning');
        }
    }

    /**
     * Centraliza o mapa na localização do usuário
     */
    centralizarNaLocalizacaoUsuario() {
        if (this.localizacaoUsuario) {
            this.mapa.setView([this.localizacaoUsuario.lat, this.localizacaoUsuario.lng], 15);
            if (this.userLocationMarker) {
                this.userLocationMarker.openPopup();
            }
        } else {
            this.showAlert('📍 Obtendo localização novamente...', 'info');
            this.obterLocalizacaoUsuario();
        }
    }

    /**
     * Usa localização atual para novo ponto
     */
    usarMinhaLocalizacao() {
        if (this.localizacaoUsuario) {
            document.getElementById('inputLatitude').value = this.localizacaoUsuario.lat.toFixed(6);
            document.getElementById('inputLongitude').value = this.localizacaoUsuario.lng.toFixed(6);
            this.atualizarMiniMapa();
            this.showAlert('✅ Localização atual aplicada!', 'success');
        } else {
            this.showAlert('📍 Obtendo sua localização...', 'info');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    this.localizacaoUsuario = { lat, lng };
                    
                    document.getElementById('inputLatitude').value = lat.toFixed(6);
                    document.getElementById('inputLongitude').value = lng.toFixed(6);
                    this.atualizarMiniMapa();
                    this.showAlert('✅ Localização atual aplicada!', 'success');
                },
                (error) => {
                    this.showAlert('⚠️ Não foi possível obter sua localização', 'warning');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        }
    }

    /**
     * Busca endereços usando Nominatim (OpenStreetMap)
     */
    async buscarEndereco() {
        const endereco = document.getElementById('inputEndereco').value.trim();
        if (!endereco) {
            this.showAlert('Digite um endereço para buscar', 'warning');
            return;
        }

        const resultadosContainer = document.getElementById('resultadosBusca');
        
        try {
            resultadosContainer.innerHTML = '<div class="dropdown-item text-center"><i class="fas fa-spinner fa-spin"></i> Buscando...</div>';
            resultadosContainer.style.display = 'block';

            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=5&addressdetails=1&countrycodes=br`);
            const resultados = await response.json();

            if (resultados.length === 0) {
                resultadosContainer.innerHTML = '<div class="dropdown-item text-muted">Nenhum resultado encontrado</div>';
                return;
            }

            resultadosContainer.innerHTML = resultados.map(resultado => `
                <button type="button" class="dropdown-item endereco-resultado" 
                        data-lat="${resultado.lat}" 
                        data-lng="${resultado.lon}"
                        data-endereco="${resultado.display_name}">
                    <div>
                        <strong>${resultado.display_name.split(',')[0]}</strong>
                        <br>
                        <small class="text-muted">${resultado.display_name}</small>
                    </div>
                </button>
            `).join('');

            resultadosContainer.querySelectorAll('.endereco-resultado').forEach(btn => {
                btn.addEventListener('click', () => {
                    const lat = parseFloat(btn.dataset.lat);
                    const lng = parseFloat(btn.dataset.lng);
                    const enderecoCompleto = btn.dataset.endereco;

                    document.getElementById('inputLatitude').value = lat.toFixed(6);
                    document.getElementById('inputLongitude').value = lng.toFixed(6);
                    document.getElementById('inputEndereco').value = enderecoCompleto;

                    this.atualizarMiniMapa();

                    resultadosContainer.style.display = 'none';
                });
            });

        } catch (error) {
            console.error('Erro ao buscar endereço:', error);
            resultadosContainer.innerHTML = '<div class="dropdown-item text-danger">Erro ao buscar endereço</div>';
        }
    }

    /**
     * Busca pontos usando full-text search
     */
    async buscarPontos() {
        const query = document.getElementById('inputBusca').value.trim();
        
        if (!query) {
            await this.carregarPontos();
            return;
        }

        try {
            this.showLoading(true);
            
            const response = await fetch(`/api/buscar?q=${encodeURIComponent(query)}`);
            const resultado = await response.json();
            
            if (!resultado.success) {
                throw new Error(resultado.message);
            }

            this.pontos = resultado.data.map(pontoData => new Ponto(pontoData));
            this.renderizarListaPontos();
            this.renderizarMarkers();
            
            document.getElementById('btnLimparBusca').style.display = 'inline-block';
            this.showAlert(`${resultado.total} ponto(s) encontrado(s) para "${query}"`, 'success');
            
        } catch (error) {
            console.error('Erro ao buscar pontos:', error);
            this.showAlert('Erro ao buscar pontos: ' + error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Limpa busca e recarrega todos os pontos
     */
    async limparBusca() {
        document.getElementById('inputBusca').value = '';
        document.getElementById('btnLimparBusca').style.display = 'none';
        await this.carregarPontos();
    }

    /**
     * Carrega todos os pontos da API
     */
    async carregarPontos() {
        try {
            this.showLoading(true);
            this.pontos = await pontoService.listarPontos();
            this.renderizarListaPontos();
            this.renderizarMarkers();
            this.showAlert('Pontos carregados com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao carregar pontos:', error);
            this.showAlert('Erro ao carregar pontos: ' + error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Renderiza a lista de pontos na sidebar
     */
    renderizarListaPontos() {
        const container = document.getElementById('listaPontos');
        const nenhumPonto = document.getElementById('nenhumPonto');

        if (this.pontos.length === 0) {
            container.innerHTML = '';
            nenhumPonto.style.display = 'block';
            return;
        }

        nenhumPonto.style.display = 'none';
        container.innerHTML = this.pontos.map(ponto => `
            <div class="list-group-item ponto-item fade-in" data-id="${ponto._id}">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1" onclick="pontoController.selecionarPonto('${ponto._id}')">
                        <div class="d-flex align-items-center mb-2">
                            <span class="tipo-icon tipo-${ponto.tipo.toLowerCase().replace(/\s+/g, '-')}">
                                ${this.getTipoIcon(ponto.tipo)}
                            </span>
                            <h6 class="mb-0">${ponto.nome}</h6>
                        </div>
                        <div class="mb-2">
                            <span class="badge bg-primary">${ponto.tipo}</span>
                        </div>
                        ${ponto.endereco ? `<small class="text-muted d-block"><i class="fas fa-map-marker-alt me-1"></i>${ponto.endereco}</small>` : ''}
                        ${ponto.descricao ? `<small class="text-muted d-block">${ponto.descricao.substring(0, 80)}${ponto.descricao.length > 80 ? '...' : ''}</small>` : ''}
                    </div>
                    <div class="ponto-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="pontoController.editarPonto('${ponto._id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="pontoController.confirmarExclusaoPonto('${ponto._id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Renderiza os markers no mapa
     */
    renderizarMarkers() {
    // Remove todos os marcadores existentes
    this.markers.forEach(marker => this.mapa.removeLayer(marker));
    this.markers.clear();

    // Adiciona novos marcadores para cada ponto
    this.pontos.forEach(ponto => {
        const [lat, lng] = ponto.getLatLng();
        const customIcon = this.getCustomMapIcon(ponto.tipo);

        const marker = L.marker([lat, lng], { icon: customIcon })
            .bindPopup(this.createPopupContent(ponto))
            .addTo(this.mapa);

        this.markers.set(ponto._id, marker);
        marker.on('click', () => this.selecionarPonto(ponto._id));
    });

    // Ajusta o zoom para mostrar todos os pontos
    if (this.pontos.length > 0) {
        const group = new L.featureGroup(Array.from(this.markers.values()));
        this.mapa.fitBounds(group.getBounds().pad(0.1));
    }
}


createPopupContent(ponto) {
        const iconClass = this.getTipoIcon(ponto.tipo);
        const tipoClass = ponto.tipo.toLowerCase().replace(/\s+/g, '-');
        return `
            <div class="popup-content">
                <div class="d-flex align-items-center mb-2">
                    <span class="tipo-icon tipo-${tipoClass} me-2">
                        <i class="${iconClass}"></i>
                    </span>
                    <h6 class="mb-0">${ponto.nome}</h6>
                </div>
                <div class="mb-2">
                    <span class="badge bg-primary">${ponto.tipo}</span>
                </div>
                <p>${ponto.descricao || 'Sem descrição.'}</p>
                <p class="text-muted"><i class="fas fa-map-marker-alt me-1"></i>${ponto.endereco || 'Sem endereço.'}</p>
                <div class="popup-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="pontoController.editarPonto('${ponto._id}')">Editar</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="pontoController.confirmarExclusaoPonto('${ponto._id}')">Excluir</button>
                </div>
            </div>
        `;
    }

    /**
     * Seleciona um ponto na lista e no mapa
     */
    selecionarPonto(id) {
        document.querySelectorAll('.ponto-item').forEach(item => item.classList.remove('active'));

        const elemento = document.querySelector(`[data-id="${id}"]`);
        if (elemento) {
            elemento.classList.add('active');
            this.pontoSelecionado = this.pontos.find(p => p._id === id);

            if (this.pontoSelecionado) {
                const [lat, lng] = this.pontoSelecionado.getLatLng();
                this.mapa.setView([lat, lng], 15);

                const marker = this.markers.get(id);
                if (marker) {
                    marker.openPopup();
                }
            }
        }
    }

    /**
     * Abre modal para novo ponto
     */
    abrirModalNovoPonto() {
        this.editando = false;
        this.pontoSelecionado = null;
        document.getElementById('modalTitle').textContent = 'Novo Ponto';
        this.limparFormulario();

        const modal = new bootstrap.Modal(document.getElementById('modalPonto'));
        modal.show();
    }

    /**
     * Abre modal para editar ponto
     */
    editarPonto(id) {
        const ponto = this.pontos.find(p => p._id === id);
        if (!ponto) return;

        this.editando = true;
        this.pontoSelecionado = ponto;

        document.getElementById('modalTitle').textContent = 'Editar Ponto';

        document.getElementById('inputNome').value = ponto.nome;
        document.getElementById('inputTipo').value = ponto.tipo;
        document.getElementById('inputDescricao').value = ponto.descricao || '';
        document.getElementById('inputEndereco').value = ponto.endereco || '';

        const [lat, lng] = ponto.getLatLng();
        document.getElementById('inputLatitude').value = lat;
        document.getElementById('inputLongitude').value = lng;

        const modal = new bootstrap.Modal(document.getElementById('modalPonto'));
        modal.show();
    }

    /**
     * Salva ponto (criar ou atualizar)
     */
    async salvarPonto(e) {
        e.preventDefault();

        try {
            const dados = {
                nome: document.getElementById('inputNome').value.trim(),
                tipo: document.getElementById('inputTipo').value,
                descricao: document.getElementById('inputDescricao').value.trim(),
                endereco: document.getElementById('inputEndereco').value.trim(),
                localizacao: {
                    type: 'Point',
                    coordinates: [
                        parseFloat(document.getElementById('inputLongitude').value),
                        parseFloat(document.getElementById('inputLatitude').value)
                    ]
                }
            };

            const ponto = new Ponto(dados);
            const validation = ponto.validate();

            if (!validation.valid) {
                this.showAlert(`Dados inválidos: ${validation.errors.join(', ')}`, 'danger');
                return;
            }

            let resultado;
            if (this.editando && this.pontoSelecionado) {
                resultado = await pontoService.atualizarPonto(this.pontoSelecionado._id, ponto);
                this.showAlert('Ponto atualizado com sucesso!', 'success');
            } else {
                resultado = await pontoService.criarPonto(ponto);
                this.showAlert('Ponto criado com sucesso!', 'success');
            }

            const modal = bootstrap.Modal.getInstance(document.getElementById('modalPonto'));
            modal.hide();

            await this.carregarPontos();

        } catch (error) {
            console.error('Erro ao salvar ponto:', error);
            this.showAlert('Erro ao salvar ponto: ' + error.message, 'danger');
        }
    }

    /**
     * Confirma exclusão de ponto
     */
    confirmarExclusaoPonto(id) {
        const ponto = this.pontos.find(p => p._id === id);
        if (!ponto) return;

        this.pontoSelecionado = ponto;
        document.getElementById('nomeExclusao').textContent = ponto.nome;

        const modal = new bootstrap.Modal(document.getElementById('modalConfirmarExclusao'));
        modal.show();
    }

    /**
     * Executa exclusão do ponto
     */
    async confirmarExclusao() {
        if (!this.pontoSelecionado) return;

        try {
            await pontoService.deletarPonto(this.pontoSelecionado._id);

            const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarExclusao'));
            modal.hide();

            this.showAlert('Ponto excluído com sucesso!', 'success');

            await this.carregarPontos();

        } catch (error) {
            console.error('Erro ao excluir ponto:', error);
            this.showAlert('Erro ao excluir ponto: ' + error.message, 'danger');
        }
    }

    /**
     * Atualiza mini mapa com as coordenadas dos inputs
     */
    atualizarMiniMapa() {
        const lat = parseFloat(document.getElementById('inputLatitude').value);
        const lng = parseFloat(document.getElementById('inputLongitude').value);

        if (!isNaN(lat) && !isNaN(lng) && this.miniMapa) {
            this.miniMapa.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    this.miniMapa.removeLayer(layer);
                }
            });

            L.marker([lat, lng]).addTo(this.miniMapa);
            this.miniMapa.setView([lat, lng], 15);
        }
    }

    /**
     * Limpa formulário
     */
    limparFormulario() {
        document.getElementById('formPonto').reset();
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        document.querySelectorAll('.invalid-feedback').forEach(el => el.remove());

        if (this.miniMapa) {
            this.miniMapa.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    this.miniMapa.removeLayer(layer);
                }
            });
        }
    }

    /**
     * Exibe/oculta loading
     */
    showLoading(show) {
        const loading = document.getElementById('loadingPontos');
        const lista = document.getElementById('listaPontos');

        if (show) {
            loading.style.display = 'block';
            lista.style.display = 'none';
        } else {
            loading.style.display = 'none';
            lista.style.display = 'block';
        }
    }

    /**
     * Exibe alerta com tempo
     */
    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        const alertId = 'alert-' + Date.now();

        const alertHTML = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        alertContainer.insertAdjacentHTML('beforeend', alertHTML);

        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                alertElement.remove();
            }
        }, 3000); 
    }

/**
 * Retorna a classe Font Awesome para o tipo de ponto
 */
getTipoIcon(tipo) {
    const icons = {
        'Roupas e Acessórios': 'fas fa-tshirt',
        'Casa e Decoração': 'fas fa-couch',
        'Cultura': 'fas fa-book-open',
        'Alimentos': 'fas fa-utensils',
        'Outros': 'fas fa-box-open'
    };
    return icons[tipo] || icons['Outros'];
}

/**
 * Cria um ícone customizado para o Leaflet com base no tipo
 */
getCustomMapIcon(tipo) {
    const iconClass = this.getTipoIcon(tipo);

    return L.divIcon({
        className: 'custom-fa-icon',
        html: `<i class="${iconClass}" style="font-size:20px; color:#007bff;"></i>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
}

renderizarListaPontos() {
    const container = document.getElementById('listaPontos');
    const nenhumPonto = document.getElementById('nenhumPonto');

    if (this.pontos.length === 0) {
        container.innerHTML = '';
        nenhumPonto.style.display = 'block';
        return;
    }

    nenhumPonto.style.display = 'none';
    container.innerHTML = this.pontos.map(ponto => {
        const iconClass = this.getTipoIcon(ponto.tipo);
        const tipoClass = ponto.tipo.toLowerCase().replace(/\s+/g, '-');
        return `
            <div class="list-group-item ponto-item fade-in" data-id="${ponto._id}">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1" onclick="pontoController.selecionarPonto('${ponto._id}')">
                        <div class="d-flex align-items-center mb-2">
                            <span class="tipo-icon tipo-${tipoClass}">
                                <i class="${iconClass}"></i>
                            </span>
                            <h6 class="mb-0">${ponto.nome}</h6>
                        </div>
                        <div class="mb-2">
                            <span class="badge bg-primary">${ponto.tipo}</span>
                        </div>
                        ${ponto.endereco ? `<small class="text-muted d-block"><i class="fas fa-map-marker-alt me-1"></i>${ponto.endereco}</small>` : ''}
                        ${ponto.descricao ? `<small class="text-muted d-block">${ponto.descricao.substring(0, 80)}${ponto.descricao.length > 80 ? '...' : ''}</small>` : ''}
                    </div>
                    <div class="ponto-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="pontoController.editarPonto('${ponto._id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="pontoController.confirmarExclusaoPonto('${ponto._id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}


    /**
     * Abre modal do dashboard
     */
    async abrirDashboard() {
        const modal = new bootstrap.Modal(document.getElementById('modalDashboard'));
        modal.show();
        await this.atualizarDashboard();
    }

    /**
     * Atualiza dados do dashboard
     */
    async atualizarDashboard() {
        try {
            const response = await fetch('/api/estatisticas');
            const resultado = await response.json();

            if (!resultado.success) {
                throw new Error(resultado.message);
            }

            const { pontosPorTipo, pontosPorMes, distribuicaoGeografica, totalPontos, pontosRecentes } = resultado.data;

            document.getElementById('totalPontos').textContent = totalPontos;
            document.getElementById('tipoMaisComum').textContent = pontosPorTipo[0]?.total ? `${pontosPorTipo[0]._id} (${pontosPorTipo[0].total})` : 'N/A';
            document.getElementById('regiaoMaior').textContent = distribuicaoGeografica[0]?.total ? `${distribuicaoGeografica[0]._id} (${distribuicaoGeografica[0].total})` : 'N/A';
            
            const mesAtual = new Date().getMonth() + 1;
            const anoAtual = new Date().getFullYear();
            const crescimentoMesAtual = pontosPorMes.find(item => item._id.mes === mesAtual && item._id.ano === anoAtual);
            document.getElementById('crescimentoMes').textContent = crescimentoMesAtual?.total || 0;

            this.renderizarGraficos(pontosPorTipo, distribuicaoGeografica, pontosPorMes);
            this.renderizarPontosRecentes(pontosRecentes);

        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            this.showAlert('Erro ao carregar dashboard: ' + error.message, 'danger');
        }
    }

/**
     * Renderiza os gráficos do dashboard
     */
    renderizarGraficos(pontosPorTipo, distribuicaoGeografica, pontosPorMes) {
        if (this.chartPorTipo) {
            this.chartPorTipo.destroy();
        }
        if (this.chartGeografico) {
            this.chartGeografico.destroy();
        }
        if (this.chartCrescimento) {
            this.chartCrescimento.destroy();
        }

        const ctxTipo = document.getElementById('graficoPorTipo').getContext('2d');
        this.chartPorTipo = new Chart(ctxTipo, {
            type: 'doughnut',
            data: {
                labels: pontosPorTipo.map(item => item._id),
                datasets: [{
                    data: pontosPorTipo.map(item => item.total),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        const ctxGeo = document.getElementById('graficoGeografico').getContext('2d');
        this.chartGeografico = new Chart(ctxGeo, {
            type: 'bar',
            data: {
                labels: distribuicaoGeografica.map(item => item._id),
                datasets: [{
                    label: 'Pontos por Região',
                    data: distribuicaoGeografica.map(item => item.total),
                    backgroundColor: '#36A2EB'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        const ctxCrescimento = document.getElementById('graficoCrescimento').getContext('2d');
        const mesesOrdenados = pontosPorMes.reverse();
        
        this.chartCrescimento = new Chart(ctxCrescimento, {
            type: 'line',
            data: {
                labels: mesesOrdenados.map(item => `${item._id.mes}/${item._id.ano}`),
                datasets: [{
                    label: 'Pontos Cadastrados',
                    data: mesesOrdenados.map(item => item.total),
                    borderColor: '#4BC0C0',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Renderiza lista de pontos recentes
     */
    renderizarPontosRecentes(pontosRecentes) {
        const container = document.getElementById('pontosRecentes');
        
        if (pontosRecentes.length === 0) {
            container.innerHTML = '<div class="text-center text-muted p-3">Nenhum ponto cadastrado ainda</div>';
            return;
        }

        container.innerHTML = pontosRecentes.map(ponto => `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${ponto.nome}</h6>
                        <span class="badge bg-primary">${ponto.tipo}</span>
                    </div>
                    <small class="text-muted">${new Date(ponto.createdAt).toLocaleDateString('pt-BR')}</small>
                </div>
            </div>
        `).join('');
    }
}

const pontoController = new PontoController();

window.pontoController = pontoController;