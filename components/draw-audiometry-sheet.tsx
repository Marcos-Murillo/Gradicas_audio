"use client"

import { useEffect, useMemo, useRef, useState } from "react"

const FREQS = [125, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000]
const FUNITS = [0, 1, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8]
const FLABEL: Record<number, string> = {
  125: "125", 250: "250", 500: "500", 750: "", 1000: "1000", 1500: "",
  2000: "2000", 3000: "3000", 4000: "4000", 6000: "6000", 8000: "8000",
}
const DB_MIN = 0
const DB_MAX = 120
const DB_STEP = 5
const DBS = Array.from({ length: (DB_MAX - DB_MIN) / DB_STEP + 1 }, (_, i) => DB_MIN + i * DB_STEP)
const AG = { left: 52, top: 40, unit: 56, rowh: 13 }
const AG_PLOTW = FUNITS[FUNITS.length - 1] * AG.unit
const AG_PLOTH = (DBS.length - 1) * AG.rowh
const AUDIO_W = 518
const AUDIO_H = 380

const INTS = Array.from({ length: 23 }, (_, i) => i * 5)
const LG = { left: 48, top: 28, colw: 20, rowh: 16 }
const LG_PLOTW = (INTS.length - 1) * LG.colw
const LG_PLOTH = 10 * LG.rowh
const LOGO_W = 508
const LOGO_H = 224

const COLOR = { OD: "#d11c1c", OI: "#1452d1" }
const PTA_FREQS = [500, 1000, 2000, 3000]

type Ear = "OD" | "OI"
type Via = "aerea" | "osea"
type Point = { db: number; nr: boolean; masked: boolean }
type EarSeries = { aerea: Record<number, Point>; osea: Record<number, Point> }
type AudioData = Record<Ear, EarSeries>
type LogoData = Record<Ear, Record<number, number>>

function emptyAudio(): AudioData {
  return { OD: { aerea: {}, osea: {} }, OI: { aerea: {}, osea: {} } }
}
function emptyLogo(): LogoData {
  return { OD: {}, OI: {} }
}
function xFreq(i: number) { return AG.left + FUNITS[i] * AG.unit }
function yDb(db: number) { return AG.top + ((db - DB_MIN) / DB_STEP) * AG.rowh }
function xInt(i: number) { return LG.left + i * LG.colw }
function yPct(p: number) { return LG.top + ((100 - p) / 10) * LG.rowh }

function nearestFreq(x: number) {
  let best = 0
  let dist = Infinity
  FREQS.forEach((_, i) => {
    const d = Math.abs(x - xFreq(i))
    if (d < dist) { dist = d; best = i }
  })
  return best
}
function nearestDb(y: number) {
  const db = Math.round((y - AG.top) / AG.rowh) * DB_STEP + DB_MIN
  return Math.max(DB_MIN, Math.min(DB_MAX, db))
}
function nearestInt(x: number) {
  let best = 0
  let dist = Infinity
  INTS.forEach((v, i) => {
    const d = Math.abs(x - xInt(i))
    if (d < dist) { dist = d; best = i }
  })
  return INTS[best]
}
function nearestPct(y: number) {
  const p = Math.round((100 - ((y - LG.top) / LG.rowh) * 10) / 5) * 5
  return Math.max(0, Math.min(100, p))
}
function svgPoint(svg: SVGSVGElement, evt: React.MouseEvent) {
  const p = svg.createSVGPoint()
  p.x = evt.clientX
  p.y = evt.clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return { x: 0, y: 0 }
  const t = p.matrixTransform(ctm.inverse())
  return { x: t.x, y: t.y }
}

