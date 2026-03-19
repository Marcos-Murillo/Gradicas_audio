"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { firebaseService } from "@/lib/firebase-service"
import type { EvaluacionAuditiva } from "@/types/evaluation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ConsolidatedReport } from "@/components/consolidated-report"
import { pdfExportService } from "@/lib/pdf-export"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Search, Eye, Edit, Trash2, ArrowLeft, Loader2, FileText, Stethoscope, Ear } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRef } from "react"

/**
 * Página de evaluaciones guardadas
 * 
 * Permite:
 * - Listar todas las evaluaciones guardadas
 * - Buscar evaluaciones por nombre o apellido (case-insensitive)
 * - Ver informe completo de una evaluación en modal
 * - Editar evaluación existente (carga datos en sessionStorage)
 * - Eliminar evaluación con confirmación
 * - Exportar informe a PDF
 * 
 * Requirements: 14.1-14.10, 15.1-15.7
 */
export default function SavedEvaluationsPage() {
  const router = useRouter()
  const [evaluations, setEvaluations] = useState<EvaluacionAuditiva[]>([])
  const [filteredEvaluations, setFilteredEvaluations] = useState<EvaluacionAuditiva[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluacionAuditiva | null>(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [evaluationToDelete, setEvaluationToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  // Cargar evaluaciones al montar el componente
  useEffect(() => {
    loadEvaluations()
  }, [])

  // Filtrar evaluaciones cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEvaluations(evaluations)
    } else {
      const lowerQuery = searchQuery.toLowerCase()
      const filtered = evaluations.filter(
        (evaluation) =>
          evaluation.paciente.apellido.toLowerCase().includes(lowerQuery) ||
          evaluation.paciente.nombre.toLowerCase().includes(lowerQuery)
      )
      setFilteredEvaluations(filtered)
    }
  }, [searchQuery, evaluations])

  const loadEvaluations = async () => {
    try {
      setLoading(true)
      const data = await firebaseService.getAllEvaluations()
      setEvaluations(data)
      setFilteredEvaluations(data)
    } catch (error) {
      console.error("Error loading evaluations:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las evaluaciones. Por favor recargue la página.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleView = (evaluation: EvaluacionAuditiva) => {
    setSelectedEvaluation(evaluation)
    setShowReportDialog(true)
  }

  const handleEdit = (evaluation: EvaluacionAuditiva) => {
    // Guardar datos en sessionStorage para cargar en la página principal
    sessionStorage.setItem("editingEvaluation", JSON.stringify({
      ...evaluation,
      paciente: {
        ...evaluation.paciente,
        fechaNacimiento: evaluation.paciente.fechaNacimiento.toISOString(),
      },
      fechaExamen: evaluation.fechaExamen.toISOString(),
    }))
    
    toast({
      title: "Cargando evaluación",
      description: "Redirigiendo a la página de edición...",
    })
    
    router.push("/")
  }

  const handleDeleteClick = (id: string) => {
    setEvaluationToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!evaluationToDelete) return

    try {
      setDeleting(true)
      await firebaseService.deleteEvaluation(evaluationToDelete)
      await loadEvaluations()
      setShowDeleteDialog(false)
      setEvaluationToDelete(null)
    } catch (error) {
      console.error("Error deleting evaluation:", error)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
    setEvaluationToDelete(null)
  }

  const handleExportPDF = async () => {
    if (!selectedEvaluation || !reportRef.current) return

    try {
      setExporting(true)
      toast({
        title: "Generando PDF",
        description: "Por favor espere mientras se genera el documento...",
      })

      await pdfExportService.exportEvaluationToPDF(selectedEvaluation, reportRef.current)

      toast({
        title: "PDF generado exitosamente",
        description: "El archivo se ha descargado correctamente.",
      })
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el PDF. Por favor intente nuevamente.",
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/")}
                  aria-label="Volver a la página principal"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Evaluaciones Guardadas
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gestiona y consulta las evaluaciones auditivas almacenadas
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por apellido o nombre del paciente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Buscar evaluaciones"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                {filteredEvaluations.length} resultado(s) encontrado(s)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Evaluations List */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-muted-foreground">Cargando evaluaciones...</p>
            </CardContent>
          </Card>
        ) : filteredEvaluations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {searchQuery
                  ? "No se encontraron evaluaciones"
                  : "No hay evaluaciones guardadas"}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Intenta con otro término de búsqueda"
                  : "Las evaluaciones que crees aparecerán aquí"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEvaluations.map((evaluation) => (
              <EvaluationCard
                key={evaluation.id}
                evaluation={evaluation}
                onView={() => handleView(evaluation)}
                onEdit={() => handleEdit(evaluation)}
                onDelete={() => handleDeleteClick(evaluation.id!)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Informe Consolidado</DialogTitle>
            <DialogDescription>
              Visualización completa de la evaluación auditiva
            </DialogDescription>
          </DialogHeader>
          {selectedEvaluation && (
            <div ref={reportRef}>
              <ConsolidatedReport
                evaluation={selectedEvaluation}
                onExportPDF={handleExportPDF}
              />
            </div>
          )}
          {exporting && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium">Generando PDF...</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta evaluación? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Componente de tarjeta de evaluación individual
 * 
 * Muestra información resumida de una evaluación con acciones disponibles
 */
interface EvaluationCardProps {
  evaluation: EvaluacionAuditiva
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

function EvaluationCard({
  evaluation,
  onView,
  onEdit,
  onDelete,
}: EvaluationCardProps) {
  const { paciente, fechaExamen, pruebas } = evaluation

  // Formatear fecha del examen
  const fechaStr = format(fechaExamen, "dd/MM/yyyy HH:mm", { locale: es })

  // Obtener iconos y nombres de las pruebas
  const getPruebaInfo = (tipo: string) => {
    switch (tipo) {
      case "tonal":
        return { nombre: "Audiometría Tonal", icon: Ear }
      case "logoaudiometria":
        return { nombre: "Logoaudiometría", icon: Stethoscope }
      case "timpanometria":
        return { nombre: "Timpanometría", icon: FileText }
      default:
        return { nombre: tipo, icon: FileText }
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Patient Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {paciente.apellido}, {paciente.nombre}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <span className="font-medium">Fecha del examen:</span>
                {fechaStr}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {pruebas.map((prueba, index) => {
                const info = getPruebaInfo(prueba.tipo)
                const Icon = info.icon
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-1.5"
                  >
                    <Icon className="h-3 w-3" />
                    {info.nombre}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
