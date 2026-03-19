# Implementation Plan: Sistema de Evaluación Auditiva Profesional

## Overview

Este plan de implementación transforma el sistema actual de gráficas médicas en un Sistema de Evaluación Auditiva Profesional completo. La implementación se realizará en fases incrementales, comenzando con los tipos y esquemas de validación, seguido por los componentes de formulario, generación de gráficas, informe consolidado, persistencia en Firebase, y finalmente la gestión de evaluaciones guardadas. Cada fase incluye pruebas unitarias y de propiedades para garantizar la corrección del sistema.

## Tasks

- [x] 1. Configurar tipos TypeScript y esquemas de validación
  - Crear archivo `types/evaluation.ts` con todas las interfaces y tipos
  - Crear archivo `lib/validation-schemas.ts` con esquemas Zod para validación
  - Incluir tipos: TipoPrueba, Sexo, Oido, TipoCurvaTimpanometrica, Paciente, DatosAudiometriaTonal, DatosLogoaudiometria, DatosTimpanometria, Examinador, EvaluacionAuditiva
  - Incluir esquemas: pacienteSchema, frecuenciasSchema, audiometriaTonalSchema, logoaudiometriaSchema, timpanometriaSchema, examinadorSchema, evaluacionAuditivaSchema
  - _Requirements: 2.1-2.7, 3.1-3.6, 4.1-4.8, 5.1-5.11, 6.1-6.6_

- [ ] 1.1 Escribir pruebas de propiedad para esquemas de validación

  - **Property 5: Patient Required Fields Validation**
  - **Property 7: Audiometry Minimum Frequencies Validation**
  - **Property 10: Logoaudiometry Required Fields Validation**
  - **Property 11: Logoaudiometry SDS Range Validation**
  - **Property 13: Tympanometry Required Fields Validation**
  - **Property 15: Examiner Required Fields Validation**
  - **Property 16: Examiner Code Format Validation**
  - **Validates: Requirements 2.2-2.5, 3.3-3.4, 4.3-4.6, 4.8, 5.4-5.9, 6.3-6.6**

- [x] 2. Implementar componente TestSelector
  - Crear `components/test-selector.tsx` con interfaz TestSelectorProps
  - Renderizar 3 tarjetas para Audiometría Tonal, Logoaudiometría y Timpanometría
  - Implementar lógica para agregar pruebas (máximo 3, sin duplicados)
  - Implementar lógica para remover pruebas
  - Deshabilitar tarjetas ya seleccionadas
  - Mostrar lista de pruebas seleccionadas con botón eliminar
  - Usar componentes shadcn/ui (Card, Button)
  - _Requirements: 1.1-1.6_

- [x] 2.1 Escribir pruebas de propiedad para TestSelector

  - **Property 1: Test Addition Grows List**
  - **Property 2: Duplicate Test Prevention**
  - **Property 3: Test Removal Reduces List**
  - **Property 4: Selected Tests Display Completeness**
  - **Validates: Requirements 1.2, 1.3, 1.5, 1.6**

- [x] 2.2 Escribir pruebas unitarias para TestSelector

  - Probar que se deshabilita el botón cuando hay 3 pruebas
  - Probar que no se pueden agregar duplicados
  - Probar que remover una prueba la habilita nuevamente
  - _Requirements: 1.3, 1.4, 1.5_

- [x] 3. Implementar formularios de captura de datos
  - [x] 3.1 Crear componente PatientForm
    - Crear `components/patient-form.tsx` con React Hook Form + Zod
    - Campos: apellido, nombre, fechaNacimiento (date picker), sexo (select)
    - Validación en tiempo real con mensajes de error
    - Usar componentes shadcn/ui (Form, Input, Select, DatePicker)
    - _Requirements: 2.1-2.7, 17.1-17.7_

  - [x] 3.2 Crear componente AudiometryForm
    - Crear `components/audiometry-form.tsx` con React Hook Form + Zod
    - 12 campos numéricos (6 frecuencias × 2 oídos)
    - Validación: mínimo 4 frecuencias por oído
    - Etiquetas claras con unidades (Hz, dB)
    - _Requirements: 3.1-3.6_

  - [x] 3.3 Crear componente LogoaudiometryForm
    - Crear `components/logoaudiometry-form.tsx` con React Hook Form + Zod
    - 4 campos: SRT OD/OI (dB), SDS OD/OI (%)
    - Validación: todos requeridos, SDS entre 0-100
    - _Requirements: 4.1-4.8_

  - [x] 3.4 Crear componente TympanometryForm
    - Crear `components/tympanometry-form.tsx` con React Hook Form + Zod
    - 6 campos por oído: tipo curva (select), presión (daPa), cumplimiento (ml)
    - Validación: todos requeridos, valores numéricos válidos
    - _Requirements: 5.1-5.11_

  - [ ] 3.5 Crear componente ExaminerForm
    - Crear `components/examiner-form.tsx` con React Hook Form + Zod
    - 2 campos: nombre, código (6 dígitos)
    - Validación: código exactamente 6 dígitos numéricos
    - _Requirements: 6.1-6.6_

