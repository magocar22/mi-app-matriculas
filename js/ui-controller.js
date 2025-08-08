/**
 * Controlador de la interfaz de usuario
 */
class UIController {
    constructor() {
        this.elements = {
            matriculaInput: null,
            calcularBtn: null,
            resultado: null
        };
        this.isLoading = false;
    }

    /**
     * Inicializa el controlador y enlaza eventos
     */
    init() {
        this.bindElements();
        this.bindEvents();
        this.setupValidation();
        console.log('UIController inicializado');
    }

    /**
     * Enlaza elementos del DOM
     */
    bindElements() {
        this.elements.matriculaInput = document.getElementById('matricula');
        this.elements.calcularBtn = document.getElementById('calcular-btn');
        this.elements.resultado = document.getElementById('resultado');

        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                console.error(`Elemento no encontrado: ${key}`);
            }
        }
    }

    /**
     * Configura eventos de la interfaz
     */
    bindEvents() {
        this.elements.calcularBtn?.addEventListener('click', () => {
            this.handleCalculate();
        });

        this.elements.matriculaInput?.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.handleCalculate();
            }
        });
    }

    /**
     * Configura la validación del input en tiempo real
     */
    setupValidation() {
        this.elements.matriculaInput?.addEventListener('input', () => {
            const matricula = this.getCurrentMatricula();
            this.setMatriculaValue(matricula.toUpperCase());
            if (this.elements.resultado.textContent !== '') {
                this.hideResult();
            }
        });
    }

    /**
     * Maneja el proceso de cálculo completo
     */
    async handleCalculate() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const matricula = this.getCurrentMatricula();
            this.showLoading();

            await this.delay(500);

            const validationResult = MatriculaService.validateMatricula(matricula);
            
            if (!validationResult.isValid) {
                this.showError(validationResult.error);
                return;
            }

            const calculationResult = MatriculaService.calculateDate(validationResult.letters, validationResult.numbers);
            
            if (calculationResult.success) {
                if (calculationResult.isEndOfMonth) {
                    const currentMonth = calculationResult.adjacentDates[0].formatted;
                    const nextMonth = calculationResult.adjacentDates[1].formatted;
                    if (nextMonth === 'desconocido') {
                        this.showWarning(
                            `Matrícula de transición: La fecha de matriculación podría ser ${currentMonth} o posterior.`
                        );
                    } else {
                        this.showWarning(
                            `Matrícula de transición: La fecha de matriculación podría ser ${currentMonth} o ${nextMonth}.`
                        );
                    }
                } else {
                    this.showSuccess(
                        `La fecha de matriculación estimada es: ${calculationResult.date.formatted}.`
                    );
                }
            } else {
                this.showError(calculationResult.error || 'Matrícula no encontrada en la base de datos.');
            }
        } catch (error) {
            console.error("Error inesperado en el cálculo:", error);
            this.showError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Muestra el estado de carga
     */
    showLoading() {
        const resultElement = this.elements.resultado;
        resultElement.textContent = 'Calculando...';
        resultElement.className = 'result loading';
        resultElement.style.display = 'flex';
    }

    /**
     * Muestra un resultado exitoso
     * @param {string} message - Mensaje a mostrar
     */
    showSuccess(message) {
        const resultElement = this.elements.resultado;
        resultElement.textContent = message;
        resultElement.className = 'result success';
        resultElement.style.display = 'flex';
    }

    /**
     * Muestra un mensaje de advertencia
     * @param {string} message - Mensaje a mostrar
     */
    showWarning(message) {
        const resultElement = this.elements.resultado;
        resultElement.innerHTML = `⚠️ ${message}`;
        resultElement.className = 'result warning';
        resultElement.style.display = 'flex';
    }

    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje a mostrar
     */
    showError(message) {
        const resultElement = this.elements.resultado;
        resultElement.innerHTML = `❌ Error: ${message}`;
        resultElement.className = 'result error';
        resultElement.style.display = 'flex';
    }

    /**
     * Oculta el resultado
     */
    hideResult() {
        const resultElement = this.elements.resultado;
        resultElement.style.display = 'none';
        resultElement.textContent = '';
    }

    /**
     * Enfoca el input de matrícula
     */
    focusInput() {
        if (this.elements.matriculaInput) {
            this.elements.matriculaInput.focus();
        }
    }

    /**
     * Obtiene el valor actual del input
     * @returns {string} Valor actual
     */
    getCurrentMatricula() {
        return this.elements.matriculaInput?.value || '';
    }

    /**
     * Establece un valor en el input
     * @param {string} value - Valor a establecer
     */
    setMatriculaValue(value) {
        if (this.elements.matriculaInput) {
            this.elements.matriculaInput.value = value;
        }
    }

    /**
     * Utilidad para crear delays
     * @param {number} ms - Milisegundos a esperar
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Muestra información de depuración
     */
    showDebugInfo() {
        const stats = MatriculaService.getDataStats();
        const debugMessage = `
            📊 Información del sistema:<br>
            Período cubierto: ${stats.minYear} - ${stats.maxYear}<br>
            Cobertura de datos: ${stats.coverage}%<br>
            Última actualización: ${stats.lastUpdated}
        `;
        this.showSuccess(debugMessage);
    }
}