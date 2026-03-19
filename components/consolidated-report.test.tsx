import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConsolidatedReport } from './consolidated-report'
import type { EvaluacionAuditiva } from '@/types/evaluation'

/**
 * Unit tests for ConsolidatedReport component
 * 
 * Validates: Requirements 11.1-11.9
 */
describe('ConsolidatedReport', () => {
  const mockEvaluation: EvaluacionAuditiva = {
    id: 'test-123',
    paciente: {
      apellido: 'García',
      nombre: 'María',
      fechaNacimiento: new Date('1990-05-15'),
      sexo: 'femenino',
    },
    pruebas: [
      {
        tipo: 'tonal',
        oido_derecho: {
          '250': 20,
          '500': 25,
          '1000': 30,
          '2000': 35,
          '4000': 40,
          '8000': 45,
        },
        oido_izquierdo: {
          '250': 15,
          '500': 20,
          '1000': 25,
          '2000': 30,
          '4000': 35,
          '8000': 40,
        },
      },
      {
        tipo: 'logoaudiometria',
        srt: {
          derecho: 25,
          izquierdo: 20,
        },
        sds: {
          derecho: 95,
          izquierdo: 98,
        },
      },
      {
        tipo: 'timpanometria',
        derecho: {
          tipoCurva: 'A',
          presionPico: -10,
          cumplimiento: 0.8,
        },
        izquierdo: {
          tipoCurva: 'A',
          presionPico: -5,
          cumplimiento: 0.9,
        },
      },
    ],
    examinador: {
      nombre: 'Dr. Juan Pérez',
      codigo: '123456',
    },
    fechaExamen: new Date('2024-01-15T10:30:00'),
  }

  const mockOnExportPDF = vi.fn()

  it('should render institutional header', () => {
    render(<ConsolidatedReport evaluation={mockEvaluation} onExportPDF={mockOnExportPDF} />)
    
    expect(screen.getByText('SISTEMA EVALUACIÓN AUDITIVA')).toBeInTheDocument()
    expect(screen.getByText('Universidad del Valle')).toBeInTheDocument()
  })

  it('should display patient data', () => {
    render(<ConsolidatedReport evaluation={mockEvaluation} onExportPDF={mockOnExportPDF} />)
    
    expect(screen.getByText('García')).toBeInTheDocument()
    expect(screen.getByText('María')).toBeInTheDocument()
    // Date might vary by timezone, just check it's present
    expect(screen.getByText(/\d{2}\/\d{2}\/1990/)).toBeInTheDocument()
    expect(screen.getByText('Femenino')).toBeInTheDocument()
  })

  it('should display exam date and time', () => {
    render(<ConsolidatedReport evaluation={mockEvaluation} onExportPDF={mockOnExportPDF} />)
    
    expect(screen.getByText('15/01/2024 10:30')).toBeInTheDocument()
  })

  it('should display all selected tests', () => {
    render(<ConsolidatedReport evaluation={mockEvaluation} onExportPDF={mockOnExportPDF} />)
    
    expect(screen.getByText('1. Audiometría Tonal')).toBeInTheDocument()
    expect(screen.getByText('2. Logoaudiometría')).toBeInTheDocument()
    expect(screen.getByText('3. Timpanometría')).toBeInTheDocument()
  })

  it('should display audiometry data for both ears', () => {
    render(<ConsolidatedReport evaluation={mockEvaluation} onExportPDF={mockOnExportPDF} />)
    
    // Check OD data
    expect(screen.getByText(/250 Hz: 20 dB/)).toBeInTheDocument()
    expect(screen.getByText(/500 Hz: 25 dB/)).toBeInTheDocument()
    
    // Check OI data
    expect(screen.getByText(/250 Hz: 15 dB/)).toBeInTheDocument()
    expect(screen.getByText(/500 Hz: 20 dB/)).toBeInTheDocument()
  })

  it('should display logoaudiometry SRT and SDS values', () => {
    render(<ConsolidatedReport evaluation={mockEvaluation} onExportPDF={mockOnExportPDF} />)
    
    expect(screen.getByText(/OD: 25 dB/)).toBeInTheDocument()
    expect(screen.getByText(/OI: 20 dB/)).toBeInTheDocument()
    expect(screen.getByText(/OD: 95%/)).toBeInTheDocument()
    expect(screen.getByText(/OI: 98%/)).toBeInTheDocument()
  })

  it('should display tympanometry data for both ears', () => {
    render(<ConsolidatedReport evaluation={mockEvaluation} onExportPDF={mockOnExportPDF} />)
    
    // Use getAllByText since both ears have the same curve type
    const curveTypes = screen.getAllByText(/Tipo de Curva: A/)
    expect(curveTypes).toHaveLength(2)
    expect(screen.getByText(/Presión Pico: -10 daPa/)).toBeInTheDocument()
    expect(screen.getByText(/Cumplimiento: 0.8 ml/)).toBeInTheDocument()
  })

  it('should display examiner data', () => {
    render(<ConsolidatedReport evaluation={mockEvaluation} onExportPDF={mockOnExportPDF} />)
    
    expect(screen.getByText('Dr. Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('123456')).toBeInTheDocument()
  })

  it('should render export to PDF button', () => {
    render(<ConsolidatedReport evaluation={mockEvaluation} onExportPDF={mockOnExportPDF} />)
    
    const exportButton = screen.getByRole('button', { name: /exportar a pdf/i })
    expect(exportButton).toBeInTheDocument()
  })

  it('should call onExportPDF when export button is clicked', () => {
    render(<ConsolidatedReport evaluation={mockEvaluation} onExportPDF={mockOnExportPDF} />)
    
    const exportButton = screen.getByRole('button', { name: /exportar a pdf/i })
    exportButton.click()
    
    expect(mockOnExportPDF).toHaveBeenCalledTimes(1)
  })

  it('should render only selected tests', () => {
    const evaluationWithOneTest: EvaluacionAuditiva = {
      ...mockEvaluation,
      pruebas: [mockEvaluation.pruebas[0]], // Only audiometry
    }

    render(<ConsolidatedReport evaluation={evaluationWithOneTest} onExportPDF={mockOnExportPDF} />)
    
    expect(screen.getByText('1. Audiometría Tonal')).toBeInTheDocument()
    expect(screen.queryByText('2. Logoaudiometría')).not.toBeInTheDocument()
    expect(screen.queryByText('3. Timpanometría')).not.toBeInTheDocument()
  })

  it('should handle missing frequency data gracefully', () => {
    const evaluationWithPartialData: EvaluacionAuditiva = {
      ...mockEvaluation,
      pruebas: [
        {
          tipo: 'tonal',
          oido_derecho: {
            '250': 20,
            '500': 25,
            '1000': 30,
            '2000': 35,
          },
          oido_izquierdo: {
            '250': 15,
            '500': 20,
          },
        },
      ],
    }

    render(<ConsolidatedReport evaluation={evaluationWithPartialData} onExportPDF={mockOnExportPDF} />)
    
    // Use getAllByText since both ears will have N/A for missing frequencies
    const naValues = screen.getAllByText(/Hz: N\/A/)
    expect(naValues.length).toBeGreaterThan(0)
  })

  it('should capitalize patient sex correctly', () => {
    const evaluationMasculino: EvaluacionAuditiva = {
      ...mockEvaluation,
      paciente: {
        ...mockEvaluation.paciente,
        sexo: 'masculino',
      },
    }

    render(<ConsolidatedReport evaluation={evaluationMasculino} onExportPDF={mockOnExportPDF} />)
    
    expect(screen.getByText('Masculino')).toBeInTheDocument()
  })
})