function Symbol({ ear, via, masked, x, y }: { ear: Ear; via: Via; masked: boolean; x: number; y: number }) {
  const c = COLOR[ear]
  if (via === "aerea" && !masked && ear === "OD") return <circle cx={x} cy={y} r={6} fill="none" stroke={c} strokeWidth={2} />
  if (via === "aerea" && !masked && ear === "OI") return (
    <g>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} stroke={c} strokeWidth={2} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} stroke={c} strokeWidth={2} />
    </g>
  )
  if (via === "aerea" && masked && ear === "OD") return <polygon points={`${x},${y - 7} ${x + 7},${y + 6} ${x - 7},${y + 6}`} fill="none" stroke={c} strokeWidth={2} />
  if (via === "aerea" && masked && ear === "OI") return <rect x={x - 6} y={y - 6} width={12} height={12} fill="none" stroke={c} strokeWidth={2} />
  if (via === "osea" && !masked && ear === "OD") return <polyline points={`${x + 6},${y - 7} ${x - 4},${y} ${x + 6},${y + 7}`} fill="none" stroke={c} strokeWidth={2} />
  if (via === "osea" && !masked && ear === "OI") return <polyline points={`${x - 6},${y - 7} ${x + 4},${y} ${x - 6},${y + 7}`} fill="none" stroke={c} strokeWidth={2} />
  if (via === "osea" && masked && ear === "OD") return <polyline points={`${x + 5},${y - 7} ${x - 4},${y - 7} ${x - 4},${y + 7} ${x + 5},${y + 7}`} fill="none" stroke={c} strokeWidth={2} />
  return <polyline points={`${x - 5},${y - 7} ${x + 4},${y - 7} ${x + 4},${y + 7} ${x - 5},${y + 7}`} fill="none" stroke={c} strokeWidth={2} />
}

function AudioGrid() {
  return (
    <g>
      <rect x={AG.left} y={yDb(0)} width={AG_PLOTW} height={yDb(20) - yDb(0)} fill="#eef1f5" />
      {FREQS.map((f, i) => (
        <g key={f}>
          <line x1={xFreq(i)} y1={AG.top} x2={xFreq(i)} y2={AG.top + AG_PLOTH} stroke="#dde3ea" strokeWidth={1} />
          {FLABEL[f] ? (
            <text x={xFreq(i)} y={AG.top - 8} textAnchor="middle" fontSize={f === 3000 || f === 6000 ? 7 : 9} fontWeight={600} fill="#1a2230">{FLABEL[f]}</text>
          ) : null}
        </g>
      ))}
      {DBS.map(db => (
        <g key={db}>
          <line x1={AG.left} y1={yDb(db)} x2={AG.left + AG_PLOTW} y2={yDb(db)} stroke={db % 10 === 0 ? "#c9d0d9" : "#eef1f5"} strokeWidth={1} />
          {db % 10 === 0 ? <text x={AG.left - 8} y={yDb(db) + 3} textAnchor="end" fontSize={9} fill="#5b6675">{db}</text> : null}
        </g>
      ))}
      {[0, 20].map(db => <line key={`b${db}`} x1={AG.left} y1={yDb(db)} x2={AG.left + AG_PLOTW} y2={yDb(db)} stroke="#9aa6b4" strokeWidth={1.3} />)}
      <rect x={AG.left} y={AG.top} width={AG_PLOTW} height={AG_PLOTH} fill="none" stroke="#9aa6b4" strokeWidth={1.3} />
      <text x={13} y={AG.top + AG_PLOTH / 2} textAnchor="middle" fontSize={9} fill="#5b6675" transform={`rotate(-90 13 ${AG.top + AG_PLOTH / 2})`}>Intensidad (dB HL)</text>
    </g>
  )
}

