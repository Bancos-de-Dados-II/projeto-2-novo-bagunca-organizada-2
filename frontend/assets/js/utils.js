/**
 * Utilitários gerais da aplicação
 */

/**
 * Formata data para exibição
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatarData(date) {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Valida coordenadas geográficas
 * @param {number} lat 
 * @param {number} lng 
 * @returns {boolean}
 */
export function validarCoordenadas(lat, lng) {
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
}

/**
 * Calcula distância entre dois pontos (em km)
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number}
 */
export function calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Debounce function para otimizar eventos
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Sanitiza string para uso em HTML
 * @param {string} str 
 * @returns {string}
 */
export function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Gera ID único
 * @returns {string}
 */
export function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Copia texto para clipboard
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function copiarParaClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            return true;
        } catch (err) {
            return false;
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

/**
 * Converte coordenadas para diferentes formatos
 * @param {number} lat 
 * @param {number} lng 
 * @returns {Object}
 */
export function formatarCoordenadas(lat, lng) {
    return {
        decimal: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        dms: convertToDMS(lat, lng),
        googleMaps: `https://www.google.com/maps?q=${lat},${lng}`,
        openStreetMap: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`
    };
}

/**
 * Converte coordenadas decimais para DMS (Degrees, Minutes, Seconds)
 * @param {number} lat 
 * @param {number} lng 
 * @returns {string}
 */
function convertToDMS(lat, lng) {
    const latDMS = convertCoordToDMS(lat, lat >= 0 ? 'N' : 'S');
    const lngDMS = convertCoordToDMS(lng, lng >= 0 ? 'E' : 'W');
    return `${latDMS}, ${lngDMS}`;
}

function convertCoordToDMS(coord, direction) {
    const absolute = Math.abs(coord);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
    return `${degrees}°${minutes}'${seconds}"${direction}`;
}

/**
 * Detecta se está em dispositivo móvel
 * @returns {boolean}
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Obtém localização atual do usuário
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function obterLocalizacaoAtual() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalização não suportada pelo navegador'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                let message = 'Erro ao obter localização';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Permissão de localização negada';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Localização indisponível';
                        break;
                    case error.TIMEOUT:
                        message = 'Timeout ao obter localização';
                        break;
                }
                reject(new Error(message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 600000 // 10 minutos
            }
        );
    });
}
