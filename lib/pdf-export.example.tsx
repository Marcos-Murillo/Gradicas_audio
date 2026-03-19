/**
 * Ejemplo de integración del servicio de exportación PDF
 * con el componente ConsolidatedReport
 * 
 * Este archivo muestra cómo usar el hook usePDFExportEvaluation
 * para exportar evaluaciones auditivas a PDF.
 * 
 * Requirements: 12.1-12.8
 */

import { ConsolidatedReport } from '@/components/consolidated-report'
import { usePDFExportEvaluation } from '@/hooks/use-pdf-export-evaluation'
import type { EvaluacionAuditiva } from '@/types/evaluation'

/**
 * Ejemplo 1: Uso básico del hook de exportación PDF
 */
export function EvaluationReportPage({ evaluation }: { evaluation: EvaluacionAuditiva }) {
  const { exportToPDF, isExporting, reportRef } = usePDFExportEvaluation()

  const handleExport = () => {
    exportToPDF(evaluation)
  }

  return (
    <div className="container mx-auto p-4">
      {/* El reportRef debe envolver el ConsolidatedReport */}
      <div ref={reportRef}>
        <ConsolidatedReport 
          evaluation={evaluation} 
          onExportPDF={handleExport}
        />
      </div>
      
      {/* Indicador de carga opcional */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <p className="text-lg font-semibold">Generando PDF...</p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Ejemplo 2: Uso en un modal o diálogo
 */
export function EvaluationModal({ 
  evaluation, 
  isOpen, 
  onClose 
}: { 
  evaluation: EvaluacionAuditiva
  isOpen: boolean
  onClose: () => void
}) {
  const { exportToPDF, isExporting, reportRef } = usePDFExportEvaluation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Informe de Evaluación</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div ref={reportRef} className="p-6">
          <ConsolidatedReport 
            evaluation={evaluation} 
            onExportPDF={() => exportToPDF(evaluation)}
          />
        </div>
        
        {isExporting && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-semibold">Generando PDF...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Ejemplo 3: Uso directo del servicio sin hook
 */
import { pdfExportService } from '@/lib/pdf-export'

export async function exportEvaluationDirectly(
  evaluation: EvaluacionAuditiva,
  reportElement: HTMLElement
) {
  try {
    await pdfExportService.exportEvaluationToPDF(evaluation, reportElement)
    console.log('PDF exported successfully')
  } catch (error) {
    console.error('Failed to export PDF:', error)
    throw error
  }
}

/**
 * Ejemplo 4: Exportación con validación previa
 */
export function EvaluationWithValidation({ evaluation }: { evaluation: EvaluacionAuditiva }) {
  const { exportToPDF, isExporting, reportRef } = usePDFExportEvaluation()

  const handleExportWithValidation = () => {
    // Validar que la evaluación tenga al menos una prueba
    if (!evaluation.pruebas || evaluation.pruebas.length === 0) {
      alert('La evaluación debe tener al menos una prueba')
      return
    }

    // Validar que todos los datos del paciente estén completos
    if (!evaluation.paciente.apellido || !evaluation.paciente.nombre) {
      alert('Los datos del paciente están incompletos')
      return
    }

    // Validar que los datos del examinador estén completos
    if (!evaluation.examinador.nombre || !evaluation.examinador.codigo) {
      alert('Los datos del examinador están incompletos')
      return
    }

    // Si todo está válido, exportar
    exportToPDF(evaluation)
  }

  return (
    <div ref={reportRef}>
      <ConsolidatedReport 
        evaluation={evaluation} 
        onExportPDF={handleExportWithValidation}
      />
    </div>
  )
}

/**
 * Ejemplo 5: Exportación con callback de éxito
 */
export function EvaluationWithCallback({ 
  evaluation,
  onExportSuccess 
}: { 
  evaluation: EvaluacionAuditiva
  onExportSuccess?: () => void
}) {
  const { exportToPDF, isExporting, reportRef } = usePDFExportEvaluation()

  const handleExport = async () => {
    await exportToPDF(evaluation)
    // El hook ya maneja el toast de éxito, pero podemos agregar lógica adicional
    if (onExportSuccess) {
      onExportSuccess()
    }
  }

  return (
    <div ref={reportRef}>
      <ConsolidatedReport 
        evaluation={evaluation} 
        onExportPDF={handleExport}
      />
    </div>
  )
}

