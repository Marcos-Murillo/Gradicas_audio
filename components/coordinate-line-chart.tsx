"use client"

import React from "react"

export interface Coordinate {
  x: number
  y: number
}

export interface CoordinateLineChartProps {
  title: string
  height?: number
  xMinValue?: number
  xMaxValue?: number
  yMinValue?: number
  yMaxValue?: number
  legendNames: string[]
  coordinateNames: { x: string; y: string }
  colors: string[]
  coordinates: Coordinate[][]
}

const PAD = { top: 20, right: 24, bottom: 52, left: 56 }

export function CoordinateLineChart({
  title,
  height = 400,
  xMinValue,
  xMaxValue,
  yMinValue,
  yMaxValue,
  legendNames,
  coordinateNames,
  colors,
  coordinates,
}: CoordinateLineChartProps) {
  const allX = coordinates.flatMap((s) => s.map((p) => p.x))
  const allY = coordinates.flatMap((s) => s.map((p) => p.y))

  const xMin = xMinValue ?? Math.min(...allX)
  const xMax = xMaxValue ?? Math.max(...allX)
  const yMin = yMinValue ?? 0
  const yMax = yMaxValue ?? Math.ceil(Math.max(...allY) * 1.15 * 10) / 10

  const VW = 600
  const VH = height
  const plotW = VW - PAD.left - PAD.right
  const plotH = VH - PAD.top - PAD.bottom

  function toSvgX(x: number) {
    return PAD.left + ((x - xMin) / (xMax - xMin)) * plotW
  }
  function toSvgY(y: number) {
    return PAD.top + ((yMax - y) / (yMax - yMin)) * plotH
  }

  const xTicks = Array.from({ length: 7 }, (_, i) =>
    parseFloat((xMin + (i / 6) * (xMax - xMin)).toFixed(1))
  )
  const yTicks = Array.from({ length: 7 }, (_, i) =>
    parseFloat((yMin + (i / 6) * (yMax - yMin)).toFixed(2))
  )

  const legendItemW = 170
  const legendStartX = PAD.left + (plotW - legendNames.length * legendItemW) / 2

  return (
    <div style={{ width: "100%" }}>
      <p style={{ textAlign: "center", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
        {title}
      </p>
      <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", height, display: "block" }}>
        {/* Plot background */}
        <rect
          x={PAD.left} y={PAD.top}
          width={plotW} height={plotH}
          fill="white" stroke="#555" strokeWidth={1}
        />

        {/* Vertical grid */}
        {xTicks.map((x) => (
          <line key={`vg-${x}`}
            x1={toSvgX(x)} y1={PAD.top}
            x2={toSvgX(x)} y2={PAD.top + plotH}
            stroke="#e5e7eb" strokeWidth={0.8}
          />
        ))}

        {/* Horizontal grid */}
        {yTicks.map((y) => (
          <line key={`hg-${y}`}
            x1={PAD.left} y1={toSvgY(y)}
            x2={PAD.left + plotW} y2={toSvgY(y)}
            stroke="#e5e7eb" strokeWidth={0.8}
          />
        ))}

        {/* Series lines */}
        {coordinates.map((series, i) => {
          const pts = series
            .filter((p) => p.x >= xMin && p.x <= xMax)
            .sort((a, b) => a.x - b.x)
          if (pts.length < 2) return null
          const d = pts
            .map((p, j) => `${j === 0 ? "M" : "L"} ${toSvgX(p.x).toFixed(2)} ${toSvgY(p.y).toFixed(2)}`)
            .join(" ")
          return (
            <path key={i} d={d} fill="none"
              stroke={colors[i] ?? "#888"} strokeWidth={2.5}
              strokeLinejoin="round" strokeLinecap="round"
            />
          )
        })}

        {/* X ticks + labels */}
        {xTicks.map((x) => (
          <g key={`xt-${x}`}>
            <line x1={toSvgX(x)} y1={PAD.top + plotH} x2={toSvgX(x)} y2={PAD.top + plotH + 5} stroke="#555" strokeWidth={1} />
            <text x={toSvgX(x)} y={PAD.top + plotH + 16} textAnchor="middle" fontSize={10} fill="#555">{x}</text>
          </g>
        ))}

        {/* X axis label */}
        <text x={PAD.left + plotW / 2} y={VH - PAD.bottom + 34}
          textAnchor="middle" fontSize={11} fill="#444" fontWeight={600}
        >
          {coordinateNames.x}
        </text>

        {/* Y ticks + labels */}
        {yTicks.map((y) => (
          <g key={`yt-${y}`}>
            <line x1={PAD.left - 5} y1={toSvgY(y)} x2={PAD.left} y2={toSvgY(y)} stroke="#555" strokeWidth={1} />
            <text x={PAD.left - 8} y={toSvgY(y) + 4} textAnchor="end" fontSize={10} fill="#555">{y}</text>
          </g>
        ))}

        {/* Y axis label */}
        <text x={14} y={PAD.top + plotH / 2}
          textAnchor="middle" fontSize={11} fill="#444" fontWeight={600}
          transform={`rotate(-90, 14, ${PAD.top + plotH / 2})`}
        >
          {coordinateNames.y}
        </text>

        {/* Legend */}
        {legendNames.map((name, i) => {
          const lx = legendStartX + i * legendItemW
          return (
            <g key={`leg-${i}`}>
              <line x1={lx} y1={VH - 14} x2={lx + 24} y2={VH - 14}
                stroke={colors[i] ?? "#888"} strokeWidth={2.5} strokeLinecap="round"
              />
              <text x={lx + 30} y={VH - 10} fontSize={10} fill="#444">{name}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
