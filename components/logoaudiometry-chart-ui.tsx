"use client"

import type { DatosLogoaudiometria } from "@/types/evaluation"
import { generateSigmoidCurve } from "@/lib/chart-generators"
import { CoordinateLineChart } from "@/components/coordinate-line-chart"
import type { Coordinate } from "@/components/coordinate-line-chart"

export function LogoaudiometryChartUI({ data }: { data: DatosLogoaudiometria }) {
  const curveOD = generateSigmoidCurve(data.srt.derecho, data.sds.derecho)
  const curveOI = generateSigmoidCurve(data.srt.izquierdo, data.sds.izquierdo)

  const coordinatesOD: Coordinate[] = curveOD.map((p) => ({ x: p.db, y: p.percentage }))
  const coordinatesOI: Coordinate[] = curveOI.map((p) => ({ x: p.db, y: p.percentage }))

  return (
    <CoordinateLineChart
      title="Logoaudiometría — Curva de Reconocimiento del Habla"
      height={400}
      xMinValue={0}
      xMaxValue={100}
      yMinValue={0}
      yMaxValue={100}
      legendNames={["OD (Oído Derecho)", "OI (Oído Izquierdo)"]}
      coordinateNames={{ x: "Intensidad (dB)", y: "Reconocimiento (%)" }}
      colors={["#dc2626", "#2563eb"]}
      coordinates={[coordinatesOD, coordinatesOI]}
    />
  )
}