- [ ]* 3.6 Escribir pruebas de propiedad para validación en tiempo real
  - **Property 44: Real-time Validation Error Clearing**
  - **Property 45: Required Field Validation Triggering**
  - **Property 46: Invalid Input Validation**
  - **Property 47: Visual Error Indicators**
  - **Validates: Requirements 17.1-17.7**

- [ ]* 3.7 Escribir pruebas unitarias para formularios
  - Probar renderizado condicional según pruebas seleccionadas
  - Probar mensajes de error específicos
  - Probar interacciones de usuario (llenar campos, submit)
  - _Requirements: 3.1-3.2, 4.1-4.2, 5.1-5.2_

- [x] 4. Checkpoint - Validar formularios y tipos
  - Asegurar que todos los formularios validan correctamente
  - Verificar que los esquemas Zod funcionan como se espera
  - Preguntar al usuario si hay dudas o ajustes necesarios

- [x] 5. Implementar generadores de gráficas
  - [x] 5.1 Crear componente AudiometryChart
    - Crear `components/audiometry-chart.tsx` usando Recharts
    - LineChart con eje X (frecuencias Hz) y eje Y (dB)
    - Serie OD en rojo, serie OI en azul
    - Leyenda, grid, etiquetas de ejes
    - Responsive con width/height props
    - _Requirements: 8.1-8.7_

  - [x] 5.2 Crear función de interpolación sigmoidea
    - Crear `lib/chart-generators.ts`
    - Implementar `generateSigmoidCurve(srt, sds)` para logoaudiometría
    - Generar puntos de curva desde 0-100 dB
    - _Requirements: 9.1-9.7_

  - [x] 5.3 Crear componente LogoaudiometryChart
    - Crear `components/logoaudiometry-chart.tsx` usando Recharts
    - LineChart con curvas sigmoideas interpoladas
    - Eje X (dB 0-100), eje Y (% 0-100)
    - Markers en puntos SRT y SDS
    - Serie OD en rojo, serie OI en azul
    - _Requirements: 9.1-9.7_

  - [x] 5.4 Crear función de generación de timpanogramas
    - En `lib/chart-generators.ts`
    - Implementar `generateTympanogramCurve(tipo, presionPico, cumplimiento)`
    - Generar curvas según tipo: A (normal), B (plana), C (desplazada), As (estrecha), Ad (ancha)
    - _Requirements: 10.1-10.8_

  - [x] 5.5 Crear componente TympanometryChart
    - Crear `components/tympanometry-chart.tsx` usando Recharts
    - AreaChart con eje X (presión daPa) y eje Y (cumplimiento ml)
    - Áreas semi-transparentes para OD (rojo) y OI (azul)
    - Peak markers en presión pico
    - _Requirements: 10.1-10.8_

- [ ]* 5.6 Escribir pruebas de propiedad para gráficas
  - **Property 19: Audiometry Chart Structure**
  - **Property 20: Audiometry Chart Color Coding**
  - **Property 21: Audiometry Chart Completeness**
  - **Property 22: Logoaudiometry Chart Structure**
  - **Property 23: Logoaudiometry Chart Data Representation**
  - **Property 24: Tympanometry Chart Structure**
  - **Property 25: Tympanometry Chart Curve Generation**
  - **Validates: Requirements 8.1-8.7, 9.1-9.7, 10.1-10.8**

- [ ]* 5.7 Escribir pruebas unitarias para gráficas
  - Probar renderizado con datos válidos
  - Probar manejo de datos insuficientes (graceful degradation)
  - Probar generación de curvas para cada tipo de timpanometría
  - _Requirements: 8.1-8.7, 9.1-9.7, 10.1-10.8_

