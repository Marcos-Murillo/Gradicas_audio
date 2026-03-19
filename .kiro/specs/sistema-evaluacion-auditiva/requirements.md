# Requirements Document

## Introduction

El Sistema de Evaluación Auditiva Profesional es una plataforma web diseñada para la Universidad del Valle que permite a profesionales de audiología realizar, documentar y gestionar evaluaciones auditivas completas de pacientes. El sistema transforma la aplicación actual de gráficas médicas simples en una solución integral que soporta tres tipos de pruebas audiológicas: Audiometría Tonal, Logoaudiometría y Timpanometría. Cada evaluación genera gráficas profesionales específicas, consolida resultados en informes exportables a PDF, y persiste los datos en Firebase para consulta y gestión posterior.

## Glossary

- **Sistema**: El Sistema de Evaluación Auditiva Profesional
- **Evaluación_Auditiva**: Conjunto completo de datos del paciente, pruebas realizadas, resultados y datos del examinador
- **Prueba**: Una de las tres evaluaciones audiológicas disponibles (Audiometría Tonal, Logoaudiometría o Timpanometría)
- **Paciente**: Persona que recibe la evaluación auditiva
- **Examinador**: Profesional de audiología que realiza la evaluación
- **Informe_Consolidado**: Documento que presenta todos los resultados de las pruebas realizadas con sus gráficas correspondientes
- **OD**: Oído Derecho
- **OI**: Oído Izquierdo
- **dB**: Decibeles, unidad de medida de intensidad sonora
- **Hz**: Hertz, unidad de medida de frecuencia
- **SRT**: Speech Reception Threshold (Umbral de Reconocimiento Verbal)
- **SDS**: Speech Discrimination Score (Discriminación Máxima)
- **daPa**: Decapascales, unidad de medida de presión
- **ml**: Mililitros, unidad de medida de cumplimiento acústico

## Requirements

### Requirement 1: Gestión de Selección de Pruebas

**User Story:** Como examinador, quiero seleccionar múltiples tipos de pruebas audiológicas para un paciente, de manera que pueda realizar una evaluación auditiva completa y personalizada.

#### Acceptance Criteria

1. WHEN el examinador accede al sistema, THE Sistema SHALL mostrar tres tarjetas de selección para Audiometría Tonal, Logoaudiometría y Timpanometría
2. WHEN el examinador hace clic en el botón "AÑADIR PRUEBA", THE Sistema SHALL agregar la prueba seleccionada a la lista de pruebas activas
3. WHEN una prueba ya ha sido agregada, THE Sistema SHALL deshabilitar la opción de agregar esa misma prueba nuevamente
4. WHEN el examinador intenta agregar una cuarta prueba, THE Sistema SHALL prevenir la adición y mantener el máximo de tres pruebas
5. WHEN el examinador hace clic en eliminar una prueba de la lista, THE Sistema SHALL remover la prueba y habilitar nuevamente su selección
6. THE Sistema SHALL mostrar una lista visual de todas las pruebas seleccionadas con opción de eliminar cada una

### Requirement 2: Captura de Datos del Paciente

**User Story:** Como examinador, quiero registrar los datos demográficos del paciente una sola vez, de manera que pueda identificar correctamente al paciente en todos los informes y registros.

#### Acceptance Criteria

1. THE Sistema SHALL solicitar apellido, nombre, fecha de nacimiento y sexo del paciente
2. WHEN el examinador intenta generar un informe sin completar apellido, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
3. WHEN el examinador intenta generar un informe sin completar nombre, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
4. WHEN el examinador intenta generar un informe sin completar fecha de nacimiento, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
5. WHEN el examinador intenta generar un informe sin completar sexo, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
6. THE Sistema SHALL proporcionar un selector de fecha con formato DD/MM/AAAA para la fecha de nacimiento
7. THE Sistema SHALL proporcionar un selector con opciones Masculino, Femenino y Otro para el campo sexo

### Requirement 3: Captura de Datos de Audiometría Tonal

**User Story:** Como examinador, quiero registrar las respuestas auditivas del paciente a diferentes frecuencias para ambos oídos, de manera que pueda evaluar la capacidad auditiva tonal del paciente.

