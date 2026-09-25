"use client"

import type { DatosLogoaudiometria, PuntoLogoaudiometria } from "@/types/evaluation"

const COLOR_OD = "#d11c1c"
const COLOR_OI = "#1452d1"
const INTS: number[] = []
for (let i = 0; i <= 110; i += 5) INTS.push(i)

const LG = { left: 48, top: 28, right: 18, bottom: 34, colw: 18, rowh: 14 }
const PLOT_W = (INTS.length - 1) * LG.colw
const PLOT_H = 10 * LG.rowh
const W = LG.left + PLOT_W + LG.right
const H = LG.top + PLOT_H + LG.bottom + 16

function xInt(db: number) {
  return LG.left + (db / 5) * LG.colw
}
function yPct(p: number) {
  return LG.top + ((100 - p) / 10) * LG.rowh
}
function calcPct(correctas: number) {
  return Math.round((correctas / 10) * 100)
}

function pointsOf(puntos: PuntoLogoaudiometria[] | undefined) {
  return (puntos ?? [])
    .map(p => ({ db: Number(p.db), pct: calcPct(Number(p.correctas)) }))
    .filter(p => !Number.isNaN(p.db) && !Number.isNaN(p.pct))
    .sort((a, b) => a.db - b.db)
}

function poly(pts: { db: number; pct: number }[]) {
  if (pts.length < 2) return null
  return pts.map(p => `${xInt(p.db)},${yPct(p.pct)}`).join(" ")
}

export function LogoaudiometryChartUI({ data }: { data: DatosLogoaudiometria }) {
  const od = pointsOf(data.puntos.derecho)
  const oi = pointsOf(data.puntos.izquierdo)
  const odm = pointsOf(data.puntos.derecho_enmascarado)
  const oim = pointsOf(data.puntos.izquierdo_enmascarado)

  if (od.length + oi.length + odm.length + oim.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No hay datos suficientes para graficar. Agrega al menos un nivel por oído.
      </p>
    )
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full border border-[#9aa6b4] bg-white" role="img" aria-label="Logoaudiometría">
      {INTS.map((v, i) => {
        const x = xInt(v)
        const major = v % 10 === 0
        return (
          <g key={v}>
            <line x1={x} y1={LG.top} x2={x} y2={LG.top + PLOT_H} stroke={major ? "#d3dae2" : "#eef1f5"} strokeWidth={1} />
            {major && (
              <text x={x} y={LG.top + PLOT_H + 14} textAnchor="middle" fontSize={9} fill="#5b6675">{v}</text>
            )}
          </g>
        )
      })}
      {Array.from({ length: 11 }, (_, i) => i * 10).map(p => (
        <g key={p}>
          <line x1={LG.left} y1={yPct(p)} x2={LG.left + PLOT_W} y2={yPct(p)} stroke="#e3e8ee" strokeWidth={1} />
          <text x={LG.left - 8} y={yPct(p) + 3} textAnchor="end" fontSize={9} fill="#5b6675">{p}</text>
        </g>
      ))}
      <rect x={LG.left} y={LG.top} width={PLOT_W} height={PLOT_H} fill="none" stroke="#9aa6b4" strokeWidth={1.3} />
      <text x={LG.left + PLOT_W / 2} y={LG.top + PLOT_H + 30} textAnchor="middle" fontSize={9} fill="#5b6675">
        Intensidad (dB HTL)
      </text>
      <text x={12} y={LG.top + PLOT_H / 2} textAnchor="middle" fontSize={9} fill="#5b6675" transform={`rotate(-90 12 ${LG.top + PLOT_H / 2})`}>
        % discriminación
      </text>

      {poly(od) && <polyline points={poly(od)!} fill="none" stroke={COLOR_OD} strokeWidth={2} />}
      {poly(oi) && <polyline points={poly(oi)!} fill="none" stroke={COLOR_OI} strokeWidth={2} />}
      {poly(odm) && <polyline points={poly(odm)!} fill="none" stroke={COLOR_OD} strokeWidth={2} strokeDasharray="6 4" />}
      {poly(oim) && <polyline points={poly(oim)!} fill="none" stroke={COLOR_OI} strokeWidth={2} strokeDasharray="6 4" />}

      {od.map(p => <circle key={`od-${p.db}`} cx={xInt(p.db)} cy={yPct(p.pct)} r={5} fill="none" stroke={COLOR_OD} strokeWidth={2} />)}
      {odm.map(p => <circle key={`odm-${p.db}`} cx={xInt(p.db)} cy={yPct(p.pct)} r={5} fill="none" stroke={COLOR_OD} strokeWidth={2} />)}
      {oi.map(p => (
        <g key={`oi-${p.db}`}>
          <line x1={xInt(p.db) - 5} y1={yPct(p.pct) - 5} x2={xInt(p.db) + 5} y2={yPct(p.pct) + 5} stroke={COLOR_OI} strokeWidth={2} />
          <line x1={xInt(p.db) + 5} y1={yPct(p.pct) - 5} x2={xInt(p.db) - 5} y2={yPct(p.pct) + 5} stroke={COLOR_OI} strokeWidth={2} />
        </g>
      ))}
      {oim.map(p => (
        <g key={`oim-${p.db}`}>
          <line x1={xInt(p.db) - 5} y1={yPct(p.pct) - 5} x2={xInt(p.db) + 5} y2={yPct(p.pct) + 5} stroke={COLOR_OI} strokeWidth={2} />
          <line x1={xInt(p.db) + 5} y1={yPct(p.pct) - 5} x2={xInt(p.db) - 5} y2={yPct(p.pct) + 5} stroke={COLOR_OI} strokeWidth={2} />
        </g>
      ))}
    </svg>
  )
}
