"use client"

import type { DatosLogoaudiometria } from "@/types/evaluation"
import { CoordinateLineChart } from "@/components/coordinate-line-chart"
import type { Coordinate } from "@/components/coordinate-line-chart"

function calcPct(correctas: number) {
  return Math.round((correctas / 10) * 100);
}

export function LogoaudiometryChartUI({ data }: { data: DatosLogoaudiometria }) {
  const coordinatesOD: Coordinate[] = data.puntos.derecho
    .map(p => ({ x: p.db, y: calcPct(p.correctas) }))
    .sort((a, b) => a.x - b.x);

  const coordinatesOI: Coordinate[] = data.puntos.izquierdo
    .map(p => ({ x: p.db, y: calcPct(p.correctas) }))
    .sort((a, b) => a.x - b.x);

  return (
    <CoordinateLineChart
      title="Logoaudiometría — Curva de Reconocimiento del Habla"
      height={400}
      xMinValue={0}
      xMaxValue={100}
      yMinValue={0}
      yMaxValue={100}
      legendNames={["OD (Oído Derecho)", "OI (Oído Izquierdo)"]}
      coordinateNames={{ x: "Intensidad (dB)", y: "Discriminación (%)" }}
      colors={["#dc2626", "#2563eb"]}
      coordinates={[coordinatesOD, coordinatesOI]}
    />
  )
}
