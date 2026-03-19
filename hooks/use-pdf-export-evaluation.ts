import { useState, useCallback, useRef } from 'react'
import { pdfExportService } from '@/lib/pdf-export'
import type { EvaluacionAuditiva } from '@/types/evaluation'
import { toast } from 'sonner'

/**
 * Hook personalizado para exportar evaluaciones auditivas a PDF
 * 
 * Proporciona funcionalidad para:
 * - Exportar el informe consolidado a PDF
 * - Manejar estados de carga
 * - Mostrar notificaciones de éxito/error
 * 
 * Requirements: 12.1-12.8
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { exportToPDF, isExporting, reportRef } = usePDFExportEvaluation()
 *   
 *   return (
 *     <div>
 *       <div ref={reportRef}>
 *         <ConsolidatedReport evaluation={evaluation} onExportPDF={exportToPDF} />
 *       </div>
 *     </div>
 *   )
 * }
 * ```
 */
export function usePDFExportEvaluation() {
  const [isExporting, setIsExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  /**
   * Exporta la evaluación auditiva a PDF
   * 
   * @param evaluation - La evaluación auditiva a exportar
   * @returns Promise que se resuelve cuando el PDF se ha generado
   */
  const exportToPDF = useCallback(async (evaluation: EvaluacionAuditiva) => {
    if (!reportRef.current) {
      toast.error('No se encontró el elemento del informe')
      return
    }

    setIsExporting(true)

    try {
      await pdfExportService.exportEvaluationToPDF(evaluation, reportRef.current)
      toast.success('PDF generado exitosamente')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error(error instanceof Error ? error.message : 'Error al generar el PDF')
    } finally {
      setIsExporting(false)
    }
  }, [])

  return {
    /**
     * Función para exportar la evaluación a PDF
     */
    exportToPDF,
    
    /**
     * Indica si se está exportando actualmente
     */
    isExporting,
    
    /**
     * Referencia al elemento del informe que se exportará
     * Debe asignarse al contenedor del ConsolidatedReport
     */
    reportRef,
  }
}

