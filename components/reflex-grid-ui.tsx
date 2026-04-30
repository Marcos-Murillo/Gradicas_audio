"use client"

import React from "react"
import type { DatosTimpanometria, FrecuenciaReflejo, UmbralReflejo } from "@/types/evaluation"

const FREQS: FrecuenciaReflejo[] = ['500', '1000', '2000', '4000']

// ─── Mini tympanogram shape for reflex cell ───────────────────────────────────
// Shows a small V-shaped dip representing the reflex response

interface ReflexCellProps {
  freq: FrecuenciaReflejo
  umbral: UmbralReflejo | undefined
  tipo: 'ipsilateral' | 'contralateral'
  sondaLabel: string
  color: string
}

function ReflexCell({ freq, umbral, tipo, sondaLabel, color }: ReflexCellProps) {
  const isNR = umbral === null
  const hasValue = umbral !== undefined

  // Mini SVG: shows a small dip curve if present, flat line if NR
  const W = 110, H = 60
  const padL = 8, padR = 8, padT = 10, padB = 18

  const plotW = W - padL - padR
  const plotH = H - padT - padB

  // Draw a simple V-dip centered in the plot
  const midX = padL + plotW / 2
  const topY = padT + 4
  const bottomY = padT + plotH - 4
  const dipPath = hasValue && !isNR
    ? `M ${padL} ${topY + 8} Q ${midX} ${bottomY} ${W - padR} ${topY + 8}`
    : null

  // Flat line for NR
  const flatY = padT + plotH / 2
  const flatPath = isNR
    ? `M ${padL} ${flatY} L ${W - padR} ${flatY}`
    : null

  return (
    <div className="border rounded overflow-hidden bg-white dark:bg-gray-900" style={{ width: W, minHeight: H + 20 }}>
      {/* Header */}
      <div className="flex justify-between items-center px-1.5 py-0.5 border-b" style={{ borderColor: color }}>
        <span className="text-[9px] text-muted-foreground leading-tight">{tipo === 'ipsilateral' ? 'Ipsi' : 'Contra'} — {freq} Hz</span>
        {hasValue && (
          <span className="text-[9px] font-bold" style={{ color }}>
            {isNR ? 'NR' : `${umbral} dB`}
          </span>
        )}
      </div>

      {/* Mini chart */}
      <svg width={W} height={H} className="block">
        {/* Background */}
        <rect x={padL} y={padT} width={plotW} height={plotH} fill="none" stroke="#ddd" strokeWidth={0.5} />

        {/* Horizontal center line */}
        <line x1={padL} y1={padT + plotH / 2} x2={W - padR} y2={padT + plotH / 2}
          stroke="#e5e7eb" strokeWidth={0.5} />

        {/* Dip curve */}
        {dipPath && (
          <path d={dipPath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        )}

        {/* NR flat line */}
        {flatPath && (
          <path d={flatPath} fill="none" stroke="#999" strokeWidth={1} strokeDasharray="3,2" />
        )}

        {/* No data placeholder */}
        {!hasValue && (
          <text x={W / 2} y={padT + plotH / 2 + 3} textAnchor="middle" fontSize={8} fill="#bbb">—</text>
        )}

        {/* dB label at bottom */}
        {hasValue && !isNR && (
          <text x={midX} y={H - 4} textAnchor="middle" fontSize={7} fill={color} fontWeight="bold">
            {umbral} dB HL
          </text>
        )}
        {isNR && (
          <text x={midX} y={H - 4} textAnchor="middle" fontSize={7} fill="#999">NR</text>
        )}
      </svg>
    </div>
  )
}

// ─── Full reflex grid ─────────────────────────────────────────────────────────

interface ReflexGridProps {
  data: DatosTimpanometria
}

export function ReflexGridUI({ data }: ReflexGridProps) {
  if (!data.reflejos) return null

  const { derecho, izquierdo } = data.reflejos

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-center">Gráfica de los Reflejos</h4>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sonda OD */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-red-600 text-center">Sonda OD (Oído Derecho)</p>
          <div className="grid grid-cols-2 gap-2">
            {FREQS.map(f => (
              <ReflexCell key={`od-ipsi-${f}`}
                freq={f} umbral={derecho.ipsilateral?.[f]}
                tipo="ipsilateral" sondaLabel="OD" color="#dc2626" />
            ))}
            {FREQS.map(f => (
              <ReflexCell key={`od-contra-${f}`}
                freq={f} umbral={derecho.contralateral?.[f]}
                tipo="contralateral" sondaLabel="OD" color="#dc2626" />
            ))}
          </div>
        </div>

        {/* Sonda OI */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-blue-600 text-center">Sonda OI (Oído Izquierdo)</p>
          <div className="grid grid-cols-2 gap-2">
            {FREQS.map(f => (
              <ReflexCell key={`oi-ipsi-${f}`}
                freq={f} umbral={izquierdo.ipsilateral?.[f]}
                tipo="ipsilateral" sondaLabel="OI" color="#2563eb" />
            ))}
            {FREQS.map(f => (
              <ReflexCell key={`oi-contra-${f}`}
                freq={f} umbral={izquierdo.contralateral?.[f]}
                tipo="contralateral" sondaLabel="OI" color="#2563eb" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
