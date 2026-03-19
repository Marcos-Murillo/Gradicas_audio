"use client"

import { useRef } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Download, Loader2 } from "lucide-react"
import { usePDFExport } from "@/hooks/use-pdf-export"

interface ChartDisplayProps {
  title: string
  columnA: string
  columnB: string
  rows: { a: number; b: number }[]
}

function CustomTooltip({
  active,
  payload,
  label,
  columnA,
  columnB,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
  columnA: string
  columnB: string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-1.5 text-xs font-semibold text-gray-900 dark:text-gray-100">
        {columnA}: {label}
      </p>
      {payload.map((item, i) => (
        <p key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {columnB}: <span className="font-mono font-semibold">{item.value.toFixed(2)}</span>
        </p>
      ))}
    </div>
  )
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
      className="transition-all hover:r-8"
    />
  )
}

export function ChartDisplay({ title, columnA, columnB, rows }: ChartDisplayProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const { exportToPDF, isExporting } = usePDFExport({ 
    title, 
    columnA, 
    columnB, 
    rows 
  })

  const data = rows.map((row) => ({
    name: row.a,
    value: row.b,
  }))

  const handleDownloadPDF = async () => {
    if (!chartRef.current) return
    await exportToPDF(chartRef.current)
  }

  if (rows.length === 0) return null

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          {title || "Grafica"}
        </CardTitle>
        <Button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          variant="outline"
          className="gap-2"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Descargar PDF
        </Button>
      </CardHeader>
      <CardContent>
        <div 
          ref={chartRef} 
          style={{ 
            padding: "24px", 
            backgroundColor: "#ffffff",
            border: "none",
            boxShadow: "none"
          }}
        >
          <h3 style={{ 
            marginBottom: "20px", 
            textAlign: "center", 
            fontSize: "18px", 
            fontWeight: 600, 
            color: "#111827" 
          }}>
            {title || "Grafica Medica"}
          </h3>
          <div style={{ minHeight: "400px", width: "100%" }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={data}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
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
                  domain={['dataMin', 'dataMax']}
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
                  domain={['auto', 'auto']}
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
                <Tooltip
                  content={
                    <CustomTooltip columnA={columnA || "Columna A"} columnB={columnB || "Columna B"} />
                  }
                />
                <Legend
                  wrapperStyle={{ paddingTop: 20, fontSize: 12 }}
                  formatter={() => columnB || "Valor"}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={columnB || "Valor"}
                  stroke="url(#colorValue)"
                  strokeWidth={3}
                  dot={<CustomDot />}
                  activeDot={{ r: 8, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
