/**
 * Datos de matrículas españolas organizados por año y mes
 * Última actualización: Agosto 2025
 */
class MatriculasData {
    static DATA = null; // Se cargará desde /data/matriculas.json
    static isLoading = false;
    static loadError = null;

    static CONFIG = {
        END_OF_MONTH_THRESHOLD: 9000,
        DATA_VERSION: '1.0',
        LAST_UPDATE: '2025-08-07'
    };

    /**
     * Valida la integridad de los datos
     */
    static validateData(data) {
        const currentYear = new Date().getFullYear();
        const validMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const prohibitedLetters = ['Ñ', 'Q', 'A', 'E', 'I', 'O', 'U'];
        let lastLetters = null;
        let isValid = true;

        if (!data || typeof data !== 'object') {
            throw new Error('Datos inválidos: el formato debe ser un objeto JSON');
        }

        for (const year in data) {
            if (!/^\d{4}$/.test(year)) {
                throw new Error(`Año inválido: ${year}`);
            }
            if (parseInt(year) < 2002 || parseInt(year) > currentYear + 1) {
                throw new Error(`Año fuera de rango: ${year}`);
            }

            if (typeof data[year] !== 'object') {
                throw new Error(`Datos inválidos para el año ${year}: debe ser un objeto`);
            }

            for (const month in data[year]) {
                if (!validMonths.includes(month)) {
                    throw new Error(`Mes inválido para ${year}: ${month}`);
                }

                const letters = data[year][month];
                if (letters !== '---') {
                    if (!/^[A-Z]{3}$/.test(letters)) {
                        throw new Error(`Combinación de letras inválida para ${month} ${year}: ${letters}`);
                    }
                    for (const letter of prohibitedLetters) {
                        if (letters.includes(letter)) {
                            throw new Error(`Letra no permitida en ${month} ${year}: ${letter}`);
                        }
                    }
                    if (lastLetters && letters <= lastLetters) {
                        console.warn(`Advertencia: Combinación no secuencial en ${month} ${year}: ${letters} <= ${lastLetters}`);
                        isValid = false;
                    } else {
                        lastLetters = letters;
                    }
                } else if (parseInt(year) < currentYear) {
                    throw new Error(`Datos incompletos para ${month} ${year}`);
                }
            }
        }

        if (isValid) {
            console.log(`Datos de matrículas cargados - Versión: ${this.CONFIG.DATA_VERSION}`);
            console.log(`Período disponible: 2002-${currentYear} | Actualizado: ${this.CONFIG.LAST_UPDATE}`);
        }
        return isValid;
    }

    /**
     * Construye la ruta base para el JSON según ubicación actual
     */
    static getDataUrl() {
    // Detecta la ruta base (subcarpeta incluida) y construye la URL del JSON
    const basePath = window.location.pathname.replace(/\/[^\/]*$/, '/');
    return `${basePath}data/matriculas.json`;
    }


    /**
     * Carga los datos desde /data/matriculas.json
     */
    static async loadData() {
        if (this.isLoading) return this.DATA;
        this.isLoading = true;

        const primaryUrl = this.getDataUrl();
        const fallbackUrl = './data/matriculas.json';

        try {
            let response = await fetch(primaryUrl);
            if (!response.ok) {
                console.warn(`⚠️ Fallo al cargar desde ruta primaria: ${primaryUrl} (${response.status})`);
                response = await fetch(fallbackUrl);
            }

            if (!response.ok) {
                throw new Error(`Error al cargar matriculas.json: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const isValid = this.validateData(data);
            if (isValid) {
                this.DATA = data;
                this.loadError = null;
                return data;
            } else {
                throw new Error('Datos inválidos debido a secuencias no secuenciales');
            }

        } catch (error) {
            console.error('Error al cargar datos desde matriculas.json:', error);
            this.loadError = error.message;

            // Respaldo estático
            this.DATA = {
                2025: {
                    'Ene': 'MYF', 'Feb': 'MYW', 'Mar': 'MZS', 'Abr': 'NBL', 'May': 'NCJ',
                    'Jun': 'NDG', 'Jul': 'NFC', 'Ago': 'NFD', 'Sep': '---', 'Oct': '---',
                    'Nov': '---', 'Dic': '---'
                },
                2024: {
                    'Ene': 'MNC', 'Feb': 'MNT', 'Mar': 'MPL', 'Abr': 'MRD', 'May': 'MRX',
                    'Jun': 'MSS', 'Jul': 'MTK', 'Ago': 'MTW', 'Sep': 'MVL', 'Oct': 'MWD',
                    'Nov': 'MWY', 'Dic': 'MXP'
                }
            };
            this.validateData(this.DATA);
            console.warn('Usando datos de respaldo debido al error en la carga de matriculas.json');
            return this.DATA;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Obtiene los datos, cargándolos si no están disponibles
     */
    static getData() {
        if (!this.DATA && !this.isLoading) {
            this.loadData().catch(error => {
                console.error('Error crítico al obtener datos:', error);
            });
        }
        return this.DATA;
    }

    /**
     * Inicializa los datos al cargar el módulo
     */
    static initialize() {
        if (typeof window !== 'undefined') {
            this.loadData().catch(error => {
                console.error('Error crítico al inicializar MatriculasData:', error);
            });
        }
    }
}

// Inicializar datos al cargar el módulo
MatriculasData.initialize();
