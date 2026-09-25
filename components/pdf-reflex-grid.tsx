import React from 'react'
import { View, Text, Svg, Path, Line, Rect, StyleSheet } from '@react-pdf/renderer'
import type { DatosTimpanometria, FrecuenciaReflejo, UmbralReflejo } from '@/types/evaluation'

const FREQS: FrecuenciaReflejo[] = ['500', '1000', '2000', '4000']

const styles = StyleSheet.create({
  wrap: { marginTop: 4 },
  earTitle: { fontSize: 9, fontWeight: 'bold', marginTop: 6, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cell: { width: '24%', borderWidth: 1, borderColor: '#d7dce4' },
  cellHead: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 3, paddingVertical: 2, borderBottomWidth: 1 },
  cellLabel: { fontSize: 6.5, color: '#5b6675' },
  cellValue: { fontSize: 7, fontWeight: 'bold' },
})

function MiniTrace({
  umbral,
  color,
}: {
  umbral: UmbralReflejo | undefined
  color: string
}) {
  const W = 108
  const H = 34
  const isNR = umbral === null
  const hasValue = umbral !== undefined
  const dip = hasValue && !isNR ? `M 6 12 Q 54 28 102 12` : ''
  const flat = isNR ? `M 6 18 L 102 18` : ''

  return (
    <Svg width={W} height={H}>
      <Rect x={4} y={6} width={100} height={22} fill="#ffffff" stroke="#e5e7eb" strokeWidth={0.6} />
      <Line x1={4} y1={17} x2={104} y2={17} stroke="#eef1f5" strokeWidth={0.6} />
      {dip ? <Path d={dip} fill="none" stroke={color} strokeWidth={1.4} /> : null}
      {flat ? <Path d={flat} fill="none" stroke="#9aa6b4" strokeWidth={1} strokeDasharray="3 2" /> : null}
    </Svg>
  )
}

function Cell({
  freq,
  tipo,
  umbral,
  color,
}: {
  freq: FrecuenciaReflejo
  tipo: 'Ipsi' | 'Contra'
  umbral: UmbralReflejo | undefined
  color: string
}) {
  const label = umbral === undefined ? '—' : umbral === null ? 'NR' : `${umbral} dB`
  return (
    <View style={styles.cell} wrap={false}>
      <View style={[styles.cellHead, { borderBottomColor: color }]}>
        <Text style={styles.cellLabel}>{tipo} {freq} Hz</Text>
        <Text style={[styles.cellValue, { color }]}>{label}</Text>
      </View>
      <MiniTrace umbral={umbral} color={color} />
    </View>
  )
}

function EarBlock({
  title,
  color,
  ipsi,
  contra,
}: {
  title: string
  color: string
  ipsi: Partial<Record<FrecuenciaReflejo, UmbralReflejo>>
  contra: Partial<Record<FrecuenciaReflejo, UmbralReflejo>>
}) {
  return (
    <View>
      <Text style={[styles.earTitle, { color }]}>{title}</Text>
      <View style={styles.row}>
        {FREQS.map(f => (
          <Cell key={`i-${f}`} freq={f} tipo="Ipsi" umbral={ipsi[f]} color={color} />
        ))}
      </View>
      <View style={styles.row}>
        {FREQS.map(f => (
          <Cell key={`c-${f}`} freq={f} tipo="Contra" umbral={contra[f]} color={color} />
        ))}
      </View>
    </View>
  )
}

export function PDFReflexGrid({ data }: { data: DatosTimpanometria }) {
  if (!data.reflejos) return null
  const { derecho, izquierdo } = data.reflejos

  return (
    <View style={styles.wrap}>
      <EarBlock
        title="Sonda OD — Oído derecho"
        color="#d11c1c"
        ipsi={derecho.ipsilateral}
        contra={derecho.contralateral}
      />
      <EarBlock
        title="Sonda OI — Oído izquierdo"
        color="#1452d1"
        ipsi={izquierdo.ipsilateral}
        contra={izquierdo.contralateral}
      />
    </View>
  )
}