function Seg({
  options,
  value,
  onChange,
  earColors,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  earColors?: boolean
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-[7px] border border-[#d7dce4]">
      {options.map((opt, i) => {
        const active = value === opt.value
        const bg = !active ? "bg-white text-[#1a2230]"
          : earColors && opt.value === "OD" ? "bg-[#d11c1c] text-white"
          : earColors && opt.value === "OI" ? "bg-[#1452d1] text-white"
          : "bg-[#1a2230] text-white"
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2 text-[13px] ${bg} ${i < options.length - 1 ? "border-r border-[#d7dce4]" : ""}`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function DrawAudiometrySheet() {
  const [via, setVia] = useState<Via>("aerea")
  const [masked, setMasked] = useState(false)
  const [mode, setMode] = useState<"place" | "erase">("place")
  const [nr, setNr] = useState(false)
  const [logoEar, setLogoEar] = useState<Ear>("OD")
  const [audio, setAudio] = useState<AudioData>(emptyAudio)
  const [logo, setLogo] = useState<LogoData>(emptyLogo)
  const [history, setHistory] = useState<{ audio: AudioData; logo: LogoData }[]>([])
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [ptaManual, setPtaManual] = useState<{ OD: string | null; OI: string | null }>({ OD: null, OI: null })
  const odRef = useRef<SVGSVGElement>(null)
  const oiRef = useRef<SVGSVGElement>(null)
  const logoRef = useRef<SVGSVGElement>(null)

  function snapshot() {
    setHistory(h => [...h.slice(-80), { audio: structuredClone(audio), logo: structuredClone(logo) }])
  }
  function undo() {
    setHistory(h => {
      const prev = h[h.length - 1]
      if (!prev) return h
      setAudio(prev.audio)
      setLogo(prev.logo)
      return h.slice(0, -1)
    })
  }

  function ptaOf(ear: Ear) {
    if (ptaManual[ear] !== null) return ptaManual[ear] ?? ""
    let sum = 0
    for (const f of PTA_FREQS) {
      const v = audio[ear].aerea[f]
      if (!v || v.nr) return ""
      sum += v.db
    }
    return String(Math.round(sum / PTA_FREQS.length))
  }

  function onAudioClick(ear: Ear, evt: React.MouseEvent<SVGSVGElement>) {
    const svg = ear === "OD" ? odRef.current : oiRef.current
    if (!svg) return
    const p = svgPoint(svg, evt)
    if (p.x < AG.left - AG.unit / 2 || p.x > AG.left + AG_PLOTW + AG.unit / 2) return
    if (p.y < AG.top - AG.rowh || p.y > AG.top + AG_PLOTH + AG.rowh) return
    const f = FREQS[nearestFreq(p.x)]
    if (mode === "erase" && !audio[ear][via][f]) return
    snapshot()
    setAudio(prev => {
      const next = structuredClone(prev)
      const series = next[ear][via]
      if (mode === "erase") delete series[f]
      else series[f] = { db: nearestDb(p.y), nr, masked }
      return next
    })
  }

  function onLogoClick(evt: React.MouseEvent<SVGSVGElement>) {
    const svg = logoRef.current
    if (!svg) return
    const p = svgPoint(svg, evt)
    if (p.x < LG.left - LG.colw || p.x > LG.left + LG_PLOTW + LG.colw) return
    if (p.y < LG.top - LG.rowh || p.y > LG.top + LG_PLOTH + LG.rowh) return
    const v = nearestInt(p.x)
    if (mode === "erase" && logo[logoEar][v] === undefined) return
    snapshot()
    setLogo(prev => {
      const next = structuredClone(prev)
      if (mode === "erase") delete next[logoEar][v]
      else next[logoEar][v] = nearestPct(p.y)
      return next
    })
  }

  function clearAudio(ear?: Ear) {
    snapshot()
    setAudio(prev => {
      const next = structuredClone(prev)
      const ears: Ear[] = ear ? [ear] : ["OD", "OI"]
      ears.forEach(e => { next[e] = { aerea: {}, osea: {} } })
      return next
    })
  }

  function clearLogo(ear?: Ear) {
    snapshot()
    setLogo(prev => {
      const next = structuredClone(prev)
      if (ear) next[ear] = {}
      else { next.OD = {}; next.OI = {} }
      return next
    })
  }

  const undoRef = useRef(undo)
  undoRef.current = undo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault()
        undoRef.current()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const hint = useMemo(() => {
    if (mode === "erase") return "Modo borrar: haz clic sobre un punto para quitarlo."
    const viaTxt = via === "aerea" ? "vía aérea" : "vía ósea"
    const maskTxt = masked ? "con enmascaramiento" : "sin enmascaramiento"
    const nrTxt = nr ? " Se marcará sin respuesta (flecha)." : ""
    return `Clic en el audiograma para colocar ${viaTxt} ${maskTxt}.${nrTxt} En logoaudiometría marcas el oído ${logoEar === "OD" ? "derecho (rojo)" : "izquierdo (azul)"}.`
  }, [mode, via, masked, nr, logoEar])

  function seriesLine(ear: Ear, viaName: Via) {
    const series = audio[ear][viaName]
    const pts = FREQS.map((f, i) => ({ i, v: series[f] })).filter(o => o.v && !o.v.nr)
    if (pts.length < 2) return null
    return pts.map(o => `${xFreq(o.i)},${yDb(o.v.db)}`).join(" ")
  }

  function AudioChart({ ear, svgRef }: { ear: Ear; svgRef: React.RefObject<SVGSVGElement | null> }) {
    const c = COLOR[ear]
    return (
      <svg ref={svgRef} viewBox={`0 0 ${AUDIO_W} ${AUDIO_H}`} className="block w-full cursor-crosshair border border-[#9aa6b4] bg-white" onClick={e => onAudioClick(ear, e)}>
        <AudioGrid />
        {(["aerea", "osea"] as Via[]).map(viaName => {
          const line = seriesLine(ear, viaName)
          return line ? (
            <polyline key={viaName} points={line} fill="none" stroke={c} strokeWidth={2} strokeDasharray={viaName === "osea" ? "6 4" : undefined} />
          ) : null
        })}
        {(["aerea", "osea"] as Via[]).flatMap(viaName =>
          FREQS.map((f, i) => {
            const v = audio[ear][viaName][f]
            if (!v) return null
            const x = xFreq(i)
            const y = yDb(v.db)
            return (
              <g key={`${viaName}-${f}`}>
                <Symbol ear={ear} via={viaName} masked={v.masked} x={x} y={y} />
                {v.nr ? (
                  <g>
                    <line x1={x} y1={y + 6} x2={x} y2={y + 17} stroke={c} strokeWidth={2} />
                    <polyline points={`${x - 4},${y + 12} ${x},${y + 17} ${x + 4},${y + 12}`} fill="none" stroke={c} strokeWidth={2} />
                  </g>
                ) : null}
              </g>
            )
          })
        )}
      </svg>
    )
  }

  const fechaPrint = fecha ? `Fecha: ${fecha.slice(8, 10)}/${fecha.slice(5, 7)}/${fecha.slice(0, 4)}` : ""

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-5">
      <style>{`
        .print-only { display: none; }
        @media print {
          aside, .no-print { display: none !important; }
          .pl-20 { padding-left: 0 !important; }
          body { background: #fff !important; }
          .print-only { display: inline-block !important; }
          .print-sheet { border: none !important; box-shadow: none !important; padding: 0 !important; border-radius: 0 !important; }
          .print-sheet, .print-sheet * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .sheet-banner { font-size: 11px !important; padding: 4px 8px !important; margin: 5px 0 !important; }
          .sheet-charts { grid-template-columns: 96mm 1fr !important; gap: 6mm !important; }
          @page { margin: 10mm; }
        }
      `}</style>

      <div className="no-print mb-4 rounded-[10px] border border-[#d7dce4] bg-white p-4">
        <p className="mb-3 rounded-md bg-[#eef1f5] px-3 py-2 text-sm text-[#1a2230]">{hint}</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#5b6675]">1. Qué vas a marcar</div>
            <Seg value={via} onChange={v => setVia(v as Via)} options={[{ value: "aerea", label: "Vía aérea" }, { value: "osea", label: "Vía ósea" }]} />
          </div>
          <div>
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#5b6675]">2. Enmascaramiento</div>
            <Seg value={masked ? "si" : "no"} onChange={v => setMasked(v === "si")} options={[{ value: "no", label: "Sin máscara" }, { value: "si", label: "Con máscara" }]} />
          </div>
          <div>
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#5b6675]">3. Acción en la gráfica</div>
            <Seg value={mode} onChange={v => setMode(v as "place" | "erase")} options={[{ value: "place", label: "Colocar punto" }, { value: "erase", label: "Borrar punto" }]} />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" checked={nr} onChange={e => setNr(e.target.checked)} />
            Sin respuesta (flecha hacia abajo)
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-4">
          <div>
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#5b6675]">Logoaudiometría — oído a marcar</div>
            <Seg earColors value={logoEar} onChange={v => setLogoEar(v as Ear)} options={[{ value: "OD", label: "OD (rojo)" }, { value: "OI", label: "OI (azul)" }]} />
          </div>
          <div>
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#5b6675]">Borrar audiometría</div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={undo} className="rounded-[7px] border border-[#d7dce4] bg-white px-3 py-2 text-sm font-semibold">Deshacer (Ctrl+Z)</button>
              <button type="button" onClick={() => clearAudio("OD")} className="rounded-[7px] border border-[#d7dce4] border-l-[3px] border-l-[#d11c1c] bg-white px-3 py-2 text-sm font-semibold">Curva OD</button>
              <button type="button" onClick={() => clearAudio("OI")} className="rounded-[7px] border border-[#d7dce4] border-l-[3px] border-l-[#1452d1] bg-white px-3 py-2 text-sm font-semibold">Curva OI</button>
              <button type="button" onClick={() => { if (confirm("¿Borrar toda la audiometría tonal (OD y OI)?")) clearAudio() }} className="rounded-[7px] border border-[#d7dce4] bg-white px-3 py-2 text-sm font-semibold">Toda</button>
            </div>
          </div>
          <div>
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#5b6675]">Borrar logoaudiometría</div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => clearLogo("OD")} className="rounded-[7px] border border-[#d7dce4] border-l-[3px] border-l-[#d11c1c] bg-white px-3 py-2 text-sm font-semibold">Curva OD</button>
              <button type="button" onClick={() => clearLogo("OI")} className="rounded-[7px] border border-[#d7dce4] border-l-[3px] border-l-[#1452d1] bg-white px-3 py-2 text-sm font-semibold">Curva OI</button>
              <button type="button" onClick={() => { if (confirm("¿Borrar toda la logoaudiometría (OD y OI)?")) clearLogo() }} className="rounded-[7px] border border-[#d7dce4] bg-white px-3 py-2 text-sm font-semibold">Toda</button>
            </div>
          </div>
          <button type="button" onClick={() => window.print()} className="rounded-[7px] bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white">Descargar PDF</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-8 border-t border-[#e9edf2] pt-3 text-xs text-[#5b6675]">
          <div>
            <div className="mb-1 font-bold text-[#d11c1c]">OD (rojo)</div>
            <div className="flex items-center gap-1"><svg width="22" height="15"><circle cx="7" cy="7" r="5.5" fill="none" stroke="#d11c1c" strokeWidth="2" /></svg> Aérea</div>
            <div className="flex items-center gap-1"><svg width="22" height="15"><polygon points="7,2 13,13 1,13" fill="none" stroke="#d11c1c" strokeWidth="2" /></svg> Aérea enmasc.</div>
            <div className="flex items-center gap-1"><svg width="22" height="15"><polyline points="12,2 4,7 12,13" fill="none" stroke="#d11c1c" strokeWidth="2" /></svg> Ósea</div>
            <div className="flex items-center gap-1"><svg width="22" height="15"><polyline points="12,2 4,2 4,13 12,13" fill="none" stroke="#d11c1c" strokeWidth="2" /></svg> Ósea enmasc.</div>
          </div>
          <div>
            <div className="mb-1 font-bold text-[#1452d1]">OI (azul)</div>
            <div className="flex items-center gap-1"><svg width="22" height="15"><line x1="2" y1="2" x2="12" y2="12" stroke="#1452d1" strokeWidth="2" /><line x1="12" y1="2" x2="2" y2="12" stroke="#1452d1" strokeWidth="2" /></svg> Aérea</div>
            <div className="flex items-center gap-1"><svg width="22" height="15"><rect x="2" y="2" width="11" height="11" fill="none" stroke="#1452d1" strokeWidth="2" /></svg> Aérea enmasc.</div>
            <div className="flex items-center gap-1"><svg width="22" height="15"><polyline points="3,2 11,7 3,13" fill="none" stroke="#1452d1" strokeWidth="2" /></svg> Ósea</div>
            <div className="flex items-center gap-1"><svg width="22" height="15"><polyline points="3,2 11,2 11,13 3,13" fill="none" stroke="#1452d1" strokeWidth="2" /></svg> Ósea enmasc.</div>
          </div>
          <div>
            <div className="mb-1 font-bold text-[#1a2230]">Líneas</div>
            <div>Continua: vía aérea · segmentada: vía ósea</div>
            <div>Marcar otra vez en la misma frecuencia reemplaza el punto.</div>
            <div>Ctrl+Z deshace lo último.</div>
          </div>
        </div>
      </div>

      <div className="print-sheet rounded-[10px] border border-[#d7dce4] bg-white px-6 py-5 shadow-sm">
        <div className="mb-2 flex items-center gap-4 border-b-2 border-[#3b2a63] pb-2">
          <img src="/logo-renteria.png" alt="Oive · Dr. Julián Rentería, Audiólogo" className="h-16 w-auto shrink-0" />
          <div className="flex-1 text-center text-[#24306b]">
            <div className="text-[17px] font-extrabold tracking-wide">ESPECIALISTA EN VÉRTIGO Y PÉRDIDA AUDITIVA</div>
            <div className="text-xs text-[#3a4358]">Cra. 30 # 32-29, B/ Centro — Frente al Banco de la Mujer</div>
            <div className="text-xs text-[#3a4358]">Cel. 316 704 5684</div>
          </div>
          <div className="no-print text-right">
            <div className="mb-1 text-[11px] font-bold uppercase text-[#5b6675]">Fecha</div>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="rounded-md border border-[#d7dce4] px-2 py-1 text-sm" />
          </div>
          <div className="print-only text-sm font-semibold">{fechaPrint}</div>
        </div>

        <div className="sheet-charts mt-3 grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
          <div>
            <div className="sheet-banner mb-3 rounded-[3px] bg-[#2f5c9e] px-3 py-1.5 text-sm font-bold uppercase tracking-widest text-white">Audiometría tonal</div>
            {(["OD", "OI"] as Ear[]).map(ear => (
              <div key={ear} className="mb-3">
                <p className="text-sm font-extrabold uppercase" style={{ color: COLOR[ear] }}>{ear === "OD" ? "Oído derecho" : "Oído izquierdo"}</p>
                <p className="text-center text-[11px] text-[#5b6675]">Frecuencia (Hz)</p>
                <AudioChart ear={ear} svgRef={ear === "OD" ? odRef : oiRef} />
                <div className="mt-1 text-center text-sm font-bold" style={{ color: COLOR[ear] }}>
                  PTA{" "}
                  <input
                    value={ptaOf(ear)}
                    placeholder="—"
                    onChange={e => setPtaManual(m => ({ ...m, [ear]: e.target.value.trim() === "" ? null : e.target.value }))}
                    className="w-16 border-0 border-b border-[#333] bg-transparent text-center text-sm text-[#1a2230]"
                  />{" "}
                  dB HL
                </div>
              </div>
            ))}
            <div className="sheet-banner mb-2 rounded-[3px] bg-[#2f5c9e] px-3 py-1.5 text-sm font-bold uppercase tracking-widest text-white">Logoaudiometría</div>
            <svg ref={logoRef} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} className="block w-full cursor-crosshair border border-[#9aa6b4] bg-white" onClick={onLogoClick}>
              {INTS.map((v, i) => (
                <g key={v}>
                  <line x1={xInt(i)} y1={LG.top} x2={xInt(i)} y2={LG.top + LG_PLOTH} stroke={v % 10 === 0 ? "#d3dae2" : "#eef1f5"} />
                  {v % 10 === 0 ? <text x={xInt(i)} y={LG.top + LG_PLOTH + 14} textAnchor="middle" fontSize={9} fill="#5b6675">{v}</text> : null}
                </g>
              ))}
              {Array.from({ length: 11 }, (_, i) => i * 10).map(p => (
                <g key={p}>
                  <line x1={LG.left} y1={yPct(p)} x2={LG.left + LG_PLOTW} y2={yPct(p)} stroke="#e3e8ee" />
                  <text x={LG.left - 8} y={yPct(p) + 3} textAnchor="end" fontSize={9} fill="#5b6675">{p}</text>
                </g>
              ))}
              <rect x={LG.left} y={LG.top} width={LG_PLOTW} height={LG_PLOTH} fill="none" stroke="#9aa6b4" strokeWidth={1.3} />
              <text x={LG.left + LG_PLOTW / 2} y={LG.top + LG_PLOTH + 30} textAnchor="middle" fontSize={9} fill="#5b6675">Intensidad (dB HTL)</text>
              <text x={12} y={LG.top + LG_PLOTH / 2} textAnchor="middle" fontSize={9} fill="#5b6675" transform={`rotate(-90 12 ${LG.top + LG_PLOTH / 2})`}>% discriminación</text>
              {(["OD", "OI"] as Ear[]).map(ear => {
                const pts = INTS.map(v => ({ v, p: logo[ear][v] })).filter(o => o.p !== undefined)
                const line = pts.length > 1 ? pts.map(o => `${xInt(INTS.indexOf(o.v))},${yPct(o.p!)}`).join(" ") : ""
                return (
                  <g key={ear}>
                    {line ? <polyline points={line} fill="none" stroke={COLOR[ear]} strokeWidth={2} /> : null}
                    {pts.map(o => {
                      const x = xInt(INTS.indexOf(o.v))
                      const y = yPct(o.p!)
                      return ear === "OD"
                        ? <circle key={o.v} cx={x} cy={y} r={5} fill="none" stroke={COLOR.OD} strokeWidth={2} />
                        : (
                          <g key={o.v}>
                            <line x1={x - 5} y1={y - 5} x2={x + 5} y2={y + 5} stroke={COLOR.OI} strokeWidth={2} />
                            <line x1={x + 5} y1={y - 5} x2={x - 5} y2={y + 5} stroke={COLOR.OI} strokeWidth={2} />
                          </g>
                        )
                    })}
                  </g>
                )
              })}
            </svg>
          </div>
          <div className="min-h-60 rounded-lg border-[1.5px] border-dashed border-[#b9c0cc] p-3">
            <p className="text-[13px] font-extrabold uppercase tracking-wide text-[#24306b]">Impedanciometría</p>
            <p className="no-print mt-2 text-xs text-[#5b6675]">Espacio reservado para grapar el resultado impreso.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
