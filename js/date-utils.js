/**
 * Utilidades para el manejo de fechas y meses
 */
class DateUtils {
    static MONTH_NAMES = {
        'Ene': 'Enero', 'Feb': 'Febrero', 'Mar': 'Marzo', 'Abr': 'Abril',
        'May': 'Mayo', 'Jun': 'Junio', 'Jul': 'Julio', 'Ago': 'Agosto',
        'Sep': 'Septiembre', 'Oct': 'Octubre', 'Nov': 'Noviembre', 'Dic': 'Diciembre'
    };

    static MONTHS_ORDER = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    /**
     * Convierte código de mes a nombre completo
     * @param {string} monthCode - Código del mes (Ene, Feb, etc.)
     * @returns {string} Nombre completo del mes
     */
    static getMonthName(monthCode) {
        return this.MONTH_NAMES[monthCode] || monthCode;
    }

    /**
     * Calcula los meses anterior y posterior a un mes dado
     * @param {string} currentMonth - Mes actual
     * @param {number} currentYear - Año actual
     * @returns {Object|null} Objeto con información de meses adyacentes o null si el mes es inválido
     */
    static getAdjacentMonths(currentMonth, currentYear) {
        const currentIndex = this.MONTHS_ORDER.indexOf(currentMonth);
        
        if (currentIndex === -1) {
            return null; // En lugar de lanzar error
        }

        let previousMonth, previousYear, nextMonth, nextYear;
        if (currentIndex === 0) {
            previousMonth = 'Dic';
            previousYear = currentYear - 1;
        } else {
            previousMonth = this.MONTHS_ORDER[currentIndex - 1];
            previousYear = currentYear;
        }

        if (currentIndex === 11) {
            nextMonth = 'Ene';
            nextYear = currentYear + 1;
        } else {
            nextMonth = this.MONTHS_ORDER[currentIndex + 1];
            nextYear = currentYear;
        }

        return {
            prev: { month: previousMonth, year: previousYear },
            next: { month: nextMonth, year: nextYear }
        };
    }

    /**
     * Valida si un año está dentro del rango disponible
     * @param {number} year - Año a validar
     * @returns {boolean} True si es válido
     */
    static isValidYear(year) {
        const years = Object.keys(MatriculasData.DATA).map(y => parseInt(y));
        return year >= Math.min(...years) && year <= Math.max(...years);
    }

    /**
     * Valida si un mes es válido
     * @param {string} month - Código del mes
     * @returns {boolean} True si es válido
     */
    static isValidMonth(month) {
        return this.MONTHS_ORDER.includes(month);
    }

    /**
     * Obtiene información detallada de una fecha
     * @param {string} month - Código del mes
     * @param {number} year - Año
     * @returns {Object|null} Información detallada de la fecha o null si es inválida
     */
    static getDateInfo(month, year) {
        if (!this.isValidMonth(month) || !this.isValidYear(year)) {
            return null;
        }

        return {
            month: month,
            year: year,
            fullName: this.getMonthName(month),
            monthIndex: this.MONTHS_ORDER.indexOf(month),
            isValidDate: true
        };
    }

    /**
     * Formatea una fecha para mostrar
     * @param {string} month - Código del mes
     * @param {number} year - Año
     * @returns {string} Fecha formateada
     */
    static formatDate(month, year) {
        const monthName = this.getMonthName(month);
        return `${monthName} de ${year}`;
    }
}