#### Acceptance Criteria

1. WHEN Audiometría Tonal está seleccionada, THE Sistema SHALL mostrar campos de entrada para seis frecuencias (250, 500, 1000, 2000, 4000, 8000 Hz) para el oído derecho
2. WHEN Audiometría Tonal está seleccionada, THE Sistema SHALL mostrar campos de entrada para seis frecuencias (250, 500, 1000, 2000, 4000, 8000 Hz) para el oído izquierdo
3. WHEN el examinador intenta generar un informe con menos de cuatro frecuencias completadas para el oído derecho, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
4. WHEN el examinador intenta generar un informe con menos de cuatro frecuencias completadas para el oído izquierdo, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
5. THE Sistema SHALL aceptar valores numéricos en decibeles (dB) para cada frecuencia
6. THE Sistema SHALL validar que los valores ingresados sean números válidos

### Requirement 4: Captura de Datos de Logoaudiometría

**User Story:** Como examinador, quiero registrar los umbrales de reconocimiento verbal y discriminación máxima del paciente, de manera que pueda evaluar la capacidad de comprensión del habla.

#### Acceptance Criteria

1. WHEN Logoaudiometría está seleccionada, THE Sistema SHALL mostrar campos para SRT (Umbral de Reconocimiento Verbal) en dB para ambos oídos
2. WHEN Logoaudiometría está seleccionada, THE Sistema SHALL mostrar campos para SDS (Discriminación Máxima) en porcentaje para ambos oídos
3. WHEN el examinador intenta generar un informe sin completar SRT para oído derecho, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
4. WHEN el examinador intenta generar un informe sin completar SRT para oído izquierdo, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
5. WHEN el examinador intenta generar un informe sin completar SDS para oído derecho, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
6. WHEN el examinador intenta generar un informe sin completar SDS para oído izquierdo, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
7. THE Sistema SHALL validar que los valores SRT sean números válidos en decibeles
8. THE Sistema SHALL validar que los valores SDS sean números válidos en porcentaje (0-100)

### Requirement 5: Captura de Datos de Timpanometría

**User Story:** Como examinador, quiero registrar las características timpanométricas de ambos oídos del paciente, de manera que pueda evaluar la función del oído medio.

#### Acceptance Criteria

1. WHEN Timpanometría está seleccionada, THE Sistema SHALL mostrar campos para tipo de curva, presión pico y cumplimiento para el oído derecho
2. WHEN Timpanometría está seleccionada, THE Sistema SHALL mostrar campos para tipo de curva, presión pico y cumplimiento para el oído izquierdo
3. THE Sistema SHALL proporcionar un selector con opciones A, B, C, As y Ad para el tipo de curva
4. WHEN el examinador intenta generar un informe sin completar tipo de curva para oído derecho, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
5. WHEN el examinador intenta generar un informe sin completar presión pico para oído derecho, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
6. WHEN el examinador intenta generar un informe sin completar cumplimiento para oído derecho, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
7. WHEN el examinador intenta generar un informe sin completar tipo de curva para oído izquierdo, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
8. WHEN el examinador intenta generar un informe sin completar presión pico para oído izquierdo, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
9. WHEN el examinador intenta generar un informe sin completar cumplimiento para oído izquierdo, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
10. THE Sistema SHALL validar que la presión pico sea un número válido en decapascales (daPa)
11. THE Sistema SHALL validar que el cumplimiento sea un número válido en mililitros (ml)

### Requirement 6: Captura de Datos del Examinador

**User Story:** Como examinador, quiero registrar mi nombre y código profesional, de manera que el informe identifique claramente quién realizó la evaluación.

#### Acceptance Criteria

1. THE Sistema SHALL solicitar el nombre del examinador
2. THE Sistema SHALL solicitar el código profesional del examinador
3. WHEN el examinador intenta generar un informe sin completar el nombre del examinador, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
4. WHEN el examinador intenta generar un informe sin completar el código profesional, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
5. THE Sistema SHALL validar que el código profesional contenga exactamente 6 dígitos numéricos
6. WHEN el código profesional no tiene 6 dígitos, THE Sistema SHALL mostrar un mensaje de error de validación

