/**
 * Controlador de la interfaz de usuario
 */
class UIController {
  constructor() {
    this.elements = {
      matriculaInput: null,
      calcularBtn: null,
      resultado: null,
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
    console.log("UIController inicializado");
  }

  /**
   * Enlaza elementos del DOM
   */
  bindElements() {
    this.elements.matriculaInput = document.getElementById("matricula");
    this.elements.calcularBtn = document.getElementById("calcular-btn");
    this.elements.resultado = document.getElementById("resultado");

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
    this.elements.calcularBtn?.addEventListener("click", () => {
      this.handleCalculate();
    });

    this.elements.matriculaInput?.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        this.handleCalculate();
      }
    });
  }

  /**
   * Configura la validación del input en tiempo real
   */
  setupValidation() {
    this.elements.matriculaInput?.addEventListener("input", () => {
      const matricula = this.getCurrentMatricula();
      this.setMatriculaValue(matricula.toUpperCase());
      if (this.elements.resultado.textContent !== "") {
        this.hideResult();
      }
    });
  }

  /**
   * Maneja el proceso de cálculo completo
   */
  // Sustituye o actualiza tu método handleCalculate con este:

async handleCalculate() {
        if (this.isLoading) return;
        
        // Limpiar resultados anteriores
        this.elements.resultado.style.display = 'none';
        this.elements.resultado.innerHTML = '';
        
        this.isLoading = true;

        try {
            const matricula = this.getCurrentMatricula();
            this.showLoading();
            await this.delay(300);

            const validationResult = MatriculaService.validateMatricula(matricula);
            
            if (!validationResult.isValid) {
                this.showError(validationResult.error);
                return;
            }

            const calculationResult = MatriculaService.calculateDate(validationResult.letters, validationResult.numbers);
            
            if (calculationResult.success) {
                // 1. EXTRAER DATOS (Año y Mes)
                let year, monthIndex, dateText;
                
                if (calculationResult.isEndOfMonth) {
                    // En caso de transición, usamos el mes siguiente para ser conservadores o el actual
                    // Usaremos el primero para la fecha, pero guardamos ambos datos
                    year = calculationResult.adjacentDates[0].year; 
                    // Necesitamos el índice del mes para la precisión del Diésel
                    // DateUtils.MONTHS_ORDER nos ayuda a obtener el índice si tenemos el nombre
                    const monthName = calculationResult.adjacentDates[0].formatted.split(' ')[0]; // "Julio"
                    // Truco: usaremos el objeto DateUtils si expone el índice, o buscaremos en el array
                    monthIndex = DateUtils.MONTHS_ORDER ? DateUtils.MONTHS_ORDER.indexOf(monthName.substring(0,3)) : 0; 
                    
                    dateText = `Transición: ${calculationResult.adjacentDates[0].formatted} o mes siguiente.`;
                } else {
                    year = calculationResult.date.year;
                    monthIndex = calculationResult.date.monthIndex;
                    dateText = `Fecha estimada: ${calculationResult.date.formatted}`;
                }

                // 2. MOSTRAR SOLO LA FECHA (Paso 1)
                this.renderDateStep(dateText, year, monthIndex);

            } else {
                this.showError(calculationResult.error || 'Matrícula no encontrada.');
            }
        } catch (error) {
            console.error("Error:", error);
            this.showError('Error inesperado.');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Muestra la fecha y el botón para consultar etiqueta
     */
    renderDateStep(dateText, year, monthIndex) {
        const html = `
            <div class="result-content fade-in">
                <div class="date-highlight">📅 ${dateText}</div>
                
                <div id="badge-section" class="badge-section">
                    <button id="btn-show-badge" class="btn-secondary">
                        🔍 Consultar Distintivo Ambiental
                    </button>
                </div>
            </div>
        `;
        
        this.showHTMLResult(html, 'success');

        // Añadir evento al botón recién creado
        document.getElementById('btn-show-badge')?.addEventListener('click', (e) => {
            e.target.style.display = 'none'; // Ocultar el botón
            this.renderFuelSelector(year, monthIndex);
        });
    }

    /**
     * Muestra el selector de combustible y gestiona el cálculo de etiqueta
     */
    renderFuelSelector(year, monthIndex) {
        const badgeSection = document.getElementById('badge-section');
        if (!badgeSection) return;

        badgeSection.innerHTML = `
            <div class="fuel-selector-container fade-in">
                <label>Selecciona el combustible:</label>
                <div class="fuel-options">
                    <button class="fuel-btn" data-fuel="diesel">⛽ Diésel</button>
                    <button class="fuel-btn" data-fuel="gasolina">⛽ Gasolina</button>
                    <button class="fuel-btn" data-fuel="hibrido">🍃 Híbrido</button>
                    <button class="fuel-btn" data-fuel="electrico">⚡ Eléctrico</button>
                </div>
            </div>
            <div id="badge-result"></div>
        `;

        // Añadir eventos a los botones de combustible
        const buttons = badgeSection.querySelectorAll('.fuel-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Quitar clase activa a todos y ponerla al pulsado
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Calcular y mostrar
                this.renderBadgeResult(year, monthIndex, btn.dataset.fuel);
            });
        });
    }

    /**
     * Renderiza la etiqueta final
     */
    renderBadgeResult(year, monthIndex, fuel) {
        const badgeInfo = MatriculaService.getEnvironmentalBadge(year, monthIndex, fuel);
        const container = document.getElementById('badge-result');
        
        let html = `<div class="badge-display fade-in">`;
        
        if (badgeInfo.image) {
            html += `
                <img src="${badgeInfo.image}" alt="${badgeInfo.label}" class="badge-img">
                <div class="badge-label">${badgeInfo.label}</div>
            `;
        } else {
            html += `
                <div class="badge-no-label">❌ Sin Distintivo</div>
                <small>(Vehículo demasiado antiguo)</small>
            `;
        }

        // Disclaimer obligatorio
        html += `
            <div class="legal-note">
                ⚠️ <strong>Aviso Importante:</strong> Resultado estimado basado en año (${year}) y normativa estándar. 
                <br>La clasificación real puede variar (ej. vehículos importados o rematriculados). 
                Para seguridad 100%, consulte la <a href="https://sede.dgt.gob.es/es/vehiculos/distintivo-ambiental/" target="_blank">web oficial de la DGT</a>.
            </div>
        </div>`;

        container.innerHTML = html;
    }

    showHTMLResult(html, type) {
        const resultElement = this.elements.resultado;
        resultElement.innerHTML = html;
        resultElement.className = `result ${type}`;
        resultElement.style.display = 'block'; // Block para que los divs ocupen ancho
    }
    
  /**
   * Muestra el estado de carga
   */
  showLoading() {
    const resultElement = this.elements.resultado;
    resultElement.textContent = "Calculando...";
    resultElement.className = "result loading";
    resultElement.style.display = "flex";
  }

  /**
   * Muestra un resultado exitoso
   * @param {string} message - Mensaje a mostrar
   */
  showSuccess(message) {
    const resultElement = this.elements.resultado;
    resultElement.textContent = message;
    resultElement.className = "result success";
    resultElement.style.display = "flex";
  }

  /**
   * Muestra un mensaje de advertencia
   * @param {string} message - Mensaje a mostrar
   */
  showWarning(message) {
    const resultElement = this.elements.resultado;
    resultElement.innerHTML = `⚠️ ${message}`;
    resultElement.className = "result warning";
    resultElement.style.display = "flex";
  }

  /**
   * Muestra un mensaje de error
   * @param {string} message - Mensaje a mostrar
   */
  showError(message) {
    const resultElement = this.elements.resultado;
    resultElement.innerHTML = `❌ Error: ${message}`;
    resultElement.className = "result error";
    resultElement.style.display = "flex";
  }

  /**
   * Oculta el resultado
   */
  hideResult() {
    const resultElement = this.elements.resultado;
    resultElement.style.display = "none";
    resultElement.textContent = "";
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
    return this.elements.matriculaInput?.value || "";
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
    return new Promise((resolve) => setTimeout(resolve, ms));
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
