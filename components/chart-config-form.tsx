"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table2, Settings2 } from "lucide-react"

interface ChartConfigFormProps {
  title: string
  patient: string
  columnA: string
  columnB: string
  rowCount: number
  onTitleChange: (value: string) => void
  onPatientChange: (value: string) => void
  onColumnAChange: (value: string) => void
  onColumnBChange: (value: string) => void
  onRowCountChange: (value: number) => void
  onGenerate: () => void
  hasData: boolean
}

export function ChartConfigForm({
  title,
  patient,
  columnA,
  columnB,
  rowCount,
  onTitleChange,
  onPatientChange,
  onColumnAChange,
  onColumnBChange,
  onRowCountChange,
  onGenerate,
  hasData,
}: ChartConfigFormProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Settings2 className="h-5 w-5 text-blue-500" />
          Configurar Datos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="chart-title" className="text-sm font-medium text-foreground">
            Nombre de la Grafica
          </Label>
          <Input
            id="chart-title"
            placeholder=""
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-background"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="patient" className="text-sm font-medium text-foreground">
            Paciente
          </Label>
          <Input
            id="patient"
            placeholder=""
            value={patient}
            onChange={(e) => onPatientChange(e.target.value)}
            className="bg-background"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="col-a" className="text-sm font-medium text-foreground">
              Columna A (Eje X)
            </Label>
            <Input
              id="col-a"
              placeholder=""
              value={columnA}
              onChange={(e) => onColumnAChange(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="col-b" className="text-sm font-medium text-foreground">
              Columna B (Eje Y)
            </Label>
            <Input
              id="col-b"
              placeholder=""
              value={columnB}
              onChange={(e) => onColumnBChange(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="row-count" className="text-sm font-medium text-foreground">
            Numero de Filas (1-50)
          </Label>
          <Input
            id="row-count"
            type="text"
            inputMode="numeric"
            placeholder=""
            value={rowCount === 0 ? "" : rowCount}
            onChange={(e) => {
              if (e.target.value === "") {
                return
              }
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val) && val >= 1 && val <= 50) {
                onRowCountChange(val)
              }
            }}
            className="max-w-32 bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <Button
          onClick={onGenerate}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 md:w-auto"
        >
          <Table2 className="h-4 w-4" />
          {hasData ? "Regenerar Tabla" : "Generar Tabla"}
        </Button>
      </CardContent>
    </Card>
  )
}