### Requirement 7: Validación de Evaluación Completa

**User Story:** Como examinador, quiero que el sistema valide que he completado todos los datos necesarios antes de generar el informe, de manera que no se generen informes incompletos o inválidos.

#### Acceptance Criteria

1. WHEN el examinador intenta generar un informe sin haber seleccionado al menos una prueba, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
2. WHEN el examinador intenta generar un informe con más de tres pruebas seleccionadas, THE Sistema SHALL prevenir la generación y mostrar un mensaje de error
3. WHEN todos los datos requeridos están completos y válidos, THE Sistema SHALL habilitar el botón "GENERAR INFORME COMPLETO"
4. THE Sistema SHALL validar en tiempo real los campos mientras el examinador los completa
5. THE Sistema SHALL mostrar mensajes de error claros y específicos para cada campo inválido

### Requirement 8: Generación de Gráfica de Audiometría Tonal

**User Story:** Como examinador, quiero visualizar una gráfica de audiometría tonal con las respuestas de ambos oídos, de manera que pueda interpretar visualmente la capacidad auditiva del paciente.

#### Acceptance Criteria

1. WHEN se genera el informe con Audiometría Tonal, THE Sistema SHALL crear una gráfica de líneas con el eje X mostrando frecuencias (250, 500, 1000, 2000, 4000, 8000 Hz)
2. WHEN se genera el informe con Audiometría Tonal, THE Sistema SHALL crear una gráfica de líneas con el eje Y mostrando decibeles (dB)
3. THE Sistema SHALL representar los datos del oído derecho con una línea de color rojo
4. THE Sistema SHALL representar los datos del oído izquierdo con una línea de color azul
5. THE Sistema SHALL incluir una leyenda que identifique claramente OD (rojo) y OI (azul)
6. THE Sistema SHALL etiquetar claramente ambos ejes con sus unidades correspondientes
7. THE Sistema SHALL renderizar la gráfica de manera profesional y legible

### Requirement 9: Generación de Gráfica de Logoaudiometría

**User Story:** Como examinador, quiero visualizar una curva sigmoidea que represente el reconocimiento verbal del paciente, de manera que pueda evaluar la discriminación del habla.

#### Acceptance Criteria

1. WHEN se genera el informe con Logoaudiometría, THE Sistema SHALL crear una gráfica con el eje X mostrando decibeles (dB)
2. WHEN se genera el informe con Logoaudiometría, THE Sistema SHALL crear una gráfica con el eje Y mostrando porcentaje de reconocimiento (0-100%)
3. THE Sistema SHALL representar los datos de SRT y SDS para ambos oídos en la gráfica
4. THE Sistema SHALL generar curvas sigmoideas que representen la relación entre intensidad y reconocimiento verbal
5. THE Sistema SHALL diferenciar visualmente los datos del oído derecho y oído izquierdo
6. THE Sistema SHALL incluir una leyenda que identifique claramente OD y OI
7. THE Sistema SHALL etiquetar claramente ambos ejes con sus unidades correspondientes

### Requirement 10: Generación de Timpanograma

**User Story:** Como examinador, quiero visualizar timpanogramas que muestren la función del oído medio del paciente, de manera que pueda identificar patologías del oído medio.

#### Acceptance Criteria

1. WHEN se genera el informe con Timpanometría, THE Sistema SHALL crear una gráfica con el eje X mostrando presión en decapascales (daPa)
2. WHEN se genera el informe con Timpanometría, THE Sistema SHALL crear una gráfica con el eje Y mostrando cumplimiento en mililitros (ml)
3. THE Sistema SHALL representar el timpanograma del oído derecho con el pico marcado en la presión correspondiente
4. THE Sistema SHALL representar el timpanograma del oído izquierdo con el pico marcado en la presión correspondiente
5. THE Sistema SHALL generar curvas timpanométricas apropiadas según el tipo de curva seleccionado (A, B, C, As, Ad)
6. THE Sistema SHALL diferenciar visualmente los timpanogramas del oído derecho y oído izquierdo
7. THE Sistema SHALL incluir una leyenda que identifique claramente OD y OI
8. THE Sistema SHALL etiquetar claramente ambos ejes con sus unidades correspondientes

