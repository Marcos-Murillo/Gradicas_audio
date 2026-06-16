"use client"

import type { DatosLogoaudiometria, PuntoLogoaudiometria } from "@/types/evaluation"
import { CoordinateLineChart } from "@/components/coordinate-line-chart"
import type { Coordinate } from "@/components/coordinate-line-chart"

function calcPct(correctas: number) {
  return Math.round((correctas / 10) * 100)
}

function toCoords(puntos: PuntoLogoaudiometria[]): Coordinate[] {
  return puntos
    .map(p => ({
      x: Number(p.db),
      y: calcPct(Number(p.correctas)),
    }))
    .filter(p => !Number.isNaN(p.x) && !Number.isNaN(p.y))
    .sort((a, b) => a.x - b.x)
}

function computeXRange(all: Coordinate[]): { xMin: number; xMax: number } {
  if (all.length === 0) return { xMin: 0, xMax: 100 }
  const xs = all.map(p => p.x)
  const min = Math.min(...xs)
  const max = Math.max(...xs)
  const pad = Math.max(10, Math.round((max - min) * 0.15))
  return {
    xMin: Math.max(0, Math.floor((min - pad) / 10) * 10),
    xMax: Math.ceil((max + pad) / 10) * 10,
  }
}

type ChartSeries = {
  name: string
  color: string
  coords: Coordinate[]
}

function buildSeries(data: DatosLogoaudiometria): ChartSeries[] {
  const series: ChartSeries[] = [
    { name: "OD (Oído Derecho)", color: "#dc2626", coords: toCoords(data.puntos.derecho ?? []) },
    { name: "OI (Oído Izquierdo)", color: "#2563eb", coords: toCoords(data.puntos.izquierdo ?? []) },
  ]

  const maskedOD = toCoords(data.puntos.derecho_enmascarado ?? [])
  const maskedOI = toCoords(data.puntos.izquierdo_enmascarado ?? [])

  if (maskedOD.length > 0) {
    series.push({ name: "OD Enmasc.", color: "#dc2626", coords: maskedOD })
  }
  if (maskedOI.length > 0) {
    series.push({ name: "OI Enmasc.", color: "#2563eb", coords: maskedOI })
  }

  return series.filter(s => s.coords.length > 0)
}

export function LogoaudiometryChartUI({ data }: { data: DatosLogoaudiometria }) {
  const series = buildSeries(data)
  const allCoords = series.flatMap(s => s.coords)

  if (allCoords.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No hay datos suficientes para graficar. Agrega al menos un nivel por oído.
      </p>
    )
  }

  const { xMin, xMax } = computeXRange(allCoords)

  return (
    <CoordinateLineChart
      title="Logoaudiometría — Curva de Reconocimiento del Habla"
      height={400}
      xMinValue={xMin}
      xMaxValue={xMax}
      yMinValue={0}
      yMaxValue={100}
      legendNames={series.map(s => s.name)}
      coordinateNames={{ x: "Intensidad (dB)", y: "Discriminación (%)" }}
      colors={series.map(s => s.color)}
      coordinates={series.map(s => s.coords)}
    />
  )
}
