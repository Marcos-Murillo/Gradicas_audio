"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AudiometryAudiogram } from "@/components/audiometry-audiogram"
import { LogoaudiometryChartUI } from "@/components/logoaudiometry-chart-ui"
import { TympanometryChartUI } from "@/components/tympanometry-chart-ui"
import type { EvaluacionAuditiva, DatosAudiometriaTonal, DatosLogoaudiometria, DatosTimpanometria } from "@/types/evaluation"

interface ConsolidatedReportProps {
  evaluation: EvaluacionAuditiva
  onExportPDF: () => void
}

/**
 * Componente de informe consolidado
 * 
 * Muestra un informe completo con:
 * - Encabezado institucional
 * - Datos del paciente
 * - Fecha y hora del examen
 * - Todas las pruebas realizadas con sus datos y gráficas
 * - Datos del examinador
 * - Botón de exportación a PDF
 * 
 * Requirements: 11.1-11.9
 */
export function ConsolidatedReport({ evaluation, onExportPDF }: ConsolidatedReportProps) {
  const { paciente, pruebas, examinador, fechaExamen } = evaluation

  // Formatear fecha de nacimiento
  const fechaNacimientoStr = format(paciente.fechaNacimiento, "dd/MM/yyyy", { locale: es })
  
  // Formatear fecha y hora del examen
  const fechaExamenStr = format(fechaExamen, "dd/MM/yyyy HH:mm", { locale: es })

  // Capitalizar sexo
  const sexoCapitalizado = paciente.sexo.charAt(0).toUpperCase() + paciente.sexo.slice(1)

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6">
      {/* Encabezado institucional */}
      <Card>
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardTitle className="text-2xl font-bold">
            SISTEMA EVALUACIÓN AUDITIVA
          </CardTitle>
          <p className="text-sm font-medium mt-1">Universidad del Valle</p>
        </CardHeader>
      </Card>

      {/* Datos del paciente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos del Paciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Apellido</p>
              <p className="font-semibold">{paciente.apellido}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-semibold">{paciente.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
              <p className="font-semibold">{fechaNacimientoStr}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sexo</p>
              <p className="font-semibold">{sexoCapitalizado}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div>
            <p className="text-sm text-muted-foreground">Fecha y Hora del Examen</p>
            <p className="font-semibold text-lg">{fechaExamenStr}</p>
          </div>
        </CardContent>
      </Card>

      {/* Pruebas realizadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Pruebas Realizadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {pruebas.map((prueba, index) => (
            <div key={index} className="space-y-4">
              {prueba.tipo === 'tonal' && (
                <AudiometrySection data={prueba} index={index + 1} />
              )}
              {prueba.tipo === 'logoaudiometria' && (
                <LogoaudiometrySection data={prueba} index={index + 1} />
              )}
              {prueba.tipo === 'timpanometria' && (
                <TympanometrySection data={prueba} index={index + 1} />
              )}
              {index < pruebas.length - 1 && <Separator className="my-6" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Datos del examinador */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos del Examinador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-semibold">{examinador.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Código Profesional</p>
              <p className="font-semibold">{examinador.codigo}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón de exportación */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={onExportPDF}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8"
        >
          Exportar a PDF
        </Button>
      </div>
    </div>
  )
}

/**
 * Sección de audiometría tonal
 */
function AudiometrySection({ data, index }: { data: DatosAudiometriaTonal; index: number }) {
  const frequencies = ['250', '500', '1000', '2000', '4000', '8000'] as const

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-blue-700">
        {index}. Audiometría Tonal
      </h3>
      
      {/* Datos numéricos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div>
          <p className="font-semibold text-red-600 mb-2">Oído Derecho (OD):</p>
          <div className="space-y-1 text-sm">
            {frequencies.map((freq) => {
              const value = data.oido_derecho[freq]
              return (
                <p key={`od-${freq}`}>
                  {freq} Hz: {value !== undefined ? `${value} dB` : 'N/A'}
                </p>
              )
            })}
          </div>
        </div>
        <div>
          <p className="font-semibold text-blue-600 mb-2">Oído Izquierdo (OI):</p>
          <div className="space-y-1 text-sm">
            {frequencies.map((freq) => {
              const value = data.oido_izquierdo[freq]
              return (
                <p key={`oi-${freq}`}>
                  {freq} Hz: {value !== undefined ? `${value} dB` : 'N/A'}
                </p>
              )
            })}
          </div>
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border" data-chart-type="audiometry">
        <AudiometryAudiogram data={data} />
      </div>
    </div>
  )
}

/**
 * Sección de logoaudiometría
 */
function LogoaudiometrySection({ data, index }: { data: DatosLogoaudiometria; index: number }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-blue-700">
        {index}. Logoaudiometría
      </h3>
      
      {/* Datos numéricos */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold mb-2">SRT (Umbral de Reconocimiento Verbal):</p>
            <div className="space-y-1 text-sm">
              <p className="text-red-600">OD: {data.srt.derecho} dB</p>
              <p className="text-blue-600">OI: {data.srt.izquierdo} dB</p>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-2">SDS (Discriminación Máxima):</p>
            <div className="space-y-1 text-sm">
              <p className="text-red-600">OD: {data.sds.derecho}%</p>
              <p className="text-blue-600">OI: {data.sds.izquierdo}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border" data-chart-type="logoaudiometry">
        <LogoaudiometryChartUI data={data} />
      </div>
    </div>
  )
}

/**
 * Sección de timpanometría
 */
function TympanometrySection({ data, index }: { data: DatosTimpanometria; index: number }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-blue-700">
        {index}. Timpanometría
      </h3>
      
      {/* Datos numéricos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div>
          <p className="font-semibold text-red-600 mb-2">Oído Derecho (OD):</p>
          <div className="space-y-1 text-sm">
            <p>Tipo de Curva: {data.derecho.tipoCurva}</p>
            <p>Presión Pico: {data.derecho.presionPico} daPa</p>
            <p>Cumplimiento: {data.derecho.cumplimiento} ml</p>
          </div>
        </div>
        <div>
          <p className="font-semibold text-blue-600 mb-2">Oído Izquierdo (OI):</p>
          <div className="space-y-1 text-sm">
            <p>Tipo de Curva: {data.izquierdo.tipoCurva}</p>
            <p>Presión Pico: {data.izquierdo.presionPico} daPa</p>
            <p>Cumplimiento: {data.izquierdo.cumplimiento} ml</p>
          </div>
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border" data-chart-type="tympanometry">
        <TympanometryChartUI data={data} />
      </div>
    </div>
  )
}
