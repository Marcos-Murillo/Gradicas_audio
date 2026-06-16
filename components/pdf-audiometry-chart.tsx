import React from 'react';
import { View, Text, Svg, Line, Path, G, Circle, Rect, Polygon, StyleSheet } from '@react-pdf/renderer';
import type { DatosAudiometriaTonal, FrecuenciasAudiometry } from '@/types/evaluation';

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendText: { fontSize: 6.5 },
});

const W = 460;
const H = 280;
const PAD = { top: 14, right: 16, bottom: 40, left: 44 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const FREQS = [250, 500, 1000, 2000, 3000, 4000];
const DB_MAX = 130;
const DB_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];

const COLOR_OD = '#cc0000';
const COLOR_OI = '#0000cc';
const OD_OFFSET = 4;
const OI_OFFSET = -4;

function toX(freq: number) {
  return PAD.left + ((Math.log10(freq) - Math.log10(250)) / (Math.log10(4000) - Math.log10(250))) * PLOT_W;
}
function toY(db: number) { return PAD.top + (db / DB_MAX) * PLOT_H; }
function cxOD(freq: number) { return toX(freq) + OD_OFFSET; }
function cxOI(freq: number) { return toX(freq) + OI_OFFSET; }

type EarData = Partial<FrecuenciasAudiometry>;
function pts(data: EarData | undefined) {
  if (!data) return [];
  return FREQS.map(f => ({ f, v: data[String(f) as keyof FrecuenciasAudiometry] }))
    .filter((p): p is { f: number; v: number } => p.v !== undefined);
}
function pathD(points: { f: number; v: number }[], xOffset: number) {
  if (points.length < 2) return null;
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(toX(p.f) + xOffset).toFixed(1)} ${toY(p.v).toFixed(1)}`).join(' ');
}

// ─── ASHA Symbols for PDF ────────────────────────────────────────────────────

function PdfO({ cx, cy }: { cx: number; cy: number }) {
  return <Circle cx={cx} cy={cy} r={4.5} stroke={COLOR_OD} strokeWidth={1.5} fill="none" />;
}

function PdfX({ cx, cy }: { cx: number; cy: number }) {
  const h = 4.5;
  return (
    <G>
      <Line x1={cx - h} y1={cy - h} x2={cx + h} y2={cy + h} stroke={COLOR_OI} strokeWidth={1.8} />
      <Line x1={cx + h} y1={cy - h} x2={cx - h} y2={cy + h} stroke={COLOR_OI} strokeWidth={1.8} />
    </G>
  );
}

function PdfTriangle({ cx, cy }: { cx: number; cy: number }) {
  const r = 5.5;
  const polyPts = `${cx},${cy - r} ${cx + r * 0.866},${cy + r * 0.5} ${cx - r * 0.866},${cy + r * 0.5}`;
  return <Polygon points={polyPts} stroke={COLOR_OD} strokeWidth={1.5} fill="none" />;
}

function PdfSquare({ cx, cy }: { cx: number; cy: number }) {
  const s = 4.5;
  return <Rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} stroke={COLOR_OI} strokeWidth={1.5} fill="none" />;
}

function PdfAngleLeft({ cx, cy }: { cx: number; cy: number }) {
  const s = 5;
  return (
    <G>
      <Line x1={cx + s} y1={cy - s} x2={cx - s} y2={cy} stroke={COLOR_OD} strokeWidth={1.5} />
      <Line x1={cx - s} y1={cy} x2={cx + s} y2={cy + s} stroke={COLOR_OD} strokeWidth={1.5} />
    </G>
  );
}

function PdfAngleRight({ cx, cy }: { cx: number; cy: number }) {
  const s = 5;
  return (
    <G>
      <Line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy} stroke={COLOR_OI} strokeWidth={1.5} />
      <Line x1={cx + s} y1={cy} x2={cx - s} y2={cy + s} stroke={COLOR_OI} strokeWidth={1.5} />
    </G>
  );
}

function PdfBracketRight({ cx, cy }: { cx: number; cy: number }) {
  const h = 6, w = 4;
  return (
    <G>
      <Line x1={cx} y1={cy - h} x2={cx} y2={cy + h} stroke={COLOR_OD} strokeWidth={1.5} />
      <Line x1={cx} y1={cy - h} x2={cx + w} y2={cy - h} stroke={COLOR_OD} strokeWidth={1.5} />
      <Line x1={cx} y1={cy + h} x2={cx + w} y2={cy + h} stroke={COLOR_OD} strokeWidth={1.5} />
    </G>
  );
}

function PdfBracketLeft({ cx, cy }: { cx: number; cy: number }) {
  const h = 6, w = 4;
  return (
    <G>
      <Line x1={cx} y1={cy - h} x2={cx} y2={cy + h} stroke={COLOR_OI} strokeWidth={1.5} />
      <Line x1={cx} y1={cy - h} x2={cx - w} y2={cy - h} stroke={COLOR_OI} strokeWidth={1.5} />
      <Line x1={cx} y1={cy + h} x2={cx - w} y2={cy + h} stroke={COLOR_OI} strokeWidth={1.5} />
    </G>
  );
}

// ─── Combined chart ──────────────────────────────────────────────────────────

function CombinedAudioChart({ data }: { data: DatosAudiometriaTonal }) {
  const airOD = pts(data.oido_derecho);
  const airOI = pts(data.oido_izquierdo);
  const airMaskOD = pts(data.oido_derecho_enmascarado);
  const airMaskOI = pts(data.oido_izquierdo_enmascarado);
  const boneOD = pts(data.oseo_derecho);
  const boneOI = pts(data.oseo_izquierdo);
  const boneMaskOD = pts(data.oseo_derecho_enmascarado);
  const boneMaskOI = pts(data.oseo_izquierdo_enmascarado);

  return (
    <Svg width={W} height={H}>
      <Rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} fill="white" stroke="#333" strokeWidth={0.8} />

      {DB_TICKS.map(db => (
        <Line key={db} x1={PAD.left} y1={toY(db)} x2={PAD.left + PLOT_W} y2={toY(db)}
          stroke={db === 0 ? '#999' : '#e0e0e0'} strokeWidth={db === 0 ? 0.6 : 0.3} />
      ))}
      {FREQS.map(f => (
        <Line key={f} x1={toX(f)} y1={PAD.top} x2={toX(f)} y2={PAD.top + PLOT_H}
          stroke="#e0e0e0" strokeWidth={0.3} />
      ))}

      {/* Vía ósea — punteada */}
      {pathD(boneOD, OD_OFFSET) && <Path d={pathD(boneOD, OD_OFFSET)!} stroke={COLOR_OD} strokeWidth={1.2} fill="none" strokeDasharray="3,2" />}
      {pathD(boneOI, OI_OFFSET) && <Path d={pathD(boneOI, OI_OFFSET)!} stroke={COLOR_OI} strokeWidth={1.2} fill="none" strokeDasharray="3,2" />}
      {pathD(boneMaskOD, OD_OFFSET) && <Path d={pathD(boneMaskOD, OD_OFFSET)!} stroke={COLOR_OD} strokeWidth={1.2} fill="none" strokeDasharray="3,2" />}
      {pathD(boneMaskOI, OI_OFFSET) && <Path d={pathD(boneMaskOI, OI_OFFSET)!} stroke={COLOR_OI} strokeWidth={1.2} fill="none" strokeDasharray="3,2" />}

      {/* Vía aérea — sólida (incluye enmascarada) */}
      {pathD(airOD, OD_OFFSET) && <Path d={pathD(airOD, OD_OFFSET)!} stroke={COLOR_OD} strokeWidth={1.5} fill="none" />}
      {pathD(airOI, OI_OFFSET) && <Path d={pathD(airOI, OI_OFFSET)!} stroke={COLOR_OI} strokeWidth={1.5} fill="none" />}
      {pathD(airMaskOD, OD_OFFSET) && <Path d={pathD(airMaskOD, OD_OFFSET)!} stroke={COLOR_OD} strokeWidth={1.5} fill="none" />}
      {pathD(airMaskOI, OI_OFFSET) && <Path d={pathD(airMaskOI, OI_OFFSET)!} stroke={COLOR_OI} strokeWidth={1.5} fill="none" />}

      {airOD.map(p => <PdfO key={p.f} cx={cxOD(p.f)} cy={toY(p.v)} />)}
      {airOI.map(p => <PdfX key={p.f} cx={cxOI(p.f)} cy={toY(p.v)} />)}
      {airMaskOD.map(p => <PdfTriangle key={`m${p.f}`} cx={cxOD(p.f)} cy={toY(p.v)} />)}
      {airMaskOI.map(p => <PdfSquare key={`m${p.f}`} cx={cxOI(p.f)} cy={toY(p.v)} />)}

      {boneOD.map(p => <PdfAngleLeft key={p.f} cx={cxOD(p.f)} cy={toY(p.v)} />)}
      {boneOI.map(p => <PdfAngleRight key={p.f} cx={cxOI(p.f)} cy={toY(p.v)} />)}
      {boneMaskOD.map(p => <PdfBracketRight key={`m${p.f}`} cx={cxOD(p.f)} cy={toY(p.v)} />)}
      {boneMaskOI.map(p => <PdfBracketLeft key={`m${p.f}`} cx={cxOI(p.f)} cy={toY(p.v)} />)}

      {FREQS.map(f => (
        <Text key={f} x={toX(f)} y={PAD.top + PLOT_H + 10} style={{ fontSize: 6, textAnchor: 'middle', fill: '#333' }}>
          {f >= 1000 ? `${f / 1000}k` : String(f)}
        </Text>
      ))}
      <Text x={PAD.left + PLOT_W / 2} y={H - 2} style={{ fontSize: 7, textAnchor: 'middle', fill: '#555' }}>
        Frecuencia (Hz)
      </Text>

      {DB_TICKS.filter((_, i) => i % 2 === 0).map(db => (
        <Text key={db} x={PAD.left - 4} y={toY(db) + 2} style={{ fontSize: 6, textAnchor: 'end', fill: '#333' }}>
          {db}
        </Text>
      ))}
      <Text x={10} y={PAD.top + PLOT_H / 2} style={{ fontSize: 7, textAnchor: 'middle', fill: '#555' }}>
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
      <CombinedAudioChart data={data} />

      <View style={styles.legend}>
        <View style={styles.legendItem}><LegendO color={COLOR_OD} /><Text style={styles.legendText}>OD Aéreo</Text></View>
        <View style={styles.legendItem}><LegendX color={COLOR_OI} /><Text style={styles.legendText}>OI Aéreo</Text></View>
        {hasMasked && <>
          <View style={styles.legendItem}><LegendTriangle color={COLOR_OD} /><Text style={styles.legendText}>OD Aéreo enmasc.</Text></View>
          <View style={styles.legendItem}><LegendSquare color={COLOR_OI} /><Text style={styles.legendText}>OI Aéreo enmasc.</Text></View>
        </>}
        {hasOseo && <>
          <View style={styles.legendItem}><LegendAngleLeft color={COLOR_OD} /><Text style={styles.legendText}>OD Óseo</Text></View>
          <View style={styles.legendItem}><LegendAngleRight color={COLOR_OI} /><Text style={styles.legendText}>OI Óseo</Text></View>
          <View style={styles.legendItem}><LegendBracketRight color={COLOR_OD} /><Text style={styles.legendText}>OD Óseo enmasc.</Text></View>
          <View style={styles.legendItem}><LegendBracketLeft color={COLOR_OI} /><Text style={styles.legendText}>OI Óseo enmasc.</Text></View>
        </>}
      </View>
    </View>
  );
}
