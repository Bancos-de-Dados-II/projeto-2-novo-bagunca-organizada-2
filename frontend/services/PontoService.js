import Ponto from '../models/Ponto.js';

/**
 * Serviço para comunicação com a API de pontos
 */
class PontoService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
    }

    /**
     * Faz requisição HTTP
     * @param {string} url 
     * @param {Object} options 
     * @returns {Promise<Object>}
     */
    async request(url, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${url}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    /**
     * Lista todos os pontos
     * @returns {Promise<Ponto[]>}
     */
    async listarPontos() {
        const data = await this.request('/pontos');
        return data.map(pontoData => Ponto.fromAPI(pontoData));
    }

    /**
     * Busca um ponto por ID
     * @param {string} id 
     * @returns {Promise<Ponto>}
     */
    async buscarPonto(id) {
        const data = await this.request(`/pontos/${id}`);
        return Ponto.fromAPI(data);
    }

    /**
     * Cria um novo ponto
     * @param {Ponto} ponto 
     * @returns {Promise<Ponto>}
     */
    async criarPonto(ponto) {
        const validation = ponto.validate();
        if (!validation.valid) {
            throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }

        const data = await this.request('/pontos', {
            method: 'POST',
            body: JSON.stringify(ponto.toJSON())
        });

        return Ponto.fromAPI(data);
    }

    /**
     * Atualiza um ponto existente
     * @param {string} id 
     * @param {Ponto} ponto 
     * @returns {Promise<Ponto>}
     */
    async atualizarPonto(id, ponto) {
        const validation = ponto.validate();
        if (!validation.valid) {
            throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }

        const data = await this.request(`/pontos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(ponto.toJSON())
        });

        return Ponto.fromAPI(data);
    }

    /**
     * Deleta um ponto
     * @param {string} id 
     * @returns {Promise<Object>}
     */
    async deletarPonto(id) {
        return await this.request(`/pontos/${id}`, {
            method: 'DELETE'
        });
    }
}

// Singleton
const pontoService = new PontoService();
export default pontoService;
