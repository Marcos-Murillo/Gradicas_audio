"use client"

import type { DatosTimpanometria } from "@/types/evaluation"
import { generateTympanogramCurve } from "@/lib/chart-generators"
import { CoordinateLineChart } from "@/components/coordinate-line-chart"
import type { Coordinate } from "@/components/coordinate-line-chart"

export function TympanometryChartUI({ data }: { data: DatosTimpanometria }) {
  const curveOD = generateTympanogramCurve(
    data.derecho.tipoCurva, data.derecho.presionPico, data.derecho.cumplimiento
  )
  const curveOI = generateTympanogramCurve(
    data.izquierdo.tipoCurva, data.izquierdo.presionPico, data.izquierdo.cumplimiento
  )

  const coordsOD: Coordinate[] = curveOD.map((p) => ({ x: p.presion, y: p.cumplimiento }))
  const coordsOI: Coordinate[] = curveOI.map((p) => ({ x: p.presion, y: p.cumplimiento }))

  const allY = [...coordsOD, ...coordsOI].map((p) => p.y)
  const yMax = Math.ceil(Math.max(...allY) * 1.2 * 10) / 10

  return (
    <CoordinateLineChart
      title="Timpanograma"
      height={400}
      xMinValue={-400}
      xMaxValue={200}
      yMinValue={0}
      yMaxValue={yMax}
      legendNames={[
        `OD — Tipo ${data.derecho.tipoCurva} | ${data.derecho.presionPico} daPa | ${data.derecho.cumplimiento} ml`,
        `OI — Tipo ${data.izquierdo.tipoCurva} | ${data.izquierdo.presionPico} daPa | ${data.izquierdo.cumplimiento} ml`,
      ]}
      coordinateNames={{ x: "Presión (daPa)", y: "Cumplimiento (ml)" }}
      colors={["#dc2626", "#2563eb"]}
      coordinates={[coordsOD, coordsOI]}
    />
  )
}