- [x] 6. Implementar informe consolidado
  - Crear `components/consolidated-report.tsx`
  - Layout con encabezado institucional
  - Sección de datos del paciente (apellido, nombre, fecha nacimiento, sexo)
  - Fecha y hora del examen
  - Sección de pruebas realizadas (renderizar solo las seleccionadas)
  - Para cada prueba: mostrar datos numéricos + gráfica correspondiente
  - Sección de datos del examinador (nombre, código)
  - Botón "Exportar a PDF"
  - Diseño profesional con shadcn/ui
  - _Requirements: 11.1-11.9_

- [ ]* 6.1 Escribir pruebas de propiedad para informe consolidado
  - **Property 26: Report Patient Data Completeness**
  - **Property 27: Report Exam Date Inclusion**
  - **Property 28: Report Tests Listing**
  - **Property 29: Report Test Data Completeness**
  - **Property 30: Report Examiner Data Inclusion**
  - **Validates: Requirements 11.2-11.8**

- [ ]* 6.2 Escribir pruebas unitarias para informe
  - Probar renderizado con diferentes combinaciones de pruebas
  - Probar que solo se muestran las pruebas seleccionadas
  - Probar formato de fecha y hora
  - _Requirements: 11.1-11.9_

- [x] 7. Checkpoint - Validar generación de informe
  - Verificar que el informe se genera correctamente con todas las pruebas
  - Verificar que las gráficas se renderizan correctamente
  - Preguntar al usuario si hay ajustes visuales necesarios

- [x] 8. Implementar exportación a PDF
  - Crear `lib/pdf-export.ts` con clase JsPDFExportService
  - Implementar método `exportEvaluationToPDF(evaluation, reportElement)`
  - Usar jsPDF en formato A4 landscape
  - Agregar encabezado institucional "Sistema Evaluación Auditiva - Universidad del Valle"
  - Convertir elemento HTML a canvas con html2canvas
  - Incluir todas las gráficas en el PDF
  - Generar nombre de archivo: "Evaluacion_[Apellido]_[Nombre]_[Fecha].pdf"
  - Manejo de errores con toast notifications
  - _Requirements: 12.1-12.8_

- [ ]* 8.1 Escribir pruebas de propiedad para exportación PDF
  - **Property 31: PDF Generation Completeness**
  - **Property 32: PDF Format Specification**
  - **Property 33: PDF Logo Inclusion**
  - **Property 34: PDF Chart Quality**
  - **Property 35: PDF Filename Format**
  - **Validates: Requirements 12.2-12.8**

- [ ]* 8.2 Escribir pruebas unitarias para PDF
  - Probar generación de PDF con diferentes evaluaciones
  - Probar formato de nombre de archivo
  - Probar manejo de errores
  - _Requirements: 12.1-12.8_

- [x] 9. Implementar servicio Firebase
  - Crear `lib/firebase-service.ts` con clase FirestoreService
  - Implementar método `saveEvaluation(evaluation)` - retorna ID
  - Implementar método `updateEvaluation(id, evaluation)`
  - Implementar método `getEvaluation(id)` - retorna evaluación o null
  - Implementar método `getAllEvaluations()` - retorna array ordenado por fecha
  - Implementar método `deleteEvaluation(id)`
  - Implementar método `searchEvaluations(query)` - búsqueda case-insensitive
  - Convertir Dates a Timestamps para Firebase
  - Agregar timestamps createdAt y updatedAt
  - Manejo de errores con try-catch y toast notifications
  - _Requirements: 13.1-13.8, 15.1-15.7_

- [ ]* 9.1 Escribir pruebas de propiedad para Firebase
  - **Property 36: Firebase Save Round Trip**
  - **Property 37: Firebase Unique ID Assignment**
  - **Property 43: Search Case Insensitivity**
  - **Validates: Requirements 13.1-13.6, 15.7**

- [ ]* 9.2 Escribir pruebas unitarias para Firebase
  - Probar guardado exitoso con confirmación
  - Probar manejo de errores de red
  - Probar búsqueda con diferentes queries
  - _Requirements: 13.1-13.8, 15.1-15.7_

- [x] 10. Implementar página principal de nueva evaluación
  - Actualizar `app/page.tsx`
  - Integrar TestSelector para selección de pruebas
  - Renderizar PatientForm (siempre visible)
  - Renderizar formularios de pruebas condicionalmente según selección
  - Renderizar ExaminerForm (siempre visible)
  - Botón "GENERAR INFORME COMPLETO" (habilitado solo con datos válidos)
  - Al generar: mostrar ConsolidatedReport en modal o página
  - Guardar automáticamente en Firebase al generar informe
  - Validación completa antes de generar
  - _Requirements: 1.1-1.6, 2.1-2.7, 3.1-3.6, 4.1-4.8, 5.1-5.11, 6.1-6.6, 7.1-7.5, 11.1-11.9, 13.1-13.8_

