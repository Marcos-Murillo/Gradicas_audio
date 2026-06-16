"use client"

import React from "react"
import type { DatosAudiometriaTonal, FrecuenciasAudiometry } from "@/types/evaluation"

const FREQS = [250, 500, 1000, 2000, 3000, 4000]
const DB_MAX = 130
const DB_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130]

const W = 520
const H = 360
const PAD = { top: 24, right: 28, bottom: 52, left: 56 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

// Desplazamiento ASHA: OD a la derecha, OI a la izquierda en cada frecuencia
const OD_OFFSET = 6
const OI_OFFSET = -6

const COLOR_OD = "#dc2626"
const COLOR_OI = "#2563eb"

function toX(freq: number) {
  const logMin = Math.log10(250)
  const logMax = Math.log10(4000)
  return PAD.left + ((Math.log10(freq) - logMin) / (logMax - logMin)) * PLOT_W
}

function toY(db: number) {
  return PAD.top + (db / DB_MAX) * PLOT_H
}

function cxOD(freq: number) { return toX(freq) + OD_OFFSET }
function cxOI(freq: number) { return toX(freq) + OI_OFFSET }

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
  const len = 10
  const dx = isLeft ? len * 0.707 : -len * 0.707
  const dy = len * 0.707
  const color = isLeft ? COLOR_OI : COLOR_OD
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

function buildPolyline(pts: { f: number; v: number }[], xOffset: number) {
  return pts.length >= 2
    ? pts.map(p => `${toX(p.f) + xOffset},${toY(p.v)}`).join(" ")
    : null
}

// ─── Combined audiogram (OD + OI en una sola gráfica) ────────────────────────

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
    <div className="flex flex-col items-center w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-3xl" style={{ display: "block" }}>
        <defs>
          <marker id="arrow-right" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill={COLOR_OD} />
          </marker>
          <marker id="arrow-left" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill={COLOR_OI} />
          </marker>
        </defs>

        <rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} fill="white" stroke="#555" strokeWidth={1} />

        {DB_TICKS.map(db => (
          <line key={db}
            x1={PAD.left} y1={toY(db)} x2={PAD.left + PLOT_W} y2={toY(db)}
            stroke={db === 0 ? "#aaa" : "#e5e7eb"}
            strokeWidth={db === 0 ? 0.8 : 0.5}
          />
        ))}

        {FREQS.map(f => (
          <line key={f}
            x1={toX(f)} y1={PAD.top} x2={toX(f)} y2={PAD.top + PLOT_H}
            stroke="#e5e7eb" strokeWidth={0.5}
          />
        ))}

        {/* Vía ósea — línea punteada */}
        {buildPolyline(boneOD, OD_OFFSET) && (
          <polyline points={buildPolyline(boneOD, OD_OFFSET)!} fill="none" stroke={COLOR_OD} strokeWidth={1.5} strokeDasharray="5,3" />
        )}
        {buildPolyline(boneOI, OI_OFFSET) && (
          <polyline points={buildPolyline(boneOI, OI_OFFSET)!} fill="none" stroke={COLOR_OI} strokeWidth={1.5} strokeDasharray="5,3" />
        )}
        {buildPolyline(boneMaskOD, OD_OFFSET) && (
          <polyline points={buildPolyline(boneMaskOD, OD_OFFSET)!} fill="none" stroke={COLOR_OD} strokeWidth={1.5} strokeDasharray="5,3" />
        )}
        {buildPolyline(boneMaskOI, OI_OFFSET) && (
          <polyline points={buildPolyline(boneMaskOI, OI_OFFSET)!} fill="none" stroke={COLOR_OI} strokeWidth={1.5} strokeDasharray="5,3" />
        )}

        {/* Vía aérea — línea sólida (sin enmascarar y enmascarada) */}
        {buildPolyline(airOD, OD_OFFSET) && (
          <polyline points={buildPolyline(airOD, OD_OFFSET)!} fill="none" stroke={COLOR_OD} strokeWidth={2} />
        )}
        {buildPolyline(airOI, OI_OFFSET) && (
          <polyline points={buildPolyline(airOI, OI_OFFSET)!} fill="none" stroke={COLOR_OI} strokeWidth={2} />
        )}
        {buildPolyline(airMaskOD, OD_OFFSET) && (
          <polyline points={buildPolyline(airMaskOD, OD_OFFSET)!} fill="none" stroke={COLOR_OD} strokeWidth={2} />
        )}
        {buildPolyline(airMaskOI, OI_OFFSET) && (
          <polyline points={buildPolyline(airMaskOI, OI_OFFSET)!} fill="none" stroke={COLOR_OI} strokeWidth={2} />
        )}

        {/* Símbolos vía aérea */}
        {airOD.map(p => <SymbolO key={`od-${p.f}`} cx={cxOD(p.f)} cy={toY(p.v)} />)}
        {airOI.map(p => <SymbolX key={`oi-${p.f}`} cx={cxOI(p.f)} cy={toY(p.v)} />)}
        {airMaskOD.map(p => <SymbolTriangle key={`odm-${p.f}`} cx={cxOD(p.f)} cy={toY(p.v)} />)}
        {airMaskOI.map(p => <SymbolSquare key={`oim-${p.f}`} cx={cxOI(p.f)} cy={toY(p.v)} />)}

        {/* Símbolos vía ósea */}
        {boneOD.map(p => <SymbolAngleLeft key={`bod-${p.f}`} cx={cxOD(p.f)} cy={toY(p.v)} />)}
        {boneOI.map(p => <SymbolAngleRight key={`boi-${p.f}`} cx={cxOI(p.f)} cy={toY(p.v)} />)}
        {boneMaskOD.map(p => <SymbolBracketRight key={`bom-${p.f}`} cx={cxOD(p.f)} cy={toY(p.v)} />)}
        {boneMaskOI.map(p => <SymbolBracketLeft key={`boim-${p.f}`} cx={cxOI(p.f)} cy={toY(p.v)} />)}

        {/* Sin respuesta */}
        {FREQS.map(f => {
          const key = String(f) as keyof FrecuenciasAudiometry
          const arrows: React.ReactNode[] = []
          if (noRespOD[key]) {
            const airVal = data.oido_derecho[key]
            arrows.push(
              <SymbolNoResponse key={`nr-od-${f}`} cx={cxOD(f)} cy={airVal !== undefined ? toY(airVal) : toY(120)} isLeft={false} />
            )
          }
          if (noRespOI[key]) {
            const airVal = data.oido_izquierdo[key]
            arrows.push(
              <SymbolNoResponse key={`nr-oi-${f}`} cx={cxOI(f)} cy={airVal !== undefined ? toY(airVal) : toY(120)} isLeft={true} />
            )
          }
          return arrows
        })}

        {FREQS.map(f => (
          <text key={f} x={toX(f)} y={PAD.top + PLOT_H + 14} textAnchor="middle" fontSize={10} fill="#555">
            {f >= 1000 ? `${f / 1000}k` : f}
          </text>
        ))}

        <text x={PAD.left + PLOT_W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#666">
          Frecuencia (Hz)
        </text>

        {DB_TICKS.filter((_, i) => i % 2 === 0).map(db => (
          <text key={db} x={PAD.left - 6} y={toY(db) + 3} textAnchor="end" fontSize={9} fill="#555">
            {db}
          </text>
        ))}

        <text x={14} y={PAD.top + PLOT_H / 2} textAnchor="middle" fontSize={10} fill="#666"
          transform={`rotate(-90, 14, ${PAD.top + PLOT_H / 2})`}>
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