### Requirement 11: Generación de Informe Consolidado

**User Story:** Como examinador, quiero generar un informe consolidado que presente todos los resultados de las pruebas realizadas, de manera que pueda revisar y compartir la evaluación completa del paciente.

#### Acceptance Criteria

1. WHEN el examinador presiona "GENERAR INFORME COMPLETO", THE Sistema SHALL mostrar un modal o página con el informe consolidado
2. THE Sistema SHALL incluir en el encabezado del informe: apellido, nombre, fecha de nacimiento y sexo del paciente
3. THE Sistema SHALL incluir en el encabezado del informe la fecha y hora exacta del examen
4. THE Sistema SHALL listar todas las pruebas realizadas en orden
5. FOR EACH prueba de Audiometría Tonal, THE Sistema SHALL mostrar los valores de todas las frecuencias para OD y OI seguidos de la gráfica visual
6. FOR EACH prueba de Logoaudiometría, THE Sistema SHALL mostrar los valores de SRT y SDS para ambos oídos seguidos de la gráfica visual
7. FOR EACH prueba de Timpanometría, THE Sistema SHALL mostrar tipo de curva, presión y cumplimiento para ambos oídos seguidos de la gráfica visual
8. THE Sistema SHALL incluir al final del informe el nombre y código del examinador
9. THE Sistema SHALL aplicar un diseño profesional y legible al informe

### Requirement 12: Exportación a PDF

**User Story:** Como examinador, quiero exportar el informe consolidado a formato PDF, de manera que pueda imprimirlo, archivarlo o compartirlo con otros profesionales.

#### Acceptance Criteria

1. WHEN el informe consolidado está visible, THE Sistema SHALL proporcionar un botón para exportar a PDF
2. WHEN el examinador presiona el botón de exportar, THE Sistema SHALL generar un archivo PDF con todo el contenido del informe
3. THE Sistema SHALL incluir todas las gráficas generadas en el PDF exportado
4. THE Sistema SHALL aplicar formato A4 landscape (horizontal) al PDF
5. THE Sistema SHALL incluir un encabezado con el texto "Sistema Evaluación Auditiva - Universidad del Valle" en cada página del PDF
6. THE Sistema SHALL incluir el logo institucional en el encabezado del PDF
7. THE Sistema SHALL mantener la calidad y legibilidad de las gráficas en el PDF exportado
8. THE Sistema SHALL nombrar el archivo PDF con el formato "Evaluacion_[Apellido]_[Nombre]_[Fecha].pdf"

### Requirement 13: Persistencia de Evaluaciones en Firebase

**User Story:** Como examinador, quiero que el sistema guarde automáticamente las evaluaciones completas en la base de datos, de manera que pueda acceder a ellas posteriormente para consulta o edición.

#### Acceptance Criteria

1. WHEN se genera un informe consolidado exitosamente, THE Sistema SHALL guardar la evaluación completa en Firebase
2. THE Sistema SHALL almacenar todos los datos del paciente en la evaluación guardada
3. THE Sistema SHALL almacenar todas las pruebas realizadas con sus datos completos en la evaluación guardada
4. THE Sistema SHALL almacenar los datos del examinador en la evaluación guardada
5. THE Sistema SHALL almacenar la fecha y hora del examen en la evaluación guardada
6. THE Sistema SHALL asignar un identificador único a cada evaluación guardada
7. WHEN el guardado es exitoso, THE Sistema SHALL mostrar un mensaje de confirmación al examinador
8. WHEN ocurre un error al guardar, THE Sistema SHALL mostrar un mensaje de error descriptivo

### Requirement 14: Gestión de Evaluaciones Guardadas

**User Story:** Como examinador, quiero acceder a una página que liste todas las evaluaciones guardadas, de manera que pueda consultar, editar o eliminar evaluaciones previas.

#### Acceptance Criteria

