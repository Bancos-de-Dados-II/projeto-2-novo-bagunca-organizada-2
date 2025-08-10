/**
 * Modelo para representar um Ponto georreferenciado
 */
class Ponto {
    constructor(data = {}) {
        this._id = data._id || null;
        this.nome = data.nome || '';
        this.tipo = data.tipo || '';
        this.descricao = data.descricao || '';
        this.endereco = data.endereco || '';
        this.data_cadastro = data.data_cadastro || null;
        this.localizacao = data.localizacao || {
            type: 'Point',
            coordinates: [0, 0] // [longitude, latitude]
        };
        this.createdAt = data.createdAt || null;
        this.updatedAt = data.updatedAt || null;
    }

    /**
     * Valida os dados do ponto
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    validate() {
        const errors = [];

        if (!this.nome || this.nome.trim().length === 0) {
            errors.push('Nome é obrigatório');
        }

        if (!this.tipo || this.tipo.trim().length === 0) {
            errors.push('Tipo é obrigatório');
        }

        if (!this.localizacao || 
            !this.localizacao.coordinates || 
            this.localizacao.coordinates.length !== 2 ||
            this.localizacao.coordinates[0] === 0 && this.localizacao.coordinates[1] === 0) {
            errors.push('Localização é obrigatória');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Converte para objeto JSON para envio à API
     * @returns {Object}
     */
    toJSON() {
        return {
            ...(this._id && { _id: this._id }),
            nome: this.nome.trim(),
            tipo: this.tipo.trim(),
            descricao: this.descricao.trim(),
            endereco: this.endereco.trim(),
            localizacao: this.localizacao,
            ...(this.data_cadastro && { data_cadastro: this.data_cadastro })
        };
    }

    /**
     * Cria uma instância de Ponto a partir de dados da API
     * @param {Object} apiData 
     * @returns {Ponto}
     */
    static fromAPI(apiData) {
        return new Ponto(apiData);
    }

    /**
     * Obtém coordenadas como [latitude, longitude] para mapas
     * @returns {number[]}
     */
    getLatLng() {
        return [this.localizacao.coordinates[1], this.localizacao.coordinates[0]];
    }

    /**
     * Define coordenadas a partir de [latitude, longitude]
     * @param {number} lat 
     * @param {number} lng 
     */
    setLatLng(lat, lng) {
        this.localizacao = {
            type: 'Point',
            coordinates: [lng, lat] // GeoJSON usa [longitude, latitude]
        };
    }
}

export default Ponto;
