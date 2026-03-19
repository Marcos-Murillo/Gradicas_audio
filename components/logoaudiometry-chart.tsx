"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
  ComposedChart,
} from "recharts"

import type { DatosLogoaudiometria } from "@/types/evaluation"
import { generateSigmoidCurve } from "@/lib/chart-generators"

interface LogoaudiometryChartProps {
  data: DatosLogoaudiometria
  width?: number
  height?: number
}

/**
 * Componente de gráfica de logoaudiometría
 * 
 * Genera una gráfica con curvas sigmoideas que representan:
 * - Eje X: Intensidad en dB (0-100)
 * - Eje Y: Reconocimiento en % (0-100)
 * - Serie OD (Oído Derecho): curva roja con markers en SRT y SDS
 * - Serie OI (Oído Izquierdo): curva azul con markers en SRT y SDS
 * 
 * Requirements: 9.1-9.7
 */
export function LogoaudiometryChart({ data, width, height = 400 }: LogoaudiometryChartProps) {
  // Generar curvas sigmoideas para ambos oídos
  const curveOD = generateSigmoidCurve(data.srt.derecho, data.sds.derecho)
  const curveOI = generateSigmoidCurve(data.srt.izquierdo, data.sds.izquierdo)

  // Combinar datos para Recharts
  const chartData = curveOD.map((point, index) => ({
    db: point.db,
    od: point.percentage,
    oi: curveOI[index]?.percentage,
  }))

  // Crear markers para SRT (umbral - aproximadamente 50% del SDS en la curva)
  // y SDS (discriminación máxima - punto más alto de la curva)
  const findPercentageAtDb = (curve: typeof curveOD, targetDb: number) => {
    const point = curve.find(p => p.db >= targetDb)
    return point?.percentage ?? 0
  }

  const markersOD = [
    { 
      db: data.srt.derecho, 
      percentage: findPercentageAtDb(curveOD, data.srt.derecho),
      name: 'SRT OD'
    },
    { 
      db: data.srt.derecho + 40, 
      percentage: data.sds.derecho * 0.95, // Cerca del máximo
      name: 'SDS OD'
    },
  ]

  const markersOI = [
    { 
      db: data.srt.izquierdo, 
      percentage: findPercentageAtDb(curveOI, data.srt.izquierdo),
      name: 'SRT OI'
    },
    { 
      db: data.srt.izquierdo + 40, 
      percentage: data.sds.izquierdo * 0.95, // Cerca del máximo
      name: 'SDS OI'
    },
  ]

  return (
    <div style={{ width: width || "100%", height: height || 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#d1d5db"
            strokeWidth={1}
          />
          <XAxis
            dataKey="db"
            type="number"
            domain={[0, 100]}
            label={{
              value: "Intensidad (dB)",
              position: "insideBottom",
              offset: -15,
              style: { fill: "#64748b", fontSize: 13, fontWeight: 600 },
            }}
            tick={{ fill: "#64748b", fontSize: 11 }}
            stroke="#9ca3af"
          />
          <YAxis
            domain={[0, 100]}
            label={{
              value: "Reconocimiento (%)",
              angle: -90,
              position: "insideLeft",
              offset: 0,
              style: { fill: "#64748b", fontSize: 13, fontWeight: 600 },
            }}
            tick={{ fill: "#64748b", fontSize: 11 }}
            stroke="#9ca3af"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "8px 12px",
            }}
            labelFormatter={(value) => `${value} dB`}
            formatter={(value: any, name: string) => {
              if (value === undefined || value === null) return ["N/A", ""]
              const label = name === "od" ? "OD" : "OI"
              return [`${value.toFixed(1)}%`, label]
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: 20, fontSize: 12 }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="od"
            name="Oído Derecho (OD)"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="oi"
            name="Oído Izquierdo (OI)"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Scatter
            data={markersOD}
            fill="#ef4444"
            shape="circle"
          />
          <Scatter
            data={markersOI}
            fill="#3b82f6"
            shape="circle"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
