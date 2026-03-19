"use client"

import { useRef, useImperativeHandle, forwardRef, useEffect, useState } from "react"
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

interface HiddenChartRendererProps {
  title: string
  columnA: string
  columnB: string
  rows: { a: number; b: number }[]
}

export interface HiddenChartRendererRef {
  getChartElement: () => HTMLDivElement | null
}

const CustomDot = (props: any) => {
  const { cx, cy } = props
  if (cx === undefined || cy === undefined) return null
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill="#10b981"
      stroke="#ffffff"
      strokeWidth={2}
    />
  )
}

export const HiddenChartRenderer = forwardRef<HiddenChartRendererRef, HiddenChartRendererProps>(
  ({ title, columnA, columnB, rows }, ref) => {
    const chartRef = useRef<HTMLDivElement>(null)
    const [isReady, setIsReady] = useState(false)

    useImperativeHandle(ref, () => ({
      getChartElement: () => chartRef.current,
    }))

    // Force re-render after mount to ensure all elements are rendered
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 100)
      return () => clearTimeout(timer)
    }, [])

    const data = rows.map((row) => ({
      name: row.a,
      value: row.b,
    }))

    return (
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: "0",
          width: "1200px",
          height: "600px",
          visibility: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          ref={chartRef}
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            border: "none",
            boxShadow: "none",
            width: "1200px",
            height: "600px",
          }}
        >
          <h3
            style={{
              marginBottom: "20px",
              textAlign: "center",
              fontSize: "18px",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            {title || "Grafica Medica"}
          </h3>
          <div style={{ width: "100%", height: "500px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="colorValueHidden" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="5 5"
                  stroke="#d1d5db"
                  strokeWidth={1}
                  vertical={true}
                  horizontal={true}
                />
                <XAxis
                  dataKey="name"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  label={{
                    value: columnA || "Columna A",
                    position: "insideBottom",
                    offset: -15,
                    style: { fill: "#64748b", fontSize: 13, fontWeight: 600 },
                  }}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  stroke="#9ca3af"
                  allowDecimals={true}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  label={{
                    value: columnB || "Columna B",
                    angle: -90,
                    position: "insideLeft",
                    offset: -5,
                    style: { fill: "#64748b", fontSize: 13, fontWeight: 600 },
                  }}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  stroke="#9ca3af"
                  allowDecimals={true}
                />
                <Tooltip />
                <Legend
                  wrapperStyle={{ paddingTop: 20, fontSize: 12 }}
                  formatter={() => columnB || "Valor"}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={columnB || "Valor"}
                  stroke="url(#colorValueHidden)"
                  strokeWidth={3}
                  dot={<CustomDot />}
                  activeDot={{ r: 8, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }
)

HiddenChartRenderer.displayName = "HiddenChartRenderer"
