"use client"

import React from "react"
import type { DatosAudiometriaTonal } from "@/types/evaluation"

const FREQS = [250, 500, 1000, 2000, 4000, 8000]
const DB_MIN = 0
const DB_MAX = 130
const DB_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130]

const W = 340
const H = 300
const PAD = { top: 16, right: 16, bottom: 44, left: 48 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

function toX(freq: number) {
  const logMin = Math.log10(250)
  const logMax = Math.log10(8000)
  return PAD.left + ((Math.log10(freq) - logMin) / (logMax - logMin)) * PLOT_W
}

function toY(db: number) {
  return PAD.top + (db / DB_MAX) * PLOT_H
}

// X symbol for left ear
function XMark({ cx, cy, size, color }: { cx: number; cy: number; size: number; color: string }) {
  const h = size / 2
  return (
    <g>
      <line x1={cx - h} y1={cy - h} x2={cx + h} y2={cy + h} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx + h} y1={cy - h} x2={cx - h} y2={cy + h} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

// O symbol for right ear
function OMark({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  return <circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={2} fill="none" />
}

interface EarData {
  [freq: string]: number | undefined
}

interface SingleAudiogramProps {
  data: EarData
  color: string
  isLeft: boolean
  label: string
}

function SingleAudiogram({ data, color, isLeft, label }: SingleAudiogramProps) {
  const points = FREQS
    .map(f => ({ f, v: data[String(f)] }))
    .filter((p): p is { f: number; v: number } => p.v !== undefined)

  const polyline = points.length >= 2
    ? points.map(p => `${toX(p.f)},${toY(p.v)}`).join(" ")
    : null

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-bold mb-1" style={{ color }}>{label}</p>
      <svg width={W} height={H} style={{ display: "block" }}>
        {/* Plot background */}
        <rect
          x={PAD.left} y={PAD.top}
          width={PLOT_W} height={PLOT_H}
          fill="white" stroke="#555" strokeWidth={1}
        />

        {/* Horizontal grid lines */}
        {DB_TICKS.map(db => (
          <line
            key={db}
            x1={PAD.left} y1={toY(db)}
            x2={PAD.left + PLOT_W} y2={toY(db)}
            stroke={db === 0 ? "#aaa" : "#e5e7eb"}
            strokeWidth={db === 0 ? 0.8 : 0.5}
          />
        ))}

        {/* Vertical grid lines */}
        {FREQS.map(f => (
          <line
            key={f}
            x1={toX(f)} y1={PAD.top}
            x2={toX(f)} y2={PAD.top + PLOT_H}
            stroke="#e5e7eb" strokeWidth={0.5}
          />
        ))}

        {/* Air conduction line */}
        {polyline && (
          <polyline points={polyline} fill="none" stroke={color} strokeWidth={2} />
        )}

        {/* Symbols */}
        {points.map(p =>
          isLeft
            ? <XMark key={p.f} cx={toX(p.f)} cy={toY(p.v)} size={12} color={color} />
            : <OMark key={p.f} cx={toX(p.f)} cy={toY(p.v)} r={6} color={color} />
        )}

        {/* X axis: frequency labels */}
        {FREQS.map(f => (
          <text
            key={f}
            x={toX(f)} y={PAD.top + PLOT_H + 14}
            textAnchor="middle" fontSize={10} fill="#555"
          >
            {f >= 1000 ? `${f / 1000}k` : f}
          </text>
        ))}

        {/* X axis label */}
        <text
          x={PAD.left + PLOT_W / 2} y={H - 4}
          textAnchor="middle" fontSize={10} fill="#666"
        >
          Frecuencia (Hz)
        </text>

        {/* Y axis: dB labels (every other tick) */}
        {DB_TICKS.filter((_, i) => i % 2 === 0).map(db => (
          <text
            key={db}
            x={PAD.left - 6} y={toY(db) + 3}
            textAnchor="end" fontSize={9} fill="#555"
          >
            {db}
          </text>
        ))}

        {/* Y axis label */}
        <text
          x={12} y={PAD.top + PLOT_H / 2}
          textAnchor="middle" fontSize={10} fill="#666"
          transform={`rotate(-90, 12, ${PAD.top + PLOT_H / 2})`}
        >
          dB HL
        </text>
      </svg>
    </div>
  )
}

interface AudiometryAudiogramProps {
  data: DatosAudiometriaTonal
}

export function AudiometryAudiogram({ data }: AudiometryAudiogramProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-6 justify-center">
        <SingleAudiogram
          data={data.oido_derecho}
          color="#dc2626"
          isLeft={false}
          label="Oído Derecho (OD)"
        />
        <SingleAudiogram
          data={data.oido_izquierdo}
          color="#2563eb"
          isLeft={true}
          label="Oído Izquierdo (OI)"
        />
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <svg width={14} height={14}>
            <circle cx={7} cy={7} r={5} stroke="#dc2626" strokeWidth={2} fill="none" />
          </svg>
          OD — Vía aérea
        </span>
        <span className="flex items-center gap-1.5">
          <svg width={14} height={14}>
            <line x1={3} y1={3} x2={11} y2={11} stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" />
            <line x1={11} y1={3} x2={3} y2={11} stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" />
          </svg>
          OI — Vía aérea
        </span>
      </div>
    </div>
  )
}
