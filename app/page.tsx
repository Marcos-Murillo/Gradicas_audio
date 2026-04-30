"use client"

import { useState, useRef, useCallback } from "react"
import { TestSelector } from "@/components/test-selector"
import { PatientForm } from "@/components/patient-form"
import { AudiometryForm } from "@/components/audiometry-form"
import { LogoaudiometryForm } from "@/components/logoaudiometry-form"
import { TympanometryForm } from "@/components/tympanometry-form"
import { ExaminerForm } from "@/components/examiner-form"
import { ConsolidatedReport } from "@/components/consolidated-report"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Activity, FileText, Loader2, FolderOpen } from "lucide-react"
import { toast } from "sonner"
import type {
  TipoPrueba,
  Paciente,
  DatosPrueba,
  DatosAudiometriaTonal,
  DatosLogoaudiometria,
  DatosTimpanometria,
  Examinador,
  EvaluacionAuditiva,
} from "@/types/evaluation"
import { firebaseService } from "@/lib/firebase-service"
import { pdfExportService } from "@/lib/pdf-export"
import { evaluacionAuditivaSchema } from "@/lib/validation-schemas"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  
  // Test selection state
  const [selectedTests, setSelectedTests] = useState<TipoPrueba[]>([])

  // Form data state
  const [patientData, setPatientData] = useState<Paciente | null>(null)
  const [audiometryData, setAudiometryData] = useState<DatosAudiometriaTonal | null>(null)
  const [logoaudiometryData, setLogoaudiometryData] = useState<DatosLogoaudiometria | null>(null)
  const [tympanometryData, setTympanometryData] = useState<DatosTimpanometria | null>(null)
  const [examinerData, setExaminerData] = useState<Examinador | null>(null)

  // UI state
  const [showReport, setShowReport] = useState(false)
  const [generatedEvaluation, setGeneratedEvaluation] = useState<EvaluacionAuditiva | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Test selection handlers
  const handleAddTest = (test: TipoPrueba) => {
    if (selectedTests.length < 3 && !selectedTests.includes(test)) {
      setSelectedTests([...selectedTests, test])
    }
  }

  const handleRemoveTest = (test: TipoPrueba) => {
    setSelectedTests(selectedTests.filter((t) => t !== test))
    // Clear data for removed test
    if (test === 'tonal') setAudiometryData(null)
    if (test === 'logoaudiometria') setLogoaudiometryData(null)
    if (test === 'timpanometria') setTympanometryData(null)
  }

  // Form submission handlers with useCallback to prevent re-renders
  const handlePatientSubmit = useCallback((data: Paciente) => {
    setPatientData(data)
  }, [])

  const handleAudiometrySubmit = useCallback((data: DatosAudiometriaTonal) => {
    setAudiometryData(data)
  }, [])

  const handleLogoaudiometrySubmit = useCallback((data: DatosLogoaudiometria) => {
    setLogoaudiometryData(data)
  }, [])

  const handleTympanometrySubmit = useCallback((data: DatosTimpanometria) => {
    setTympanometryData(data)
  }, [])

  const handleExaminerSubmit = useCallback((data: Examinador) => {
    setExaminerData(data)
  }, [])

  // Validation: Check if all required data is complete
  const isDataComplete = (): boolean => {
    if (selectedTests.length === 0) return false
    if (!patientData) return false
    if (!examinerData) return false
    if (selectedTests.includes('tonal') && !audiometryData) return false
    if (selectedTests.includes('logoaudiometria') && !logoaudiometryData) return false
    if (selectedTests.includes('timpanometria') && !tympanometryData) return false
    return true
  }

  // Returns a human-readable list of what's still missing
  const getMissingFields = (): string[] => {
    const missing: string[] = []
    if (selectedTests.length === 0) missing.push("Selecciona al menos una prueba")
    if (!patientData) missing.push("Datos del paciente")
    if (selectedTests.includes('tonal') && !audiometryData) missing.push("Audiometría Tonal (completa al menos 4 frecuencias por oído y pierde el foco)")
    if (selectedTests.includes('logoaudiometria') && !logoaudiometryData) missing.push("Logoaudiometría")
    if (selectedTests.includes('timpanometria') && !tympanometryData) missing.push("Timpanometría")
    if (!examinerData) missing.push("Datos del examinador")
    return missing
  }

  // Generate consolidated report
  const handleGenerateReport = async () => {
    if (!isDataComplete()) {
      toast.error("Por favor complete todos los campos requeridos")
      return
    }

    // Build pruebas array based on selected tests
    const pruebas: DatosPrueba[] = []
    if (selectedTests.includes('tonal') && audiometryData) {
      pruebas.push(audiometryData)
    }
    if (selectedTests.includes('logoaudiometria') && logoaudiometryData) {
      pruebas.push(logoaudiometryData)
    }
    if (selectedTests.includes('timpanometria') && tympanometryData) {
      pruebas.push(tympanometryData)
    }

    // Create evaluation object
    const evaluation: EvaluacionAuditiva = {
      paciente: patientData!,
      pruebas,
      examinador: examinerData!,
      fechaExamen: new Date(),
    }

    // Validate with Zod schema
    const validationResult = evaluacionAuditivaSchema.safeParse(evaluation)
    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error)
      toast.error("Error de validación. Por favor revise los datos ingresados.")
      return
    }

    // Save to Firebase automatically
    setIsSaving(true)
    try {
      const id = await firebaseService.saveEvaluation(evaluation)
      evaluation.id = id
      setGeneratedEvaluation(evaluation)
      setShowReport(true)
      toast.success("Informe generado y guardado exitosamente")
    } catch (error) {
      console.error("Error saving evaluation:", error)
      toast.error("Error al guardar la evaluación")
    } finally {
      setIsSaving(false)
    }
  }

  // Export to PDF
  const handleExportPDF = async () => {
    if (!generatedEvaluation) {
      toast.error("No hay evaluación para exportar");
      return;
    }

    try {
      toast.info("Generando PDF...");

      // Generar PDF
      await pdfExportService.exportEvaluationToPDF(generatedEvaluation);
      toast.success("PDF exportado exitosamente");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Error al exportar el PDF");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-foreground">
                Sistema Evaluación Auditiva
              </h1>
              <p className="text-xs text-muted-foreground">
                Universidad del Valle
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/saved")}
              className="gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              Evaluaciones Guardadas
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="flex flex-col gap-8">
          {/* Test Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Nueva Evaluación Auditiva</CardTitle>
            </CardHeader>
            <CardContent>
              <TestSelector
                selectedTests={selectedTests}
                onAddTest={handleAddTest}
                onRemoveTest={handleRemoveTest}
              />
            </CardContent>
          </Card>

          {/* Patient Form - Always visible */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientForm
                onSubmit={handlePatientSubmit}
                initialData={patientData || undefined}
              />
            </CardContent>
          </Card>

          {/* Test Forms - Conditional rendering */}
          {selectedTests.includes('tonal') && (
            <Card>
              <CardHeader>
                <CardTitle>Audiometría Tonal</CardTitle>
              </CardHeader>
              <CardContent>
                <AudiometryForm
                  onSubmit={handleAudiometrySubmit}
                  initialData={audiometryData || undefined}
                />
              </CardContent>
            </Card>
          )}

          {selectedTests.includes('logoaudiometria') && (
            <Card>
              <CardHeader>
                <CardTitle>Logoaudiometría</CardTitle>
              </CardHeader>
              <CardContent>
                <LogoaudiometryForm
                  onSubmit={handleLogoaudiometrySubmit}
                  initialData={logoaudiometryData || undefined}
                />
              </CardContent>
            </Card>
          )}

          {selectedTests.includes('timpanometria') && (
            <Card>
              <CardHeader>
                <CardTitle>Timpanometría</CardTitle>
              </CardHeader>
              <CardContent>
                <TympanometryForm
                  onSubmit={handleTympanometrySubmit}
                  initialData={tympanometryData || undefined}
                />
              </CardContent>
            </Card>
          )}

          {/* Examiner Form - Always visible */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Examinador</CardTitle>
            </CardHeader>
            <CardContent>
              <ExaminerForm
                onSubmit={handleExaminerSubmit}
                initialData={examinerData || undefined}
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Generate Report Button */}
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={handleGenerateReport}
              disabled={isSaving}
              size="lg"
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 px-8 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  GENERAR INFORME COMPLETO
                </>
              )}
            </Button>
            {!isDataComplete() && getMissingFields().length > 0 && (
              <ul className="text-xs text-muted-foreground text-center space-y-0.5">
                {getMissingFields().map((msg, i) => (
                  <li key={i} className="flex items-center gap-1 justify-center">
                    <span className="text-amber-500">●</span> {msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* Consolidated Report Modal */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Informe Consolidado</DialogTitle>
          </DialogHeader>
          {generatedEvaluation && (
            <ConsolidatedReport
              evaluation={generatedEvaluation}
              onExportPDF={handleExportPDF}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="mt-12 border-t border-border bg-card/50 px-4 py-6 text-center text-xs text-muted-foreground lg:px-8">
        Sistema de Evaluación Auditiva Profesional &mdash; Universidad del Valle
      </footer>
    </div>
  )
}
