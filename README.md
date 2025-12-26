🚗 Calculadora de Matrícula

¡Bienvenido a la Calculadora de Matrícula! Esta sencilla aplicación web te permite obtener la fecha aproximada (mes y año) de matriculación de cualquier vehículo con matrícula española del formato XXXXLLL (donde X son números y L son letras) a partir del año 2000.

🚀 Características

Cálculo Rápido: Introduce una matrícula y obtén la fecha estimada de matriculación al instante.

Validación de Formato: La aplicación valida si la matrícula introducida cumple con el formato español (4 números y 3 letras).

Letras Prohibidas: Informa si la matrícula contiene letras no utilizadas en el sistema de matriculación español (Ñ, Q, A, E, I, O, U).

Información de Transición: Si la matrícula corresponde a un periodo de cambio entre meses, la aplicación lo indicará mostrando los 2 meses.

Diseño Sencillo: Interfaz limpia y fácil de usar.

Mensajes de Feedback: Muestra mensajes claros de éxito, error o advertencia.

🛠️ Tecnologías Utilizadas

HTML5: Para la estructura básica de la página web.

CSS3: Para el diseño y estilo de la interfaz, incluyendo animaciones sutiles.

JavaScript (ES6+): Toda la lógica de la aplicación se implementa en JavaScript, utilizando un diseño modular:

app.js: El punto de entrada principal que coordina los otros módulos.

date-utils.js: Utilidades para el manejo de fechas y nombres de meses.

matriculas-data.js: Carga y gestiona los datos de las secuencias de matrículas. Incluye un fallback estático en caso de fallo de carga.

matricula-service.js: Contiene la lógica principal para validar matrículas y calcular su fecha.

ui-controller.js: Gestiona la interacción con el usuario y la actualización de la interfaz de usuario.

JSON (matriculas.json): Un archivo de datos que almacena las secuencias de letras de las matrículas por mes y año.

📂 Estructura del Proyecto

index.html: Archivo HTML principal.

css/styles.css: Hoja de estilos de la aplicación.

js/: Directorio que contiene todos los archivos JavaScript.

app.js

date-utils.js

matriculas-data.js

matricula-service.js

ui-controller.js

data/matriculas.json: Archivo JSON con los datos de las matrículas.

🚀 Uso Local

Para poner en marcha esta aplicación en tu máquina local, sigue estos sencillos pasos:

Clona o descarga este repositorio en tu sistema.

Abre el archivo index.html en tu navegador web preferido (Chrome, Firefox, Edge, etc.).

¡Y listo! La aplicación cargará automáticamente los datos y estará lista para su uso.

💡 Cómo Funciona

La aplicación utiliza una base de datos interna (matriculas.json) que mapea las series de letras de las matrículas con los meses y años correspondientes. Al introducir una matrícula, el sistema:

Valida el formato: Asegurándose de que tiene 4 números seguidos de 3 letras.

Verifica letras prohibidas: Comprueba que no contenga 'Ñ', 'Q', 'I', 'O', 'U'.

Busca la serie de letras: Compara las letras de la matrícula con las series registradas en la base de datos.

Estima la fecha: Encontrando el primer mes y año donde la serie de letras de la matrícula es igual o inferior a la última serie registrada para ese periodo.

👨‍💻 Contribución

¡Las contribuciones son siempre bienvenidas! Si deseas mejorar esta aplicación, añadir más datos de matrículas, o corregir algún error, por favor:

Haz un fork del repositorio.

Crea una nueva rama (git checkout -b feature/nueva-funcionalidad).

Realiza tus cambios y commit (git commit -m 'feat: Añadir nueva funcionalidad').

Haz push a tu rama (git push origin feature/nueva-funcionalidad).

Abre un Pull Request.

📝 Licencia

Este proyecto está distribuido bajo la licencia MIT.