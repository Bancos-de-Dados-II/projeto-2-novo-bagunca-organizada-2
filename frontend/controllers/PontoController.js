import Ponto from '../models/Ponto.js';
import pontoService from '../services/PontoService.js';

/**
 * Controlador principal da aplicação
 */
class PontoController {
    constructor() {
        this.pontos = [];
        this.pontoSelecionado = null;
        this.mapa = null;
        this.miniMapa = null;
        this.markers = new Map();
        this.editando = false;
        
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
        
        // Formulário
        document.getElementById('formPonto').addEventListener('submit', (e) => this.salvarPonto(e));
        
        // Modal
        document.getElementById('modalPonto').addEventListener('hidden.bs.modal', () => this.limparFormulario());
        
        // Confirmação de exclusão
        document.getElementById('btnConfirmarExclusao').addEventListener('click', () => this.confirmarExclusao());
        
        // Inputs de coordenadas
        document.getElementById('inputLatitude').addEventListener('input', () => this.atualizarMiniMapa());
        document.getElementById('inputLongitude').addEventListener('input', () => this.atualizarMiniMapa());
    }

    /**
     * Inicializa os mapas
     */
    initMapa() {
        // Mapa principal
        this.mapa = L.map('mapa').setView([-15.7801, -47.9292], 4); // Centro do Brasil
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.mapa);

        // Mini mapa do modal
        setTimeout(() => {
            this.miniMapa = L.map('miniMapa').setView([-15.7801, -47.9292], 10);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.miniMapa);

            // Click no mini mapa para definir localização
            this.miniMapa.on('click', (e) => {
                document.getElementById('inputLatitude').value = e.latlng.lat.toFixed(6);
                document.getElementById('inputLongitude').value = e.latlng.lng.toFixed(6);
                this.atualizarMiniMapa();
            });
        }, 500);
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
        // Limpa markers existentes
        this.markers.forEach(marker => this.mapa.removeLayer(marker));
        this.markers.clear();

        // Adiciona novos markers
        this.pontos.forEach(ponto => {
            const [lat, lng] = ponto.getLatLng();
            const marker = L.marker([lat, lng])
                .bindPopup(this.createPopupContent(ponto))
                .addTo(this.mapa);
            
            this.markers.set(ponto._id, marker);
            
            // Click no marker
            marker.on('click', () => this.selecionarPonto(ponto._id));
        });

        // Ajusta o zoom para mostrar todos os pontos
        if (this.pontos.length > 0) {
            const group = new L.featureGroup(Array.from(this.markers.values()));
            this.mapa.fitBounds(group.getBounds().pad(0.1));
        }
    }

    /**
     * Cria o conteúdo do popup do marker
     */
    createPopupContent(ponto) {
        return `
            <div class="popup-content">
                <h6>${ponto.nome}</h6>
                <span class="badge bg-primary">${ponto.tipo}</span>
                ${ponto.endereco ? `<p><i class="fas fa-map-marker-alt me-1"></i>${ponto.endereco}</p>` : ''}
                ${ponto.descricao ? `<p>${ponto.descricao}</p>` : ''}
                <div class="popup-actions">
                    <button class="btn btn-sm btn-primary" onclick="pontoController.editarPonto('${ponto._id}')">
                        <i class="fas fa-edit me-1"></i>Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="pontoController.confirmarExclusaoPonto('${ponto._id}')">
                        <i class="fas fa-trash me-1"></i>Excluir
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Seleciona um ponto na lista e no mapa
     */
    selecionarPonto(id) {
        // Remove seleção anterior
        document.querySelectorAll('.ponto-item').forEach(item => item.classList.remove('active'));
        
        // Seleciona novo ponto
        const elemento = document.querySelector(`[data-id="${id}"]`);
        if (elemento) {
            elemento.classList.add('active');
            this.pontoSelecionado = this.pontos.find(p => p._id === id);
            
            // Centraliza no mapa
            if (this.pontoSelecionado) {
                const [lat, lng] = this.pontoSelecionado.getLatLng();
                this.mapa.setView([lat, lng], 15);
                
                // Abre popup
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
        document.getElementById('modalTitle').textContent = 'Novo Ponto';
        this.limparFormulario();
        
        const modal = new bootstrap.Modal(document.getElementById('modalPonto'));
        modal.show();
        
        // Inicializa mini mapa quando modal abrir
        setTimeout(() => {
            if (this.miniMapa) {
                this.miniMapa.invalidateSize();
            }
        }, 300);
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
        
        // Preenche formulário
        document.getElementById('inputNome').value = ponto.nome;
        document.getElementById('inputTipo').value = ponto.tipo;
        document.getElementById('inputDescricao').value = ponto.descricao || '';
        document.getElementById('inputEndereco').value = ponto.endereco || '';
        
        const [lat, lng] = ponto.getLatLng();
        document.getElementById('inputLatitude').value = lat;
        document.getElementById('inputLongitude').value = lng;
        
        const modal = new bootstrap.Modal(document.getElementById('modalPonto'));
        modal.show();
        
        // Atualiza mini mapa
        setTimeout(() => {
            if (this.miniMapa) {
                this.miniMapa.invalidateSize();
                this.atualizarMiniMapa();
            }
        }, 300);
    }

    /**
     * Salva ponto (criar ou atualizar)
     */
    async salvarPonto(e) {
        e.preventDefault();
        
        try {
            const formData = new FormData(e.target);
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
            
            let resultado;
            if (this.editando && this.pontoSelecionado) {
                resultado = await pontoService.atualizarPonto(this.pontoSelecionado._id, ponto);
                this.showAlert('Ponto atualizado com sucesso!', 'success');
            } else {
                resultado = await pontoService.criarPonto(ponto);
                this.showAlert('Ponto criado com sucesso!', 'success');
            }

            // Fecha modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalPonto'));
            modal.hide();
            
            // Recarrega lista
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
            
            // Fecha modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarExclusao'));
            modal.hide();
            
            this.showAlert('Ponto excluído com sucesso!', 'success');
            
            // Recarrega lista
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
            // Remove marker anterior
            this.miniMapa.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    this.miniMapa.removeLayer(layer);
                }
            });
            
            // Adiciona novo marker
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
        
        // Limpa mini mapa
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
     * Exibe alerta
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
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                const bsAlert = bootstrap.Alert.getInstance(alert);
                if (bsAlert) bsAlert.close();
            }
        }, 5000);
    }

    /**
     * Retorna ícone para tipo de ponto
     */
    getTipoIcon(tipo) {
        const icons = {
            'Restaurante': 'fas fa-utensils',
            'Hospital': 'fas fa-hospital',
            'Escola': 'fas fa-school',
            'Posto de Gasolina': 'fas fa-gas-pump',
            'Banco': 'fas fa-university',
            'Farmácia': 'fas fa-pills',
            'Supermercado': 'fas fa-shopping-cart',
            'Outro': 'fas fa-map-marker-alt'
        };
        
        return `<i class="${icons[tipo] || icons['Outro']}"></i>`;
    }
}

// Inicializa a aplicação
const pontoController = new PontoController();

// Expõe globalmente para uso nos event handlers inline
window.pontoController = pontoController;
