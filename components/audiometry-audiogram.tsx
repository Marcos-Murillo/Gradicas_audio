"use client"

import React from "react"
import type { DatosAudiometriaTonal, FrecuenciasAudiometry } from "@/types/evaluation"

const GRID_FREQS = [125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000]
const FUNITS = [0, 1, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8]
const FREQS = [250, 500, 1000, 2000, 3000, 4000]
const DB_MIN = 0
const DB_MAX = 120
const DB_STEP = 10
const DB_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]

const AG = { left: 40, top: 28, unit: 34, rowh: 9 }
const PLOT_W = FUNITS[FUNITS.length - 1] * AG.unit
const PLOT_H = ((DB_MAX - DB_MIN) / DB_STEP) * AG.rowh
const W = AG.left + PLOT_W + 16
const H = AG.top + PLOT_H + 36

const COLOR_OD = "#d11c1c"
const COLOR_OI = "#1452d1"

function freqIndex(freq: number) {
  return GRID_FREQS.indexOf(freq)
}

function toX(freq: number) {
  const i = freqIndex(freq)
  return AG.left + (i < 0 ? 0 : FUNITS[i]) * AG.unit
}

function toY(db: number) {
  return AG.top + ((db - DB_MIN) / DB_STEP) * AG.rowh
}

function cxOD(freq: number) { return toX(freq) }
function cxOI(freq: number) { return toX(freq) }

// ─── ASHA Symbols ────────────────────────────────────────────────────────────