1. THE Sistema SHALL proporcionar una página de "Evaluaciones Guardadas" accesible desde el menú principal
2. WHEN el examinador accede a la página de evaluaciones guardadas, THE Sistema SHALL mostrar una lista de todas las evaluaciones almacenadas en Firebase
3. FOR EACH evaluación en la lista, THE Sistema SHALL mostrar apellido y nombre del paciente, fecha del examen y tipos de pruebas realizadas
4. THE Sistema SHALL proporcionar un botón para ver el informe completo de cada evaluación
5. THE Sistema SHALL proporcionar un botón para editar cada evaluación
6. THE Sistema SHALL proporcionar un botón para eliminar cada evaluación
7. WHEN el examinador hace clic en ver, THE Sistema SHALL mostrar el informe consolidado de esa evaluación
8. WHEN el examinador hace clic en editar, THE Sistema SHALL cargar todos los datos de la evaluación en el formulario para su modificación
9. WHEN el examinador hace clic en eliminar, THE Sistema SHALL solicitar confirmación antes de eliminar
10. WHEN el examinador confirma la eliminación, THE Sistema SHALL remover la evaluación de Firebase y actualizar la lista

### Requirement 15: Búsqueda de Evaluaciones

**User Story:** Como examinador, quiero buscar evaluaciones por nombre o apellido del paciente, de manera que pueda encontrar rápidamente evaluaciones específicas en una lista extensa.

#### Acceptance Criteria

1. THE Sistema SHALL proporcionar un campo de búsqueda en la página de evaluaciones guardadas
2. WHEN el examinador escribe en el campo de búsqueda, THE Sistema SHALL filtrar la lista de evaluaciones en tiempo real
3. THE Sistema SHALL buscar coincidencias en el campo apellido del paciente
4. THE Sistema SHALL buscar coincidencias en el campo nombre del paciente
5. THE Sistema SHALL mostrar solo las evaluaciones que coincidan con el texto de búsqueda
6. WHEN el campo de búsqueda está vacío, THE Sistema SHALL mostrar todas las evaluaciones
7. THE Sistema SHALL realizar búsquedas sin distinción entre mayúsculas y minúsculas

### Requirement 16: Diseño Responsive y Profesional

**User Story:** Como examinador, quiero utilizar el sistema en diferentes dispositivos con una interfaz profesional y adaptable, de manera que pueda realizar evaluaciones desde computadoras de escritorio, tablets o dispositivos móviles.

#### Acceptance Criteria

1. THE Sistema SHALL adaptar su interfaz para funcionar correctamente en pantallas de escritorio (>1024px)
2. THE Sistema SHALL adaptar su interfaz para funcionar correctamente en tablets (768px-1024px)
3. THE Sistema SHALL adaptar su interfaz para funcionar correctamente en dispositivos móviles (<768px)
4. THE Sistema SHALL utilizar los colores institucionales de la Universidad del Valle en toda la interfaz
5. THE Sistema SHALL aplicar un diseño profesional y consistente en todas las páginas
6. THE Sistema SHALL mantener la legibilidad y usabilidad en todos los tamaños de pantalla
7. THE Sistema SHALL utilizar componentes de shadcn/ui para mantener consistencia visual

### Requirement 17: Validación en Tiempo Real

**User Story:** Como examinador, quiero recibir retroalimentación inmediata sobre errores de validación mientras completo el formulario, de manera que pueda corregir errores antes de intentar generar el informe.

#### Acceptance Criteria

1. WHEN el examinador completa un campo requerido, THE Sistema SHALL remover el mensaje de error de ese campo si estaba presente
2. WHEN el examinador abandona un campo requerido sin completarlo, THE Sistema SHALL mostrar un mensaje de error indicando que el campo es requerido
3. WHEN el examinador ingresa un valor inválido en un campo numérico, THE Sistema SHALL mostrar un mensaje de error indicando el formato esperado
4. WHEN el examinador ingresa un código profesional con menos o más de 6 dígitos, THE Sistema SHALL mostrar un mensaje de error inmediatamente
5. THE Sistema SHALL mostrar mensajes de error en color rojo junto al campo correspondiente
6. THE Sistema SHALL mostrar indicadores visuales (bordes rojos) en campos con errores
7. THE Sistema SHALL mostrar indicadores visuales (bordes verdes o checkmarks) en campos válidos completados
