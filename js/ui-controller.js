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
    this.isLoading = true;

    try {
      const matricula = this.getCurrentMatricula();
      // --- NUEVO: Obtener combustible ---
      const combustible =
        document.getElementById("combustible")?.value || "diesel";

      this.showLoading();
      await this.delay(300); // Reducido un poco para que sea más rápido

      const validationResult = MatriculaService.validateMatricula(matricula);

      if (!validationResult.isValid) {
        this.showError(validationResult.error);
        return;
      }

      const calculationResult = MatriculaService.calculateDate(
        validationResult.letters,
        validationResult.numbers
      );

      if (calculationResult.success) {
        // --- NUEVO: Calcular etiqueta ---
        // Usamos el año calculado. Si es fecha futura o rango, usamos el año base.
        const year = calculationResult.date
          ? calculationResult.date.year
          : calculationResult.adjacentDates[1].year;
        const badgeInfo = MatriculaService.getEnvironmentalBadge(
          year,
          combustible
        );

        // Construimos el mensaje de fecha
        let dateText = "";
        if (calculationResult.isEndOfMonth) {
          // Lógica existente para fin de mes...
          const currentMonth = calculationResult.adjacentDates[0].formatted;
          dateText = `Transición: ${currentMonth} o mes siguiente.`;
        } else {
          dateText = `Fecha estimada: ${calculationResult.date.formatted}`;
        }

        // --- NUEVO: Generar HTML con imagen ---
        let htmlContent = `
                    <div class="result-content">
                        <div><strong>${dateText}</strong></div>
                `;

        if (badgeInfo.image) {
          htmlContent += `
                        <img src="${badgeInfo.image}" alt="${badgeInfo.label}" class="badge-img fade-in">
                        <div class="badge-label">${badgeInfo.label}</div>
                    `;
        } else {
          htmlContent += `
                        <div class="badge-label" style="margin-top:10px">❌ ${badgeInfo.label}</div>
                        <small style="font-size:0.7em; opacity:0.8">(Por antigüedad)</small>
                    `;
        }

        htmlContent += `</div>`;

        // Usamos innerHTML en lugar de textContent
        this.showHTMLResult(
          htmlContent,
          calculationResult.isEndOfMonth ? "warning" : "success"
        );
      } else {
        this.showError(calculationResult.error || "Matrícula no encontrada.");
      }
    } catch (error) {
      console.error("Error:", error);
      this.showError("Error inesperado.");
    } finally {
      this.isLoading = false;
    }
  }

  // --- AÑADIR ESTE PEQUEÑO MÉTODO HELPER EN LA CLASE UIController ---
  showHTMLResult(html, type) {
    const resultElement = this.elements.resultado;
    resultElement.innerHTML = html;
    resultElement.className = `result ${type}`;
    resultElement.style.display = "flex";
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
