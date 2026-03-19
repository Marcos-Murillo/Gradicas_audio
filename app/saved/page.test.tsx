import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SavedEvaluationsPage from './page'
import { firebaseService } from '@/lib/firebase-service'
import { pdfExportService } from '@/lib/pdf-export'
import type { EvaluacionAuditiva } from '@/types/evaluation'

// Mock dependencies
vi.mock('@/lib/firebase-service', () => ({
  firebaseService: {
    getAllEvaluations: vi.fn(),
    deleteEvaluation: vi.fn(),
  },
}))

vi.mock('@/lib/pdf-export', () => ({
  pdfExportService: {
    exportEvaluationToPDF: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}))

// Mock data
const mockEvaluation: EvaluacionAuditiva = {
  id: 'test-id-1',
  paciente: {
    apellido: 'García',
    nombre: 'Juan',
    fechaNacimiento: new Date('1990-01-15'),
    sexo: 'masculino',
  },
  pruebas: [
    {
      tipo: 'tonal',
      oido_derecho: { '250': 20, '500': 25, '1000': 30, '2000': 35, '4000': 40, '8000': 45 },
      oido_izquierdo: { '250': 22, '500': 27, '1000': 32, '2000': 37, '4000': 42, '8000': 47 },
    },
  ],
  examinador: {
    nombre: 'Dr. López',
    codigo: '123456',
  },
  fechaExamen: new Date('2024-01-20T10:30:00'),
}

const mockEvaluation2: EvaluacionAuditiva = {
  id: 'test-id-2',
  paciente: {
    apellido: 'Rodríguez',
    nombre: 'María',
    fechaNacimiento: new Date('1985-05-20'),
    sexo: 'femenino',
  },
  pruebas: [
    {
      tipo: 'logoaudiometria',
      srt: { derecho: 25, izquierdo: 30 },
      sds: { derecho: 95, izquierdo: 90 },
    },
  ],
  examinador: {
    nombre: 'Dr. López',
    codigo: '123456',
  },
  fechaExamen: new Date('2024-01-21T14:00:00'),
}

describe('SavedEvaluationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  describe('Loading and Display', () => {
    it('should show loading state initially', () => {
      vi.mocked(firebaseService.getAllEvaluations).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<SavedEvaluationsPage />)
      expect(screen.getByText('Cargando evaluaciones...')).toBeInTheDocument()
    })

    it('should load and display evaluations', async () => {
      vi.mocked(firebaseService.getAllEvaluations).mockResolvedValue([mockEvaluation])

      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
      })
    })

    it('should display multiple evaluations', async () => {
      vi.mocked(firebaseService.getAllEvaluations).mockResolvedValue([
        mockEvaluation,
        mockEvaluation2,
      ])

      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
        expect(screen.getByText('Rodríguez, María')).toBeInTheDocument()
      })
    })

    it('should show empty state when no evaluations exist', async () => {
      vi.mocked(firebaseService.getAllEvaluations).mockResolvedValue([])

      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('No hay evaluaciones guardadas')).toBeInTheDocument()
      })
    })

    it('should display test types for each evaluation', async () => {
      vi.mocked(firebaseService.getAllEvaluations).mockResolvedValue([mockEvaluation])

      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('Audiometría Tonal')).toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    beforeEach(async () => {
      vi.mocked(firebaseService.getAllEvaluations).mockResolvedValue([
        mockEvaluation,
        mockEvaluation2,
      ])
    })

    it('should filter evaluations by apellido', async () => {
      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/Buscar por apellido o nombre/)
      fireEvent.change(searchInput, { target: { value: 'García' } })

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
        expect(screen.queryByText('Rodríguez, María')).not.toBeInTheDocument()
      })
    })

    it('should filter evaluations by nombre', async () => {
      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/Buscar por apellido o nombre/)
      fireEvent.change(searchInput, { target: { value: 'María' } })

      await waitFor(() => {
        expect(screen.queryByText('García, Juan')).not.toBeInTheDocument()
        expect(screen.getByText('Rodríguez, María')).toBeInTheDocument()
      })
    })

    it('should be case-insensitive', async () => {
      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/Buscar por apellido o nombre/)
      fireEvent.change(searchInput, { target: { value: 'GARCÍA' } })

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
      })
    })

    it('should show all evaluations when search is cleared', async () => {
      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/Buscar por apellido o nombre/)
      fireEvent.change(searchInput, { target: { value: 'García' } })

      await waitFor(() => {
        expect(screen.queryByText('Rodríguez, María')).not.toBeInTheDocument()
      })

      fireEvent.change(searchInput, { target: { value: '' } })

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
        expect(screen.getByText('Rodríguez, María')).toBeInTheDocument()
      })
    })

    it('should show no results message when search has no matches', async () => {
      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/Buscar por apellido o nombre/)
      fireEvent.change(searchInput, { target: { value: 'NoExiste' } })

      await waitFor(() => {
        expect(screen.getByText('No se encontraron evaluaciones')).toBeInTheDocument()
      })
    })

    it('should show result count when searching', async () => {
      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/Buscar por apellido o nombre/)
      fireEvent.change(searchInput, { target: { value: 'García' } })

      await waitFor(() => {
        expect(screen.getByText('1 resultado(s) encontrado(s)')).toBeInTheDocument()
      })
    })
  })

  describe('View Functionality', () => {
    it('should open report dialog when clicking Ver button', async () => {
      vi.mocked(firebaseService.getAllEvaluations).mockResolvedValue([mockEvaluation])

      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
      })

      const verButtons = screen.getAllByRole('button', { name: /^Ver$/i })
      fireEvent.click(verButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Informe Consolidado')).toBeInTheDocument()
      })
    })
  })

  describe('Delete Functionality', () => {
    it('should show confirmation dialog when clicking Eliminar button', async () => {
      vi.mocked(firebaseService.getAllEvaluations).mockResolvedValue([mockEvaluation])

      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /Eliminar/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText('Confirmar eliminación')).toBeInTheDocument()
      })
    })

    it('should delete evaluation when confirmed', async () => {
      vi.mocked(firebaseService.getAllEvaluations)
        .mockResolvedValueOnce([mockEvaluation])
        .mockResolvedValueOnce([])
      vi.mocked(firebaseService.deleteEvaluation).mockResolvedValue()

      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /Eliminar/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText('Confirmar eliminación')).toBeInTheDocument()
      })

      const confirmButton = screen.getByRole('button', { name: /^Eliminar$/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(firebaseService.deleteEvaluation).toHaveBeenCalledWith('test-id-1')
      })
    })

    it('should cancel deletion when clicking Cancelar', async () => {
      vi.mocked(firebaseService.getAllEvaluations).mockResolvedValue([mockEvaluation])

      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /Eliminar/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText('Confirmar eliminación')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /Cancelar/i })
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Confirmar eliminación')).not.toBeInTheDocument()
      })

      expect(firebaseService.deleteEvaluation).not.toHaveBeenCalled()
    })
  })

  describe('Edit Functionality', () => {
    it('should save evaluation to sessionStorage when clicking Editar', async () => {
      vi.mocked(firebaseService.getAllEvaluations).mockResolvedValue([mockEvaluation])

      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(screen.getByText('García, Juan')).toBeInTheDocument()
      })

      const editButton = screen.getByRole('button', { name: /Editar/i })
      fireEvent.click(editButton)

      const storedData = sessionStorage.getItem('editingEvaluation')
      expect(storedData).toBeTruthy()

      const parsed = JSON.parse(storedData!)
      expect(parsed.id).toBe('test-id-1')
      expect(parsed.paciente.apellido).toBe('García')
    })
  })

  describe('Error Handling', () => {
    it('should show error toast when loading fails', async () => {
      const { toast } = await import('@/hooks/use-toast')
      vi.mocked(firebaseService.getAllEvaluations).mockRejectedValue(
        new Error('Network error')
      )

      render(<SavedEvaluationsPage />)

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            description: expect.stringContaining('No se pudieron cargar las evaluaciones'),
          })
        )
      })
    })
  })
})
