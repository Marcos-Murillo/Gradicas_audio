"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Trash2, FileBarChart, Loader2 } from "lucide-react"
import type { ChartDocument } from "@/lib/firebase"

interface SavedChartsProps {
  charts: ChartDocument[]
  loading: boolean
  onLoad: (chart: ChartDocument) => void
  onDelete: (id: string) => void
  deletingId: string | null
}

export function SavedCharts({ charts, loading, onLoad, onDelete, deletingId }: SavedChartsProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Database className="h-5 w-5 text-primary" />
          Graficas Guardadas
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando graficas...
          </div>
        ) : charts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <FileBarChart className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No hay graficas guardadas aun.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Crea y guarda tu primera grafica.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {charts.map((chart) => (
              <div
                key={chart.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <button
                  onClick={() => onLoad(chart)}
                  className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
                >
                  <span className="truncate text-sm font-medium text-foreground">
                    {chart.title || "Sin titulo"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {chart.columnA} / {chart.columnB} &middot; {chart.rows.length} filas
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (chart.id) onDelete(chart.id)
                  }}
                  disabled={deletingId === chart.id}
                  aria-label={`Eliminar grafica ${chart.title}`}
                >
                  {deletingId === chart.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
