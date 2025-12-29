/**
 * Servicio para el cálculo y validación de matrículas
 */
class MatriculaService {
  /**
   * Valida el formato de una matrícula
   * @param {string} matricula - Matrícula a validar
   * @returns {Object} Resultado de la validación
   */
  static validateMatricula(matricula) {
    const result = {
      isValid: false,
      error: null,
      numbers: null,
      letters: null,
    };

    if (!matricula || typeof matricula !== "string") {
      result.error = "Matrícula no válida";
      return result;
    }

    const cleanMatricula = matricula.trim().toUpperCase();

    // Validar longitud
    if (cleanMatricula.length !== 7) {
      result.error = "La matrícula debe tener exactamente 7 caracteres";
      return result;
    }

    // Validar formato (4 números + 3 letras)
    const matriculaRegex = /^(\d{4})([A-Z]{3})$/;
    const match = cleanMatricula.match(matriculaRegex);

    if (!match) {
      result.error =
        "Formato incorrecto. Debe ser: 4 números + 3 letras (Ej: 1234ABC)";
      return result;
    }

    // Validar letras prohibidas
    const prohibitedLetters = ["Ñ", "Q", "I", "O", "U"];
    const letters = match[2];
    for (const letter of prohibitedLetters) {
      if (letters.includes(letter)) {
        result.error = `Letra no permitida: ${letter}`;
        return result;
      }
    }

    result.isValid = true;
    result.numbers = parseInt(match[1], 10); // Convertir a número
    result.letters = letters;
    return result;
  }

  /**
   * Busca el período de matriculación para un código de letras. Garantiza orden cronológico de iteración
   * @param {string} letters - Código de 3 letras
   * @returns {Object|null} Período (mes y año) o null si no se encuentra
   */
  static findMatriculaPeriod(letters) {
    let lastPeriod = null;

    // 1. Obtener claves de años y ordenarlas descendentemente (más reciente primero)
    // Esto asegura que busquemos en el periodo más reciente y no devolvamos
    // un año anterior por coincidencia lexicográfica temprana.
    const years = Object.keys(MatriculasData.DATA)
      .map((y) => parseInt(y))
      .sort((a, b) => b - a);

    // 2. Usar el orden explícito de meses (Definido en DateUtils o fallback manual)
    // Esto evita que 'Abr' se lea antes que 'Ene' por orden alfabético
    const monthsOrder =
      typeof DateUtils !== "undefined" && DateUtils.MONTHS_ORDER
        ? DateUtils.MONTHS_ORDER
        : [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sep",
            "Oct",
            "Nov",
            "Dic",
          ];

    // 3. Iteración controlada
    for (const year of years) {
      const yearData = MatriculasData.DATA[year];

      // Protección por si yearData no está definido (aunque no debería pasar)
      if (!yearData) continue;

      for (const month of monthsOrder) {
        // Verificar si el mes existe en los datos de ese año
        if (yearData.hasOwnProperty(month)) {
          const lastMatricula = yearData[month];

          if (lastMatricula !== "---") {
            // AL estar ordenado, la primera vez que letters sea <= lastMatricula,
            // hemos encontrado el mes exacto.
            if (letters <= lastMatricula) {
              return { year: year, month };
            }
            lastPeriod = { year: year, month };
          }
        }
      }
    }

    // Si las letras son más recientes que el último registro encontrado
    if (
      lastPeriod &&
      letters > MatriculasData.DATA[lastPeriod.year][lastPeriod.month]
    ) {
      return { year: lastPeriod.year, month: lastPeriod.month, isFuture: true };
    }

    return null;
  }

