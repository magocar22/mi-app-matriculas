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
            letters: null
        };

        if (!matricula || typeof matricula !== 'string') {
            result.error = 'Matrícula no válida';
            return result;
        }

        const cleanMatricula = matricula.trim().toUpperCase();

        // Validar longitud
        if (cleanMatricula.length !== 7) {
            result.error = 'La matrícula debe tener exactamente 7 caracteres';
            return result;
        }

        // Validar formato (4 números + 3 letras)
        const matriculaRegex = /^(\d{4})([A-Z]{3})$/;
        const match = cleanMatricula.match(matriculaRegex);

        if (!match) {
            result.error = 'Formato incorrecto. Debe ser: 4 números + 3 letras (Ej: 1234ABC)';
            return result;
        }

        // Validar letras prohibidas
        const prohibitedLetters = ['Ñ', 'Q', 'I', 'O', 'U'];
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
     * Busca el período de matriculación para un código de letras
     * @param {string} letters - Código de 3 letras
     * @returns {Object|null} Período (mes y año) o null si no se encuentra
     */
    static findMatriculaPeriod(letters) {
        let lastPeriod = null;

        for (const year in MatriculasData.DATA) {
            for (const month in MatriculasData.DATA[year]) {
                const lastMatricula = MatriculasData.DATA[year][month];
                if (lastMatricula !== '---') {
                    if (letters <= lastMatricula) {
                        return { year: parseInt(year), month };
                    }
                    lastPeriod = { year: parseInt(year), month };
                }
            }
        }

        // Si las letras son más recientes que el último registro
        if (lastPeriod && letters > MatriculasData.DATA[lastPeriod.year][lastPeriod.month]) {
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
            error: null
        };

        const period = this.findMatriculaPeriod(letters);

        if (!period) {
            result.error = 'No se encontró la matrícula en la base de datos.';
            return result;
        }

        if (period.isFuture) {
            result.success = true;
            result.date = {
                month: period.month,
                year: period.year,
                formatted: `Después de ${DateUtils.formatDate(period.month, period.year)}`
            };
            return result;
        }

        const lastMatriculaForPeriod = MatriculasData.DATA[period.year][period.month];

        // Verificar si es una matrícula de transición (letras coinciden con las últimas del mes)
        if (letters === lastMatriculaForPeriod) {
            result.success = true;
            result.isEndOfMonth = true;
            try {
                // Obtener el mes actual y el siguiente
                const currentDateFormatted = DateUtils.formatDate(period.month, period.year);
                const nextMonthInfo = DateUtils.getAdjacentMonths(period.month, period.year);
                const nextDateFormatted = MatriculasData.DATA[nextMonthInfo.next.year]?.[nextMonthInfo.next.month] !== '---'
                    ? DateUtils.formatDate(nextMonthInfo.next.month, nextMonthInfo.next.year)
                    : 'desconocido';
                
                result.adjacentDates = [
                    { formatted: currentDateFormatted },
                    { formatted: nextDateFormatted }
                ];
            } catch (error) {
                result.error = 'Error al calcular fechas adyacentes';
                return result;
            }
        } else {
            result.success = true;
            result.date = {
                month: period.month,
                year: period.year,
                formatted: DateUtils.formatDate(period.month, period.year)
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
    const years = Object.keys(MatriculasData.DATA).map(y => parseInt(y));

    for (const year in MatriculasData.DATA) {
        for (const month in MatriculasData.DATA[year]) {
            totalMonths++;
            if (MatriculasData.DATA[year][month] !== '---') {
                availableMonths++;
            }
        }
    }

    console.log(`Depuración - Total meses: ${totalMonths}, Meses disponibles: ${availableMonths}`); // Log para depuración
    return {
        minYear: Math.min(...years),
        maxYear: Math.max(...years),
        totalMonths,
        availableMonths,
        coverage: ((availableMonths / totalMonths) * 100).toFixed(1),
        lastUpdated: DateUtils.formatDate('Ago', 2025)
    };
}
}