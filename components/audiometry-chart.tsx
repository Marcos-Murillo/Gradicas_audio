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
} from "recharts"

import type { DatosAudiometriaTonal } from "@/types/evaluation"

interface AudiometryChartProps {
  data: DatosAudiometriaTonal
  width?: number
  height?: number
}

/**
 * Componente de gráfica de audiometría tonal
 * 
 * Genera una gráfica de líneas con:
 * - Eje X: Frecuencias en Hz (250, 500, 1000, 2000, 4000, 8000)
 * - Eje Y: Decibeles (dB)
 * - Serie OD (Oído Derecho): línea roja con círculos
 * - Serie OI (Oído Izquierdo): línea azul con cruces
 * 
 * Requirements: 8.1-8.7
 */
export function AudiometryChart({ data, width, height = 400 }: AudiometryChartProps) {
  // Frecuencias estándar para audiometría
  const frequencies = [250, 500, 1000, 2000, 4000, 8000]

  // Transformar datos al formato requerido por Recharts
  const chartData = frequencies.map((freq) => {
    const freqKey = String(freq) as keyof typeof data.oido_derecho
    return {
      frequency: freq,
      od: data.oido_derecho[freqKey],
      oi: data.oido_izquierdo[freqKey],
    }
  })

  // Validar que hay suficientes datos para mostrar la gráfica
  const odCount = Object.values(data.oido_derecho).filter(v => v !== undefined).length
  const oiCount = Object.values(data.oido_izquierdo).filter(v => v !== undefined).length
  
  if (odCount < 4 && oiCount < 4) {
    return (
      <div 
        className="flex items-center justify-center rounded bg-gray-100 dark:bg-gray-800"
        style={{ height: height || 400 }}
      >
        <p className="text-gray-500 dark:text-gray-400">
          Datos insuficientes para generar la gráfica (se requieren al menos 4 frecuencias por oído)
        </p>
      </div>
    )
  }

  return (
    <div style={{ width: width || "100%", height: height || 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#d1d5db"
            strokeWidth={1}
          />
          <XAxis
            dataKey="frequency"
            type="number"
            domain={[250, 8000]}
            ticks={frequencies}
            label={{
              value: "Frecuencia (Hz)",
              position: "insideBottom",
              offset: -15,
              style: { fill: "#64748b", fontSize: 13, fontWeight: 600 },
            }}
            tick={{ fill: "#64748b", fontSize: 11 }}
            stroke="#9ca3af"
          />
          <YAxis
            domain={[-10, 120]}
            reversed
            label={{
              value: "Intensidad (dB)",
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
            labelFormatter={(value) => `${value} Hz`}
            formatter={(value: any) => {
              if (value === undefined || value === null) return ["N/A", ""]
              return [`${value} dB`, ""]
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
            dot={{ fill: "#ef4444", r: 5, strokeWidth: 2, stroke: "#ffffff" }}
            activeDot={{ r: 7 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="oi"
            name="Oído Izquierdo (OI)"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ 
              fill: "#3b82f6", 
              r: 5, 
              strokeWidth: 2, 
              stroke: "#ffffff",
            }}
            activeDot={{ r: 7 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
