"use client"

import React from "react"
import type { DatosAudiometriaTonal, FrecuenciasAudiometry } from "@/types/evaluation"

const FREQS = [250, 500, 1000, 2000, 4000, 8000]
const DB_MAX = 130
const DB_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130]

const W = 360
const H = 320
const PAD = { top: 20, right: 20, bottom: 48, left: 52 }
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

// ─── ASHA Symbols ────────────────────────────────────────────────────────────

/** O — OD vía aérea sin enmascarar */
function SymbolO({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return <circle cx={cx} cy={cy} r={6} stroke={color} strokeWidth={2} fill="none" />
}

/** X — OI vía aérea sin enmascarar */
function SymbolX({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const h = 6
  return (
    <g>
      <line x1={cx - h} y1={cy - h} x2={cx + h} y2={cy + h} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx + h} y1={cy - h} x2={cx - h} y2={cy + h} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

/** △ — OD vía aérea enmascarada */
function SymbolTriangle({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const r = 7
  const pts = [
    `${cx},${cy - r}`,
    `${cx + r * 0.866},${cy + r * 0.5}`,
    `${cx - r * 0.866},${cy + r * 0.5}`,
  ].join(" ")
  return <polygon points={pts} stroke={color} strokeWidth={2} fill="none" />
}

/** □ — OI vía aérea enmascarada */
function SymbolSquare({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const s = 6
  return <rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} stroke={color} strokeWidth={2} fill="none" />
}

/** < — OD vía ósea sin enmascarar (ángulo apuntando a la izquierda) */
function SymbolAngleLeft({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const s = 7
  return (
    <g>
      <line x1={cx + s} y1={cy - s} x2={cx - s} y2={cy} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx - s} y1={cy} x2={cx + s} y2={cy + s} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

/** > — OI vía ósea sin enmascarar (ángulo apuntando a la derecha) */
function SymbolAngleRight({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const s = 7
  return (
    <g>
      <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx + s} y1={cy} x2={cx - s} y2={cy + s} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

/** [ — OD vía ósea enmascarada (bracket abierto a la derecha) */
function SymbolBracketRight({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const h = 8, w = 5
  return (
    <g>
      <line x1={cx} y1={cy - h} x2={cx} y2={cy + h} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx} y1={cy - h} x2={cx + w} y2={cy - h} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx} y1={cy + h} x2={cx + w} y2={cy + h} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

/** ] — OI vía ósea enmascarada (bracket abierto a la izquierda) */
function SymbolBracketLeft({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const h = 8, w = 5
  return (
    <g>
      <line x1={cx} y1={cy - h} x2={cx} y2={cy + h} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx} y1={cy - h} x2={cx - w} y2={cy - h} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx} y1={cy + h} x2={cx - w} y2={cy + h} stroke={color} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

/** Flecha diagonal hacia abajo — sin respuesta */
function SymbolNoResponse({ cx, cy, color, isLeft }: { cx: number; cy: number; color: string; isLeft: boolean }) {
  const len = 10
  const dx = isLeft ? len * 0.707 : -len * 0.707
  const dy = len * 0.707
  return (
    <line
      x1={cx} y1={cy}
      x2={cx + dx} y2={cy + dy}
      stroke={color} strokeWidth={2} strokeLinecap="round"
      markerEnd={`url(#arrow-${isLeft ? "left" : "right"})`}
    />
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type EarData = Partial<FrecuenciasAudiometry>
type NoRespData = Partial<Record<keyof FrecuenciasAudiometry, boolean>>

function buildPoints(data: EarData | undefined) {
  if (!data) return []
  return FREQS
    .map(f => ({ f, v: data[String(f) as keyof FrecuenciasAudiometry] }))
    .filter((p): p is { f: number; v: number } => p.v !== undefined)
}

function buildPolyline(pts: { f: number; v: number }[]) {
  return pts.length >= 2 ? pts.map(p => `${toX(p.f)},${toY(p.v)}`).join(" ") : null
}

// ─── Main chart ──────────────────────────────────────────────────────────────

interface AudiogramSVGProps {
  data: DatosAudiometriaTonal
  isLeft: boolean
  color: string
  label: string
}

function AudiogramSVG({ data, isLeft, color, label }: AudiogramSVGProps) {
  const airPts = buildPoints(isLeft ? data.oido_izquierdo : data.oido_derecho)
  const airMaskPts = buildPoints(isLeft ? data.oido_izquierdo_enmascarado : data.oido_derecho_enmascarado)
  const bonePts = buildPoints(isLeft ? data.oseo_izquierdo : data.oseo_derecho)
  const boneMaskPts = buildPoints(isLeft ? data.oseo_izquierdo_enmascarado : data.oseo_derecho_enmascarado)
  const noResp: NoRespData = (isLeft ? data.sin_respuesta_izquierdo : data.sin_respuesta_derecho) ?? {}

  const arrowId = isLeft ? "arrow-left" : "arrow-right"

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-bold mb-1" style={{ color }}>{label}</p>
      <svg width={W} height={H} style={{ display: "block" }}>
        <defs>
          <marker id={arrowId} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill={color} />
          </marker>
        </defs>

        {/* Plot background */}
        <rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} fill="white" stroke="#555" strokeWidth={1} />

        {/* Horizontal grid lines */}
        {DB_TICKS.map(db => (
          <line key={db}
            x1={PAD.left} y1={toY(db)} x2={PAD.left + PLOT_W} y2={toY(db)}
            stroke={db === 0 ? "#aaa" : "#e5e7eb"}
            strokeWidth={db === 0 ? 0.8 : 0.5}
          />
        ))}

        {/* Vertical grid lines */}
        {FREQS.map(f => (
          <line key={f}
            x1={toX(f)} y1={PAD.top} x2={toX(f)} y2={PAD.top + PLOT_H}
            stroke="#e5e7eb" strokeWidth={0.5}
          />
        ))}

        {/* Bone conduction dashed lines */}
        {buildPolyline(bonePts) && (
          <polyline points={buildPolyline(bonePts)!} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="5,3" />
        )}
        {buildPolyline(boneMaskPts) && (
          <polyline points={buildPolyline(boneMaskPts)!} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="5,3" strokeOpacity={0.6} />
        )}

        {/* Air conduction solid lines */}
        {buildPolyline(airPts) && (
          <polyline points={buildPolyline(airPts)!} fill="none" stroke={color} strokeWidth={2} />
        )}
        {buildPolyline(airMaskPts) && (
          <polyline points={buildPolyline(airMaskPts)!} fill="none" stroke={color} strokeWidth={2} strokeDasharray="4,2" />
        )}

        {/* Air conduction symbols */}
        {airPts.map(p => isLeft
          ? <SymbolX key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
          : <SymbolO key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
        )}

        {/* Air conduction masked symbols */}
        {airMaskPts.map(p => isLeft
          ? <SymbolSquare key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
          : <SymbolTriangle key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
        )}

        {/* Bone conduction symbols */}
        {bonePts.map(p => isLeft
          ? <SymbolAngleRight key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
          : <SymbolAngleLeft key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
        )}

        {/* Bone conduction masked symbols */}
        {boneMaskPts.map(p => isLeft
          ? <SymbolBracketLeft key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
          : <SymbolBracketRight key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
        )}

        {/* No response arrows */}
        {FREQS.map(f => {
          const key = String(f) as keyof FrecuenciasAudiometry
          if (!noResp[key]) return null
          // Place at max output (120 dB) if no threshold recorded
          const airVal = (isLeft ? data.oido_izquierdo : data.oido_derecho)[key]
          const yPos = airVal !== undefined ? toY(airVal) : toY(120)
          return <SymbolNoResponse key={f} cx={toX(f)} cy={yPos} color={color} isLeft={isLeft} />
        })}

        {/* X axis: frequency labels */}
        {FREQS.map(f => (
          <text key={f} x={toX(f)} y={PAD.top + PLOT_H + 14} textAnchor="middle" fontSize={10} fill="#555">
            {f >= 1000 ? `${f / 1000}k` : f}
          </text>
        ))}

        {/* X axis label */}
        <text x={PAD.left + PLOT_W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#666">
          Frecuencia (Hz)
        </text>

        {/* Y axis: dB labels */}
        {DB_TICKS.filter((_, i) => i % 2 === 0).map(db => (
          <text key={db} x={PAD.left - 6} y={toY(db) + 3} textAnchor="end" fontSize={9} fill="#555">
            {db}
          </text>
        ))}

        {/* Y axis label */}
        <text x={12} y={PAD.top + PLOT_H / 2} textAnchor="middle" fontSize={10} fill="#666"
          transform={`rotate(-90, 12, ${PAD.top + PLOT_H / 2})`}>
          dB HL
        </text>
      </svg>
    </div>
  )
}

// ─── Legend ──────────────────────────────────────────────────────────────────

function LegendItem({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <svg width={18} height={18}>{children}</svg>
      {label}
    </span>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────

interface AudiometryAudiogramProps {
  data: DatosAudiometriaTonal
}

export function AudiometryAudiogram({ data }: AudiometryAudiogramProps) {
  const hasOseo = !!(data.oseo_derecho || data.oseo_izquierdo || data.oseo_derecho_enmascarado || data.oseo_izquierdo_enmascarado)
  const hasMasked = !!(data.oido_derecho_enmascarado || data.oido_izquierdo_enmascarado)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-6 justify-center">
        <AudiogramSVG data={data} isLeft={false} color="#dc2626" label="Oído Derecho (OD)" />
        <AudiogramSVG data={data} isLeft={true} color="#2563eb" label="Oído Izquierdo (OI)" />
      </div>

      {/* ASHA Legend */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-4 py-2 bg-muted/40 rounded-md">
        {/* Air conduction unmasked */}
        <LegendItem label="OD — Aéreo">
          <circle cx={9} cy={9} r={5} stroke="#dc2626" strokeWidth={2} fill="none" />
        </LegendItem>
        <LegendItem label="OI — Aéreo">
          <line x1={4} y1={4} x2={14} y2={14} stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={14} y1={4} x2={4} y2={14} stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" />
        </LegendItem>

        {/* Air conduction masked */}
        {hasMasked && <>
          <LegendItem label="OD — Aéreo enmasc.">
            <polygon points="9,3 15.2,13.5 2.8,13.5" stroke="#dc2626" strokeWidth={2} fill="none" />
          </LegendItem>
          <LegendItem label="OI — Aéreo enmasc.">
            <rect x={3} y={3} width={12} height={12} stroke="#2563eb" strokeWidth={2} fill="none" />
          </LegendItem>
        </>}

        {/* Bone conduction */}
        {hasOseo && <>
          <LegendItem label="OD — Óseo">
            <line x1={14} y1={3} x2={4} y2={9} stroke="#dc2626" strokeWidth={2} strokeLinecap="round" />
            <line x1={4} y1={9} x2={14} y2={15} stroke="#dc2626" strokeWidth={2} strokeLinecap="round" />
          </LegendItem>
          <LegendItem label="OI — Óseo">
            <line x1={4} y1={3} x2={14} y2={9} stroke="#2563eb" strokeWidth={2} strokeLinecap="round" />
            <line x1={14} y1={9} x2={4} y2={15} stroke="#2563eb" strokeWidth={2} strokeLinecap="round" />
          </LegendItem>
          <LegendItem label="OD — Óseo enmasc.">
            <line x1={9} y1={2} x2={9} y2={16} stroke="#dc2626" strokeWidth={2} strokeLinecap="round" />
            <line x1={9} y1={2} x2={14} y2={2} stroke="#dc2626" strokeWidth={2} strokeLinecap="round" />
            <line x1={9} y1={16} x2={14} y2={16} stroke="#dc2626" strokeWidth={2} strokeLinecap="round" />
          </LegendItem>
          <LegendItem label="OI — Óseo enmasc.">
            <line x1={9} y1={2} x2={9} y2={16} stroke="#2563eb" strokeWidth={2} strokeLinecap="round" />
            <line x1={9} y1={2} x2={4} y2={2} stroke="#2563eb" strokeWidth={2} strokeLinecap="round" />
            <line x1={9} y1={16} x2={4} y2={16} stroke="#2563eb" strokeWidth={2} strokeLinecap="round" />
          </LegendItem>
        </>}
      </div>
    </div>
  )
}
