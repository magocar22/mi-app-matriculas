/**
 * Aplicación principal - Calculadora de Matrículas
 * Punto de entrada y coordinador de la aplicación
 */
class MatriculaApp {
    constructor() {
        this.uiController = null;
        this.isInitialized = false;
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        try {
            console.log('🚗 Iniciando Calculadora de Matrículas...');
            
            // Esperar a que los datos se carguen
            const data = await MatriculasData.loadData();
            
            // Verificar dependencias
            this.checkDependencies();
            
            // Inicializar controlador UI
            this.uiController = new UIController();
            this.uiController.init();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            // Ejecutar verificaciones iniciales solo si hay datos
            if (data) {
                this.performInitialChecks();
            } else {
                console.warn('⚠️ No se han podido cargar datos iniciales');
                this.uiController?.showError('No hay datos disponibles. Contacte al administrador.');
            }
            
            this.isInitialized = true;
            console.log('✅ Aplicación inicializada correctamente');
            
            // Enfocar input para mejor UX
            this.uiController.focusInput();
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Verifica que todas las dependencias estén cargadas
     */
    checkDependencies() {
        const dependencies = [
            { name: 'MatriculasData', check: () => typeof MatriculasData !== 'undefined' },
            { name: 'DateUtils', check: () => typeof DateUtils !== 'undefined' },
            { name: 'MatriculaService', check: () => typeof MatriculaService !== 'undefined' },
            { name: 'UIController', check: () => typeof UIController !== 'undefined' }
        ];

        const missing = dependencies.filter(dep => !dep.check());
        
        if (missing.length > 0) {
            throw new Error(`Dependencias faltantes: ${missing.map(d => d.name).join(', ')}`);
        }
    }

    /**
     * Configura eventos globales de la aplicación
     */
    setupGlobalEvents() {
        // Manejar errores no capturados
        window.addEventListener('error', (event) => {
            console.error('Error global capturado:', event.error);
            this.handleGlobalError(event.error);
        });

        // Manejar promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promesa rechazada no manejada:', event.reason);
            this.handleGlobalError(event.reason);
        });

        // Configurar atajos de teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Manejar visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isInitialized) {
                this.uiController?.focusInput();
            }
        });
    }

    /**
     * Maneja atajos de teclado
     * @param {KeyboardEvent} e - Evento de teclado
     */
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            this.uiController?.showDebugInfo();
        }
    }

    /**
     * Realiza verificaciones iniciales del sistema
     */
    performInitialChecks() {
        const data = MatriculasData.getData();
        if (!data) {
            console.warn('⚠️ Datos no disponibles al realizar verificaciones iniciales');
            this.uiController?.showError('No hay datos disponibles. Contacte al administrador.');
            return;
        }

        const stats = MatriculaService.getDataStats();
        if (stats.availableMonths === 0) {
            console.warn('⚠️ No hay datos de matrículas disponibles');
            this.uiController?.showError('No hay datos disponibles. Contacte al administrador.');
        } else {
            console.log(`📊 Sistema listo - Cobertura: ${stats.coverage}% | Período: ${stats.minYear}-${stats.maxYear}`);
        }
    }

    /**
     * Maneja errores de inicialización
     * @param {Error} error - Error ocurrido
     */
    handleInitializationError(error) {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="result error">
                    ❌ Error al cargar la aplicación<br>
                    <small>${error.message}</small><br>
                    <small>Recarga la página para intentar de nuevo</small>
                </div>
            `;
        }
    }

    /**
     * Maneja errores globales de la aplicación
     * @param {Error} error - Error ocurrido
     */
    handleGlobalError(error) {
        if (this.uiController) {
            this.uiController.showError(
                'Se produjo un error inesperado. Por favor, recarga la página.'
            );
        }
    }

    /**
     * Obtiene información del estado actual
     * @returns {Object} Estado de la aplicación
     */
    getAppStatus() {
        return {
            initialized: this.isInitialized,
            dataStats: MatriculaService.getDataStats(),
            currentMatricula: this.uiController?.getCurrentMatricula() || '',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Método para testing y depuración
     * @param {string} matricula - Matrícula a probar
     */
    testMatricula(matricula) {
        if (!this.isInitialized) {
            console.warn('Aplicación no inicializada');
            return;
        }

        console.log('🧪 Probando matrícula:', matricula);
        this.uiController.setMatriculaValue(matricula);
        this.uiController.handleCalculate();
    }

    /**
     * Utilidad para crear delays
     * @param {number} ms - Milisegundos a esperar
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    const app = new MatriculaApp();
    app.init(); // Llamada asíncrona
});

/**
 * Funciones globales para debugging (solo en desarrollo)
 */
if (typeof window !== 'undefined') {
    window.debugMatricula = {
        getStats: () => MatriculaService.getDataStats(),
        testMatricula: (matricula) => app?.testMatricula(matricula),
        getAppStatus: () => app?.getAppStatus(),
        clearResult: () => app?.uiController?.hideResult()
    };

    console.log('🔧 Funciones de debug disponibles en window.debugMatricula');
}
