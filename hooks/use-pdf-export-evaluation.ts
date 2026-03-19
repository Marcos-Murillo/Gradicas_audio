import { useState, useCallback } from 'react'
import { pdfExportService } from '@/lib/pdf-export'
import type { EvaluacionAuditiva } from '@/types/evaluation'
import { toast } from 'sonner'

export function usePDFExportEvaluation() {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = useCallback(async (evaluation: EvaluacionAuditiva) => {
    setIsExporting(true)
    try {
      await pdfExportService.exportEvaluationToPDF(evaluation)
      toast.success('PDF generado exitosamente')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast.error(error instanceof Error ? error.message : 'Error al generar el PDF')
    } finally {
      setIsExporting(false)
    }
  }, [])

  return { exportToPDF, isExporting }
}
