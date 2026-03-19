"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts"

import type { DatosTimpanometria } from "@/types/evaluation"
import { generateTympanogramCurve } from "@/lib/chart-generators"

interface TympanometryChartProps {
  data: DatosTimpanometria
  width?: number
  height?: number
}

/**
 * Componente de gráfica de timpanometría
 * 
 * Genera un timpanograma con:
 * - Eje X: Presión en decapascales (daPa) de -400 a +200
 * - Eje Y: Cumplimiento en mililitros (ml) de 0 a 3
 * - Serie OD (Oído Derecho): área roja semi-transparente
 * - Serie OI (Oído Izquierdo): área azul semi-transparente
 * - Peak markers: puntos en la presión pico de cada oído
 * 
 * Requirements: 10.1-10.8
 */
export function TympanometryChart({ data, width, height = 400 }: TympanometryChartProps) {
  // Generar curvas timpanométricas para ambos oídos
  const curveOD = generateTympanogramCurve(
    data.derecho.tipoCurva,
    data.derecho.presionPico,
    data.derecho.cumplimiento
  )
  
  const curveOI = generateTympanogramCurve(
    data.izquierdo.tipoCurva,
    data.izquierdo.presionPico,
    data.izquierdo.cumplimiento
  )

  // Combinar datos para Recharts
  const chartData = curveOD.map((point, index) => ({
    presion: point.presion,
    od: point.cumplimiento,
    oi: curveOI[index]?.cumplimiento,
  }))

  // Crear markers para los picos de presión
  const peakOD = {
    presion: data.derecho.presionPico,
    cumplimiento: data.derecho.cumplimiento,
  }

  const peakOI = {
    presion: data.izquierdo.presionPico,
    cumplimiento: data.izquierdo.cumplimiento,
  }

  return (
    <div style={{ width: width || "100%", height: height || 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#d1d5db"
            strokeWidth={1}
          />
          <XAxis
            dataKey="presion"
            type="number"
            domain={[-400, 200]}
            label={{
              value: "Presión (daPa)",
              position: "insideBottom",
              offset: -15,
              style: { fill: "#64748b", fontSize: 13, fontWeight: 600 },
            }}
            tick={{ fill: "#64748b", fontSize: 11 }}
            stroke="#9ca3af"
          />
          <YAxis
            domain={[0, 'auto']}
            label={{
              value: "Cumplimiento (ml)",
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
            labelFormatter={(value) => `${value} daPa`}
            formatter={(value: any, name: string) => {
              if (value === undefined || value === null) return ["N/A", ""]
              const label = name === "od" ? "OD" : "OI"
              return [`${value.toFixed(2)} ml`, label]
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: 20, fontSize: 12 }}
            iconType="rect"
          />
          <Area
            type="monotone"
            dataKey="od"
            name="Oído Derecho (OD)"
            stroke="#ef4444"
            strokeWidth={2}
            fill="#ef4444"
            fillOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="oi"
            name="Oído Izquierdo (OI)"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="#3b82f6"
            fillOpacity={0.3}
          />
          <ReferenceDot
            x={peakOD.presion}
            y={peakOD.cumplimiento}
            r={6}
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth={2}
          />
          <ReferenceDot
            x={peakOI.presion}
            y={peakOI.cumplimiento}
            r={6}
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