  /**
   * Calcula la fecha de matriculación basada en las letras
   * @param {string} letters - Las letras de la matrícula
   * @param {number} numbers - Los números de la matrícula (no se usa para transición)
   * @returns {Object} Resultado del cálculo
   */
  static calculateDate(letters, numbers) {
    const result = {
      success: false,
      isEndOfMonth: false,
      date: null,
      adjacentDates: null,
      error: null,
    };

    const period = this.findMatriculaPeriod(letters);

    if (!period) {
      result.error = "No se encontró la matrícula en la base de datos.";
      return result;
    }

    if (period.isFuture) {
      result.success = true;
      result.date = {
        month: period.month,
        year: period.year,
        formatted: `Después de ${DateUtils.formatDate(
          period.month,
          period.year
        )}`,
      };
      return result;
    }

    const lastMatriculaForPeriod =
      MatriculasData.DATA[period.year][period.month];

    // Verificar si es una matrícula de transición (letras coinciden con las últimas del mes)
    if (letters === lastMatriculaForPeriod) {
      result.success = true;
      result.isEndOfMonth = true;
      try {
        // Obtener el mes actual y el siguiente
        const currentDateFormatted = DateUtils.formatDate(
          period.month,
          period.year
        );
        const nextMonthInfo = DateUtils.getAdjacentMonths(
          period.month,
          period.year
        );
        const nextDateFormatted =
          MatriculasData.DATA[nextMonthInfo.next.year]?.[
            nextMonthInfo.next.month
          ] !== "---"
            ? DateUtils.formatDate(
                nextMonthInfo.next.month,
                nextMonthInfo.next.year
              )
            : "desconocido";

        result.adjacentDates = [
          { formatted: currentDateFormatted, year: period.year },
          { formatted: nextDateFormatted, year: nextMonthInfo.next.year },
        ];
      } catch (error) {
        result.error = "Error al calcular fechas adyacentes";
        return result;
      }
    } else {
      result.success = true;
      result.date = {
        month: period.month,
        year: period.year,
        formatted: DateUtils.formatDate(period.month, period.year),
      };
    }

    return result;
  }

  /**
   * Obtiene estadísticas de los datos
   * @returns {Object} Estadísticas
   */
  static getDataStats() {
    let totalMonths = 0;
    let availableMonths = 0;
    const years = Object.keys(MatriculasData.DATA).map((y) => parseInt(y));

    for (const year in MatriculasData.DATA) {
      for (const month in MatriculasData.DATA[year]) {
        totalMonths++;
        if (MatriculasData.DATA[year][month] !== "---") {
          availableMonths++;
        }
      }
    }

    console.log(
      `Depuración - Total meses: ${totalMonths}, Meses disponibles: ${availableMonths}`
    ); // Log para depuración
    return {
      minYear: Math.min(...years),
      maxYear: Math.max(...years),
      totalMonths,
      availableMonths,
      coverage: ((availableMonths / totalMonths) * 100).toFixed(1),
      lastUpdated: DateUtils.formatDate("Ago", 2025),
    };
  }

  /**
     * Determina la etiqueta medioambiental (DGT) con precisión mensual
     * @param {number} year - Año de matriculación
     * @param {number} monthIndex - Índice del mes (0=Enero, 11=Diciembre)
     * @param {string} fuel - Tipo de combustible
     */
  static getEnvironmentalBadge(year, monthIndex, fuel) {
        // Rutas a tus imágenes PNG locales
        const IMAGES = {
            '0': "./img/DistAmbDGT_CeroEmisiones.png",
            'ECO': "./img/DistAmbDGT_ECO.png",
            'C': "./img/DistAmbDGT_C.png",
            'B': "./img/DistAmbDGT_B.png",
            'A': null
        }; // <--- CORREGIDO: Cerrado con llave, no con corchete

        let badge = 'A';
        const f = fuel.toLowerCase();

        if (f === 'electrico') {
            badge = '0';
        } else if (f === 'hibrido') {
            badge = 'ECO';
        } else if (f === 'gasolina') {
            // Gasolina: Euro 3 (2000), Euro 4 (2006)
            if (year >= 2006) badge = 'C';
            else if (year >= 2000) badge = 'B';
        } else if (f === 'diesel') {
            // Diésel: Euro 4 (2006), Euro 6 (Septiembre 2015 obligatoria)
            if (year > 2015) {
                badge = 'C';
            } else if (year === 2015) {
                // Septiembre (índice 8) es el corte habitual para Euro 6 obligatorio
                badge = (monthIndex >= 8) ? 'C' : 'B';
            } else if (year >= 2006) {
                badge = 'B';
            }
            // Anterior a 2006 es A (sin etiqueta)
        }

        return {
            type: badge,
            image: IMAGES[badge],
            // CORREGIDO: Uso de comillas invertidas ` ` para que funcione la variable ${badge}
            label: badge === 'A' ? 'Sin Distintivo Ambiental' : `Distintivo Ambiental ${badge}`
        };
    }
}