- [ ]* 10.1 Escribir pruebas de propiedad para validación completa
  - **Property 17: Minimum Tests Validation**
  - **Property 18: Complete Data Enables Report Generation**
  - **Validates: Requirements 7.1, 7.3**

- [ ]* 10.2 Escribir pruebas de integración para flujo completo
  - Probar flujo: seleccionar pruebas → llenar formularios → generar informe → exportar PDF
  - Probar validación que previene generación con datos incompletos
  - _Requirements: 7.1-7.5_

- [x] 11. Implementar página de evaluaciones guardadas
  - Crear `app/saved/page.tsx`
  - Crear componente EvaluationList
  - Campo de búsqueda en tiempo real
  - Listar todas las evaluaciones de Firebase
  - Para cada evaluación: mostrar apellido, nombre, fecha examen, tipos de pruebas
  - Botones: Ver, Editar, Eliminar
  - Al hacer clic en Ver: mostrar ConsolidatedReport en modal
  - Al hacer clic en Editar: cargar datos en formulario de página principal
  - Al hacer clic en Eliminar: mostrar confirmación, luego eliminar de Firebase
  - Filtrado en tiempo real según búsqueda
  - Mensaje cuando no hay resultados
  - _Requirements: 14.1-14.10, 15.1-15.7_

- [ ]* 11.1 Escribir pruebas de propiedad para gestión de evaluaciones
  - **Property 38: Saved Evaluations Retrieval**
  - **Property 39: Evaluation List Item Completeness**
  - **Property 40: Evaluation Edit Data Loading**
  - **Property 41: Evaluation Deletion Removes Data**
  - **Property 42: Search Filters Results**
  - **Validates: Requirements 14.2, 14.3, 14.8, 14.10, 15.2-15.5**

- [ ]* 11.2 Escribir pruebas unitarias para página guardadas
  - Probar renderizado de lista vacía
  - Probar búsqueda con diferentes queries
  - Probar confirmación antes de eliminar
  - Probar navegación a edición
  - _Requirements: 14.1-14.10, 15.1-15.7_

- [x] 12. Implementar diseño responsive y estilos institucionales
  - Actualizar `app/globals.css` con colores institucionales Universidad del Valle
  - Configurar Tailwind con colores personalizados
  - Asegurar responsive design para desktop (>1024px), tablet (768-1024px), mobile (<768px)
  - Aplicar diseño profesional consistente en todos los componentes
  - Optimizar layout de formularios para diferentes tamaños de pantalla
  - Optimizar visualización de gráficas en móviles
  - _Requirements: 16.1-16.7_

- [x] 13. Implementar manejo de errores y feedback
  - Configurar toast notifications con shadcn/ui
  - Agregar mensajes de éxito para operaciones exitosas
  - Agregar mensajes de error descriptivos para fallos
  - Implementar retry logic para operaciones Firebase
  - Agregar loading states en operaciones asíncronas
  - Graceful degradation para gráficas con datos insuficientes
  - _Requirements: 13.7-13.8, 17.1-17.7_

- [ ]* 13.1 Escribir pruebas unitarias para manejo de errores
  - Probar mensajes de error en validación
  - Probar manejo de errores de Firebase
  - Probar manejo de errores de exportación PDF
  - Probar retry logic
  - _Requirements: 13.7-13.8_

- [x] 14. Checkpoint final - Pruebas end-to-end
  - Ejecutar todas las pruebas unitarias y de propiedades
  - Verificar que todas las pruebas pasen
  - Realizar pruebas manuales de flujos completos
  - Verificar responsive design en diferentes dispositivos
  - Preguntar al usuario si hay ajustes finales necesarios

- [x] 15. Documentación y refinamiento
  - Agregar comentarios JSDoc a funciones principales
  - Documentar uso de componentes principales
  - Crear README con instrucciones de configuración Firebase
  - Optimizar rendimiento si es necesario
  - Realizar ajustes finales basados en feedback del usuario

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos que implementa
- Los checkpoints permiten validación incremental con el usuario
- Las pruebas de propiedades validan corrección universal
- Las pruebas unitarias validan casos específicos y edge cases
- La implementación es incremental: tipos → formularios → gráficas → informe → persistencia → gestión
