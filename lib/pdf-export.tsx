import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { PDFDocument } from '@/components/pdf-document';
import type { EvaluacionAuditiva } from '@/types/evaluation';

/**
 * Interfaz del servicio de exportación a PDF
 * 
 * Requirements: 12.1-12.8
 */
export interface PDFExportService {
  exportEvaluationToPDF(evaluation: EvaluacionAuditiva): Promise<void>;
}

/**
 * Implementación del servicio de exportación a PDF usando @react-pdf/renderer
 * 
 * Genera PDFs nativos en formato A4 con:
 * - Encabezado institucional "Sistema Evaluación Auditiva - Universidad del Valle"
 * - Todo el contenido del informe consolidado
 * - Gráficas capturadas como imágenes
 * - Datos estructurados y legibles
 * - Nombre de archivo: "Evaluacion_[Apellido]_[Nombre]_[Fecha].pdf"
 * 
 * Requirements: 12.1-12.8
 */
export class ReactPDFExportService implements PDFExportService {
  /**
   * Exporta una evaluación auditiva a PDF
   * 
   * @param evaluation - La evaluación auditiva a exportar
   * @param chartImages - Imágenes base64 de las gráficas (opcional)
   * @throws Error si falla la generación del PDF
   * 
   * Requirements: 12.1-12.8
   */
  async exportEvaluationToPDF(evaluation: EvaluacionAuditiva): Promise<void> {
    try {
      // Generar el documento PDF usando @react-pdf/renderer
      const blob = await pdf(
        <PDFDocument evaluation={evaluation} />
      ).toBlob();

      // Generar nombre de archivo (Requirement 12.8)
      const fecha = evaluation.fechaExamen.toISOString().split('T')[0];
      const fileName = `Evaluacion_${evaluation.paciente.apellido}_${evaluation.paciente.nombre}_${fecha}.pdf`;

      // Crear enlace de descarga y hacer clic automáticamente
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Error al generar el PDF. Por favor intente nuevamente.');
    }
  }
}

/**
 * Instancia singleton del servicio de exportación PDF
 */
export const pdfExportService = new ReactPDFExportService();