function SymbolO({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={6} stroke={COLOR_OD} strokeWidth={2} fill="none" />
}

function SymbolX({ cx, cy }: { cx: number; cy: number }) {
  const h = 6
  return (
    <g>
      <line x1={cx - h} y1={cy - h} x2={cx + h} y2={cy + h} stroke={COLOR_OI} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={cx + h} y1={cy - h} x2={cx - h} y2={cy + h} stroke={COLOR_OI} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

function SymbolTriangle({ cx, cy }: { cx: number; cy: number }) {
  const r = 7
  const pts = [
    `${cx},${cy - r}`,
    `${cx + r * 0.866},${cy + r * 0.5}`,
    `${cx - r * 0.866},${cy + r * 0.5}`,
  ].join(" ")
  return <polygon points={pts} stroke={COLOR_OD} strokeWidth={2} fill="none" />
}

function SymbolSquare({ cx, cy }: { cx: number; cy: number }) {
  const s = 6
  return <rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} stroke={COLOR_OI} strokeWidth={2} fill="none" />
}

function SymbolAngleLeft({ cx, cy }: { cx: number; cy: number }) {
  const s = 7
  return (
    <g>
      <line x1={cx + s} y1={cy - s} x2={cx - s} y2={cy} stroke={COLOR_OD} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx - s} y1={cy} x2={cx + s} y2={cy + s} stroke={COLOR_OD} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

function SymbolAngleRight({ cx, cy }: { cx: number; cy: number }) {
  const s = 7
  return (
    <g>
      <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy} stroke={COLOR_OI} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx + s} y1={cy} x2={cx - s} y2={cy + s} stroke={COLOR_OI} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

function SymbolBracketRight({ cx, cy }: { cx: number; cy: number }) {
  const h = 8, w = 5
  return (
    <g>
      <line x1={cx} y1={cy - h} x2={cx} y2={cy + h} stroke={COLOR_OD} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx} y1={cy - h} x2={cx + w} y2={cy - h} stroke={COLOR_OD} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx} y1={cy + h} x2={cx + w} y2={cy + h} stroke={COLOR_OD} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

function SymbolBracketLeft({ cx, cy }: { cx: number; cy: number }) {
  const h = 8, w = 5
  return (
    <g>
      <line x1={cx} y1={cy - h} x2={cx} y2={cy + h} stroke={COLOR_OI} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx} y1={cy - h} x2={cx - w} y2={cy - h} stroke={COLOR_OI} strokeWidth={2} strokeLinecap="round" />
      <line x1={cx} y1={cy + h} x2={cx - w} y2={cy + h} stroke={COLOR_OI} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

function SymbolNoResponse({ cx, cy, isLeft }: { cx: number; cy: number; isLeft: boolean }) {
  const color = isLeft ? COLOR_OI : COLOR_OD
  return (
    <g>
      <line x1={cx} y1={cy + 6} x2={cx} y2={cy + 17} stroke={color} strokeWidth={2} />
      <polyline points={`${cx - 4},${cy + 12} ${cx},${cy + 17} ${cx + 4},${cy + 12}`} fill="none" stroke={color} strokeWidth={2} />
    </g>
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
  return pts.length >= 2
    ? pts.map(p => `${toX(p.f)},${toY(p.v)}`).join(" ")
    : null
}

// ─── Combined audiogram (OD + OI en una sola gráfica) ────────────────────────

function AudiogramGrid({ color }: { color: string }) {
  return (
    <g>
      <rect x={AG.left} y={toY(0)} width={PLOT_W} height={toY(20) - toY(0)} fill="#eef1f5" />
      {GRID_FREQS.map((f, i) => (
        <line key={f} x1={AG.left + FUNITS[i] * AG.unit} y1={AG.top} x2={AG.left + FUNITS[i] * AG.unit} y2={AG.top + PLOT_H} stroke="#dde3ea" strokeWidth={1} />
      ))}
      {DB_TICKS.map(db => (
        <line key={db} x1={AG.left} y1={toY(db)} x2={AG.left + PLOT_W} y2={toY(db)} stroke={db % 10 === 0 ? "#c9d0d9" : "#eef1f5"} strokeWidth={1} />
      ))}
      <line x1={AG.left} y1={toY(0)} x2={AG.left + PLOT_W} y2={toY(0)} stroke="#9aa6b4" strokeWidth={1.3} />
      <line x1={AG.left} y1={toY(20)} x2={AG.left + PLOT_W} y2={toY(20)} stroke="#9aa6b4" strokeWidth={1.3} />
      <rect x={AG.left} y={AG.top} width={PLOT_W} height={PLOT_H} fill="none" stroke="#9aa6b4" strokeWidth={1.3} />
      {GRID_FREQS.map((f, i) => {
        if (f === 750 || f === 1500) return null
        return (
          <text key={f} x={AG.left + FUNITS[i] * AG.unit} y={AG.top - 8} textAnchor="middle" fontSize={f === 3000 || f === 6000 ? 7 : 9} fontWeight={600} fill="#1a2230">
            {f}
          </text>
        )
      })}
      {DB_TICKS.map(db => (
        <text key={`l-${db}`} x={AG.left - 6} y={toY(db) + 3} textAnchor="end" fontSize={8} fill="#5b6675">{db}</text>
      ))}
      <text x={12} y={AG.top + PLOT_H / 2} textAnchor="middle" fontSize={8} fill="#5b6675" transform={`rotate(-90 12 ${AG.top + PLOT_H / 2})`}>
        Intensidad (dB HL)
      </text>
      <text x={AG.left + PLOT_W / 2} y={H - 6} textAnchor="middle" fontSize={8} fill={color} fontWeight={700}>
        Frecuencia (Hz)
      </text>
    </g>
  )
}

function EarChart({
  title,
  color,
  air,
  airMask,
  bone,
  boneMask,
  symbols,
}: {
  title: string
  color: string
  air: { f: number; v: number }[]
  airMask: { f: number; v: number }[]
  bone: { f: number; v: number }[]
  boneMask: { f: number; v: number }[]
  symbols: React.ReactNode
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-1 text-sm font-extrabold uppercase tracking-wide" style={{ color }}>{title}</p>
      <p className="mb-1 text-center text-[11px] text-muted-foreground">Frecuencia (Hz)</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-[#9aa6b4] bg-white" role="img" aria-label={title}>
        <AudiogramGrid color={color} />
        {buildPolyline(bone) && <polyline points={buildPolyline(bone)!} fill="none" stroke={color} strokeWidth={2} strokeDasharray="6 4" />}
        {buildPolyline(boneMask) && <polyline points={buildPolyline(boneMask)!} fill="none" stroke={color} strokeWidth={2} strokeDasharray="6 4" />}
        {buildPolyline(air) && <polyline points={buildPolyline(air)!} fill="none" stroke={color} strokeWidth={2} />}
        {buildPolyline(airMask) && <polyline points={buildPolyline(airMask)!} fill="none" stroke={color} strokeWidth={2} />}
        {symbols}
      </svg>
    </div>
  )
}

function CombinedAudiogramSVG({ data }: { data: DatosAudiometriaTonal }) {
  const airOD = buildPoints(data.oido_derecho)
  const airOI = buildPoints(data.oido_izquierdo)
  const airMaskOD = buildPoints(data.oido_derecho_enmascarado)
  const airMaskOI = buildPoints(data.oido_izquierdo_enmascarado)
  const boneOD = buildPoints(data.oseo_derecho)
  const boneOI = buildPoints(data.oseo_izquierdo)
  const boneMaskOD = buildPoints(data.oseo_derecho_enmascarado)
  const boneMaskOI = buildPoints(data.oseo_izquierdo_enmascarado)
  const noRespOD: NoRespData = data.sin_respuesta_derecho ?? {}
  const noRespOI: NoRespData = data.sin_respuesta_izquierdo ?? {}

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <EarChart
        title="Oído Derecho"
        color={COLOR_OD}
        air={airOD}
        airMask={airMaskOD}
        bone={boneOD}
        boneMask={boneMaskOD}
        symbols={
          <>
            {airOD.map(p => <SymbolO key={`od-${p.f}`} cx={cxOD(p.f)} cy={toY(p.v)} />)}
            {airMaskOD.map(p => <SymbolTriangle key={`odm-${p.f}`} cx={cxOD(p.f)} cy={toY(p.v)} />)}
            {boneOD.map(p => <SymbolAngleLeft key={`bod-${p.f}`} cx={cxOD(p.f)} cy={toY(p.v)} />)}
            {boneMaskOD.map(p => <SymbolBracketRight key={`bom-${p.f}`} cx={cxOD(p.f)} cy={toY(p.v)} />)}
            {FREQS.map(f => {
              const key = String(f) as keyof FrecuenciasAudiometry
              if (!noRespOD[key]) return null
              const airVal = data.oido_derecho[key]
              return <SymbolNoResponse key={`nr-od-${f}`} cx={cxOD(f)} cy={airVal !== undefined ? toY(airVal) : toY(120)} isLeft={false} />
            })}
          </>
        }
      />
      <EarChart
        title="Oído Izquierdo"
        color={COLOR_OI}
        air={airOI}
        airMask={airMaskOI}
        bone={boneOI}
        boneMask={boneMaskOI}
        symbols={
          <>
            {airOI.map(p => <SymbolX key={`oi-${p.f}`} cx={cxOI(p.f)} cy={toY(p.v)} />)}
            {airMaskOI.map(p => <SymbolSquare key={`oim-${p.f}`} cx={cxOI(p.f)} cy={toY(p.v)} />)}
            {boneOI.map(p => <SymbolAngleRight key={`boi-${p.f}`} cx={cxOI(p.f)} cy={toY(p.v)} />)}
            {boneMaskOI.map(p => <SymbolBracketLeft key={`boim-${p.f}`} cx={cxOI(p.f)} cy={toY(p.v)} />)}
            {FREQS.map(f => {
              const key = String(f) as keyof FrecuenciasAudiometry
              if (!noRespOI[key]) return null
              const airVal = data.oido_izquierdo[key]
              return <SymbolNoResponse key={`nr-oi-${f}`} cx={cxOI(f)} cy={airVal !== undefined ? toY(airVal) : toY(120)} isLeft />
            })}
          </>
        }
      />
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
      <CombinedAudiogramSVG data={data} />

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-4 py-2 bg-muted/40 rounded-md">
        <LegendItem label="OD — Aéreo">
          <circle cx={9} cy={9} r={5} stroke={COLOR_OD} strokeWidth={2} fill="none" />
        </LegendItem>
        <LegendItem label="OI — Aéreo">
          <line x1={4} y1={4} x2={14} y2={14} stroke={COLOR_OI} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={14} y1={4} x2={4} y2={14} stroke={COLOR_OI} strokeWidth={2.5} strokeLinecap="round" />
        </LegendItem>

        {hasMasked && <>
          <LegendItem label="OD — Aéreo enmasc. (△)">
            <polygon points="9,3 15.2,13.5 2.8,13.5" stroke={COLOR_OD} strokeWidth={2} fill="none" />
          </LegendItem>
          <LegendItem label="OI — Aéreo enmasc. (□)">
            <rect x={3} y={3} width={12} height={12} stroke={COLOR_OI} strokeWidth={2} fill="none" />
          </LegendItem>
        </>}

        {hasOseo && <>
          <LegendItem label="OD — Óseo">
            <line x1={14} y1={3} x2={4} y2={9} stroke={COLOR_OD} strokeWidth={2} strokeLinecap="round" />
            <line x1={4} y1={9} x2={14} y2={15} stroke={COLOR_OD} strokeWidth={2} strokeLinecap="round" />
          </LegendItem>
          <LegendItem label="OI — Óseo">
            <line x1={4} y1={3} x2={14} y2={9} stroke={COLOR_OI} strokeWidth={2} strokeLinecap="round" />
            <line x1={14} y1={9} x2={4} y2={15} stroke={COLOR_OI} strokeWidth={2} strokeLinecap="round" />
          </LegendItem>
          <LegendItem label="OD — Óseo enmasc.">
            <line x1={9} y1={2} x2={9} y2={16} stroke={COLOR_OD} strokeWidth={2} strokeLinecap="round" />
            <line x1={9} y1={2} x2={14} y2={2} stroke={COLOR_OD} strokeWidth={2} strokeLinecap="round" />
            <line x1={9} y1={16} x2={14} y2={16} stroke={COLOR_OD} strokeWidth={2} strokeLinecap="round" />
          </LegendItem>
          <LegendItem label="OI — Óseo enmasc.">
            <line x1={9} y1={2} x2={9} y2={16} stroke={COLOR_OI} strokeWidth={2} strokeLinecap="round" />
            <line x1={9} y1={1} x2={4} y2={1} stroke={COLOR_OI} strokeWidth={2} strokeLinecap="round" />
            <line x1={9} y1={16} x2={4} y2={16} stroke={COLOR_OI} strokeWidth={2} strokeLinecap="round" />
          </LegendItem>
        </>}
      </div>
    </div>
  )
}
