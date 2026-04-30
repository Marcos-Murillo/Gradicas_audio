import React from 'react';
import { View, Text, Svg, Line, Path, G, Circle, Rect, Polygon, StyleSheet } from '@react-pdf/renderer';
import type { DatosAudiometriaTonal, FrecuenciasAudiometry } from '@/types/evaluation';

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  chartsRow: { flexDirection: 'row', gap: 6 },
  chartWrapper: { flex: 1 },
  chartLabel: { fontSize: 9, fontWeight: 'bold', textAlign: 'center', marginBottom: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendText: { fontSize: 6.5 },
});

const W = 230, H = 200;
const PAD = { top: 10, right: 10, bottom: 32, left: 36 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const FREQS = [250, 500, 1000, 2000, 4000, 8000];
const DB_MAX = 130;
const DB_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];

function toX(freq: number) {
  return PAD.left + ((Math.log10(freq) - Math.log10(250)) / (Math.log10(8000) - Math.log10(250))) * PLOT_W;
}
function toY(db: number) { return PAD.top + (db / DB_MAX) * PLOT_H; }

type EarData = Partial<FrecuenciasAudiometry>;
function pts(data: EarData | undefined) {
  if (!data) return [];
  return FREQS.map(f => ({ f, v: data[String(f) as keyof FrecuenciasAudiometry] }))
    .filter((p): p is { f: number; v: number } => p.v !== undefined);
}
function pathD(points: { f: number; v: number }[]) {
  if (points.length < 2) return null;
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.f).toFixed(1)} ${toY(p.v).toFixed(1)}`).join(' ');
}

// ─── ASHA Symbols for PDF ────────────────────────────────────────────────────

/** O — OD vía aérea sin enmascarar */
function PdfO({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return <Circle cx={cx} cy={cy} r={4.5} stroke={color} strokeWidth={1.5} fill="none" />;
}

/** X — OI vía aérea sin enmascarar */
function PdfX({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const h = 4.5;
  return (
    <G>
      <Line x1={cx - h} y1={cy - h} x2={cx + h} y2={cy + h} stroke={color} strokeWidth={1.8} />
      <Line x1={cx + h} y1={cy - h} x2={cx - h} y2={cy + h} stroke={color} strokeWidth={1.8} />
    </G>
  );
}

/** △ — OD vía aérea enmascarada */
function PdfTriangle({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const r = 5.5;
  const pts = `${cx},${cy - r} ${cx + r * 0.866},${cy + r * 0.5} ${cx - r * 0.866},${cy + r * 0.5}`;
  return <Polygon points={pts} stroke={color} strokeWidth={1.5} fill="none" />;
}

/** □ — OI vía aérea enmascarada */
function PdfSquare({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const s = 4.5;
  return <Rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} stroke={color} strokeWidth={1.5} fill="none" />;
}

/** < — OD vía ósea sin enmascarar */
function PdfAngleLeft({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const s = 5;
  return (
    <G>
      <Line x1={cx + s} y1={cy - s} x2={cx - s} y2={cy} stroke={color} strokeWidth={1.5} />
      <Line x1={cx - s} y1={cy} x2={cx + s} y2={cy + s} stroke={color} strokeWidth={1.5} />
    </G>
  );
}

/** > — OI vía ósea sin enmascarar */
function PdfAngleRight({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const s = 5;
  return (
    <G>
      <Line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy} stroke={color} strokeWidth={1.5} />
      <Line x1={cx + s} y1={cy} x2={cx - s} y2={cy + s} stroke={color} strokeWidth={1.5} />
    </G>
  );
}

/** [ — OD vía ósea enmascarada */
function PdfBracketRight({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const h = 6, w = 4;
  return (
    <G>
      <Line x1={cx} y1={cy - h} x2={cx} y2={cy + h} stroke={color} strokeWidth={1.5} />
      <Line x1={cx} y1={cy - h} x2={cx + w} y2={cy - h} stroke={color} strokeWidth={1.5} />
      <Line x1={cx} y1={cy + h} x2={cx + w} y2={cy + h} stroke={color} strokeWidth={1.5} />
    </G>
  );
}

/** ] — OI vía ósea enmascarada */
function PdfBracketLeft({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  const h = 6, w = 4;
  return (
    <G>
      <Line x1={cx} y1={cy - h} x2={cx} y2={cy + h} stroke={color} strokeWidth={1.5} />
      <Line x1={cx} y1={cy - h} x2={cx - w} y2={cy - h} stroke={color} strokeWidth={1.5} />
      <Line x1={cx} y1={cy + h} x2={cx - w} y2={cy + h} stroke={color} strokeWidth={1.5} />
    </G>
  );
}

// ─── Chart ───────────────────────────────────────────────────────────────────

interface AudioChartProps {
  data: DatosAudiometriaTonal;
  isLeft: boolean;
  color: string;
}

function AudioChart({ data, isLeft, color }: AudioChartProps) {
  const airPts = pts(isLeft ? data.oido_izquierdo : data.oido_derecho);
  const airMaskPts = pts(isLeft ? data.oido_izquierdo_enmascarado : data.oido_derecho_enmascarado);
  const bonePts = pts(isLeft ? data.oseo_izquierdo : data.oseo_derecho);
  const boneMaskPts = pts(isLeft ? data.oseo_izquierdo_enmascarado : data.oseo_derecho_enmascarado);

  return (
    <Svg width={W} height={H}>
      {/* Background */}
      <Rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} fill="white" stroke="#333" strokeWidth={0.8} />

      {/* Grid */}
      {DB_TICKS.map(db => (
        <Line key={db} x1={PAD.left} y1={toY(db)} x2={PAD.left + PLOT_W} y2={toY(db)}
          stroke={db === 0 ? '#999' : '#e0e0e0'} strokeWidth={db === 0 ? 0.6 : 0.3} />
      ))}
      {FREQS.map(f => (
        <Line key={f} x1={toX(f)} y1={PAD.top} x2={toX(f)} y2={PAD.top + PLOT_H}
          stroke="#e0e0e0" strokeWidth={0.3} />
      ))}

      {/* Bone conduction dashed lines */}
      {pathD(bonePts) && <Path d={pathD(bonePts)!} stroke={color} strokeWidth={1.2} fill="none" strokeDasharray="3,2" />}
      {pathD(boneMaskPts) && <Path d={pathD(boneMaskPts)!} stroke={color} strokeWidth={1.2} fill="none" strokeDasharray="3,2" strokeOpacity={0.6} />}

      {/* Air conduction lines */}
      {pathD(airPts) && <Path d={pathD(airPts)!} stroke={color} strokeWidth={1.5} fill="none" />}
      {pathD(airMaskPts) && <Path d={pathD(airMaskPts)!} stroke={color} strokeWidth={1.2} fill="none" strokeDasharray="3,2" />}

      {/* Air conduction symbols */}
      {airPts.map(p => isLeft
        ? <PdfX key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
        : <PdfO key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
      )}

      {/* Air conduction masked symbols */}
      {airMaskPts.map(p => isLeft
        ? <PdfSquare key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
        : <PdfTriangle key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
      )}

      {/* Bone conduction symbols */}
      {bonePts.map(p => isLeft
        ? <PdfAngleRight key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
        : <PdfAngleLeft key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
      )}

      {/* Bone conduction masked symbols */}
      {boneMaskPts.map(p => isLeft
        ? <PdfBracketLeft key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
        : <PdfBracketRight key={p.f} cx={toX(p.f)} cy={toY(p.v)} color={color} />
      )}

      {/* Frequency labels */}
      {FREQS.map(f => (
        <Text key={f} x={toX(f)} y={PAD.top + PLOT_H + 10} style={{ fontSize: 6, textAnchor: 'middle', fill: '#333' }}>
          {f >= 1000 ? `${f / 1000}k` : String(f)}
        </Text>
      ))}
      <Text x={PAD.left + PLOT_W / 2} y={H - 2} style={{ fontSize: 7, textAnchor: 'middle', fill: '#555' }}>
        Frecuencia (Hz)
      </Text>

      {/* dB labels */}
      {DB_TICKS.filter((_, i) => i % 2 === 0).map(db => (
        <Text key={db} x={PAD.left - 4} y={toY(db) + 2} style={{ fontSize: 6, textAnchor: 'end', fill: '#333' }}>
          {db}
        </Text>
      ))}
      <Text x={8} y={PAD.top + PLOT_H / 2} style={{ fontSize: 7, textAnchor: 'middle', fill: '#555' }}>
        dB HL
      </Text>
    </Svg>
  );
}

// ─── Legend helpers ──────────────────────────────────────────────────────────

function LegendO({ color }: { color: string }) {
  return <Svg width={12} height={12}><Circle cx={6} cy={6} r={4} stroke={color} strokeWidth={1.5} fill="none" /></Svg>;
}
function LegendX({ color }: { color: string }) {
  return <Svg width={12} height={12}><Line x1={2} y1={2} x2={10} y2={10} stroke={color} strokeWidth={1.8} /><Line x1={10} y1={2} x2={2} y2={10} stroke={color} strokeWidth={1.8} /></Svg>;
}
function LegendTriangle({ color }: { color: string }) {
  return <Svg width={12} height={12}><Polygon points="6,1 11,11 1,11" stroke={color} strokeWidth={1.5} fill="none" /></Svg>;
}
function LegendSquare({ color }: { color: string }) {
  return <Svg width={12} height={12}><Rect x={1} y={1} width={10} height={10} stroke={color} strokeWidth={1.5} fill="none" /></Svg>;
}
function LegendAngleLeft({ color }: { color: string }) {
  return <Svg width={12} height={12}><Line x1={10} y1={1} x2={2} y2={6} stroke={color} strokeWidth={1.5} /><Line x1={2} y1={6} x2={10} y2={11} stroke={color} strokeWidth={1.5} /></Svg>;
}
function LegendAngleRight({ color }: { color: string }) {
  return <Svg width={12} height={12}><Line x1={2} y1={1} x2={10} y2={6} stroke={color} strokeWidth={1.5} /><Line x1={10} y1={6} x2={2} y2={11} stroke={color} strokeWidth={1.5} /></Svg>;
}
function LegendBracketRight({ color }: { color: string }) {
  return <Svg width={12} height={12}><Line x1={5} y1={1} x2={5} y2={11} stroke={color} strokeWidth={1.5} /><Line x1={5} y1={1} x2={9} y2={1} stroke={color} strokeWidth={1.5} /><Line x1={5} y1={11} x2={9} y2={11} stroke={color} strokeWidth={1.5} /></Svg>;
}
function LegendBracketLeft({ color }: { color: string }) {
  return <Svg width={12} height={12}><Line x1={7} y1={1} x2={7} y2={11} stroke={color} strokeWidth={1.5} /><Line x1={7} y1={1} x2={3} y2={1} stroke={color} strokeWidth={1.5} /><Line x1={7} y1={11} x2={3} y2={11} stroke={color} strokeWidth={1.5} /></Svg>;
}

// ─── Export ──────────────────────────────────────────────────────────────────

export function PDFAudiometryChart({ data }: { data: DatosAudiometriaTonal }) {
  const hasOseo = !!(data.oseo_derecho || data.oseo_izquierdo || data.oseo_derecho_enmascarado || data.oseo_izquierdo_enmascarado);
  const hasMasked = !!(data.oido_derecho_enmascarado || data.oido_izquierdo_enmascarado);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audiograma (ASHA 1990)</Text>
      <View style={styles.chartsRow}>
        <View style={styles.chartWrapper}>
          <Text style={[styles.chartLabel, { color: '#cc0000' }]}>Oído Derecho (OD)</Text>
          <AudioChart data={data} isLeft={false} color="#cc0000" />
        </View>
        <View style={styles.chartWrapper}>
          <Text style={[styles.chartLabel, { color: '#0000cc' }]}>Oído Izquierdo (OI)</Text>
          <AudioChart data={data} isLeft={true} color="#0000cc" />
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}><LegendO color="#cc0000" /><Text style={styles.legendText}>OD Aéreo</Text></View>
        <View style={styles.legendItem}><LegendX color="#0000cc" /><Text style={styles.legendText}>OI Aéreo</Text></View>
        {hasMasked && <>
          <View style={styles.legendItem}><LegendTriangle color="#cc0000" /><Text style={styles.legendText}>OD Aéreo enmasc.</Text></View>
          <View style={styles.legendItem}><LegendSquare color="#0000cc" /><Text style={styles.legendText}>OI Aéreo enmasc.</Text></View>
        </>}
        {hasOseo && <>
          <View style={styles.legendItem}><LegendAngleLeft color="#cc0000" /><Text style={styles.legendText}>OD Óseo</Text></View>
          <View style={styles.legendItem}><LegendAngleRight color="#0000cc" /><Text style={styles.legendText}>OI Óseo</Text></View>
          <View style={styles.legendItem}><LegendBracketRight color="#cc0000" /><Text style={styles.legendText}>OD Óseo enmasc.</Text></View>
          <View style={styles.legendItem}><LegendBracketLeft color="#0000cc" /><Text style={styles.legendText}>OI Óseo enmasc.</Text></View>
        </>}
      </View>
    </View>
  );
}
