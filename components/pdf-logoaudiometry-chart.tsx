import React from 'react';
import { View, Text, Svg, Line, Path, G, Circle, StyleSheet } from '@react-pdf/renderer';
import type { DatosLogoaudiometria, PuntoLogoaudiometria } from '@/types/evaluation';

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontSize: 7 },
});

const INTS: number[] = [];
for (let i = 0; i <= 110; i += 10) INTS.push(i);
const LG = { left: 36, top: 16, colw: 28, rowh: 12 };
const PLOT_W = (INTS.length - 1) * LG.colw;
const PLOT_H = 10 * LG.rowh;
const PAD = { top: LG.top, right: 10, bottom: 28, left: LG.left };
const VW = LG.left + PLOT_W + 10;
const VH = LG.top + PLOT_H + PAD.bottom;
const Y_MAX = 100;

type Pt = { x: number; y: number };

function toPts(puntos: PuntoLogoaudiometria[]): Pt[] {
  return puntos
    .map(p => ({ x: Number(p.db), y: Math.round((Number(p.correctas) / 10) * 100) }))
    .filter(p => !Number.isNaN(p.x) && !Number.isNaN(p.y))
    .sort((a, b) => a.x - b.x);
}

function computeXRange(): { xMin: number; xMax: number } {
  return { xMin: 0, xMax: 110 };
}

function toSvgX(x: number, xMin: number, xMax: number) {
  return PAD.left + ((x - xMin) / (xMax - xMin)) * PLOT_W;
}
function toSvgY(y: number) {
  return PAD.top + ((Y_MAX - y) / Y_MAX) * PLOT_H;
}

function buildPath(pts: Pt[], xMin: number, xMax: number): string {
  if (pts.length < 2) return '';
  return pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x, xMin, xMax).toFixed(1)} ${toSvgY(p.y).toFixed(1)}`)
    .join(' ');
}

function xTicks(xMin: number, xMax: number): number[] {
  const ticks: number[] = [];
  for (let v = xMin; v <= xMax; v += 20) ticks.push(v);
  return ticks;
}

const Y_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export function PDFLogoaudiometryChart({ data }: { data: DatosLogoaudiometria }) {
  const ptsOD = toPts(data.puntos.derecho ?? []);
  const ptsOI = toPts(data.puntos.izquierdo ?? []);
  const ptsODm = toPts(data.puntos.derecho_enmascarado ?? []);
  const ptsOIm = toPts(data.puntos.izquierdo_enmascarado ?? []);

  const all = [...ptsOD, ...ptsOI, ...ptsODm, ...ptsOIm];
  if (all.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Logoaudiometría — Curva de Reconocimiento del Habla</Text>
        <Text style={{ fontSize: 8, textAlign: 'center', color: '#666' }}>Sin datos para graficar</Text>
      </View>
    );
  }

  const { xMin, xMax } = computeXRange();
  const xTickValues = xTicks(xMin, xMax);
  const hasMasked = ptsODm.length > 0 || ptsOIm.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logoaudiometría — Curva de Reconocimiento del Habla</Text>
      <Svg width={VW} height={VH}>
        <Path d={`M ${PAD.left} ${PAD.top} h ${PLOT_W} v ${PLOT_H} h ${-PLOT_W} Z`} fill="white" stroke="#555" strokeWidth={0.8} />

        {xTickValues.map(v => (
          <G key={`gx-${v}`}>
            <Line x1={toSvgX(v, xMin, xMax)} y1={PAD.top} x2={toSvgX(v, xMin, xMax)} y2={PAD.top + PLOT_H} stroke="#e5e7eb" strokeWidth={0.5} />
          </G>
        ))}
        {Y_TICKS.map(v => (
          <G key={`gy-${v}`}>
            <Line x1={PAD.left} y1={toSvgY(v)} x2={PAD.left + PLOT_W} y2={toSvgY(v)} stroke="#e5e7eb" strokeWidth={0.5} />
          </G>
        ))}

        {buildPath(ptsOD, xMin, xMax) ? <Path d={buildPath(ptsOD, xMin, xMax)} fill="none" stroke="#d11c1c" strokeWidth={1.8} /> : null}
        {buildPath(ptsOI, xMin, xMax) ? <Path d={buildPath(ptsOI, xMin, xMax)} fill="none" stroke="#1452d1" strokeWidth={1.8} /> : null}
        {hasMasked && buildPath(ptsODm, xMin, xMax) ? (
          <Path d={buildPath(ptsODm, xMin, xMax)} fill="none" stroke="#d11c1c" strokeWidth={1.4} strokeDasharray="3,2" />
        ) : null}
        {hasMasked && buildPath(ptsOIm, xMin, xMax) ? (
          <Path d={buildPath(ptsOIm, xMin, xMax)} fill="none" stroke="#1452d1" strokeWidth={1.4} strokeDasharray="3,2" />
        ) : null}

        {ptsOD.map((p, i) => <Circle key={`od-${i}`} cx={toSvgX(p.x, xMin, xMax)} cy={toSvgY(p.y)} r={3.5} fill="none" stroke="#d11c1c" strokeWidth={1.4} />)}
        {ptsOI.map((p, i) => (
          <G key={`oi-${i}`}>
            <Line x1={toSvgX(p.x, xMin, xMax) - 3.5} y1={toSvgY(p.y) - 3.5} x2={toSvgX(p.x, xMin, xMax) + 3.5} y2={toSvgY(p.y) + 3.5} stroke="#1452d1" strokeWidth={1.4} />
            <Line x1={toSvgX(p.x, xMin, xMax) + 3.5} y1={toSvgY(p.y) - 3.5} x2={toSvgX(p.x, xMin, xMax) - 3.5} y2={toSvgY(p.y) + 3.5} stroke="#1452d1" strokeWidth={1.4} />
          </G>
        ))}
        {hasMasked && ptsODm.map((p, i) => <Circle key={`odm-${i}`} cx={toSvgX(p.x, xMin, xMax)} cy={toSvgY(p.y)} r={3.5} fill="none" stroke="#d11c1c" strokeWidth={1.4} />)}
        {hasMasked && ptsOIm.map((p, i) => (
          <G key={`oim-${i}`}>
            <Line x1={toSvgX(p.x, xMin, xMax) - 3.5} y1={toSvgY(p.y) - 3.5} x2={toSvgX(p.x, xMin, xMax) + 3.5} y2={toSvgY(p.y) + 3.5} stroke="#1452d1" strokeWidth={1.4} />
            <Line x1={toSvgX(p.x, xMin, xMax) + 3.5} y1={toSvgY(p.y) - 3.5} x2={toSvgX(p.x, xMin, xMax) - 3.5} y2={toSvgY(p.y) + 3.5} stroke="#1452d1" strokeWidth={1.4} />
          </G>
        ))}

        {xTickValues.map(x => (
          <G key={`xt-${x}`}>
            <Line x1={toSvgX(x, xMin, xMax)} y1={PAD.top + PLOT_H} x2={toSvgX(x, xMin, xMax)} y2={PAD.top + PLOT_H + 4} stroke="#555" strokeWidth={0.6} />
            <Text x={toSvgX(x, xMin, xMax)} y={PAD.top + PLOT_H + 14} textAnchor="middle" style={{ fontSize: 7, fill: '#444' }}>{x}</Text>
          </G>
        ))}
        <Text x={PAD.left + PLOT_W / 2} y={VH - 8} textAnchor="middle" style={{ fontSize: 8, fill: '#444' }}>Intensidad (dB HTL)</Text>

        {Y_TICKS.filter((_, i) => i % 2 === 0).map(y => (
          <G key={`yt-${y}`}>
            <Line x1={PAD.left - 4} y1={toSvgY(y)} x2={PAD.left} y2={toSvgY(y)} stroke="#555" strokeWidth={0.6} />
            <Text x={PAD.left - 6} y={toSvgY(y) + 2} textAnchor="end" style={{ fontSize: 7, fill: '#444' }}>{y}</Text>
          </G>
        ))}
      </Svg>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Svg width={24} height={8}><Line x1={0} y1={4} x2={24} y2={4} stroke="#d11c1c" strokeWidth={2} /></Svg>
          <Text style={styles.legendText}>OD (Oído Derecho)</Text>
        </View>
        <View style={styles.legendItem}>
          <Svg width={24} height={8}><Line x1={0} y1={4} x2={24} y2={4} stroke="#1452d1" strokeWidth={2} /></Svg>
          <Text style={styles.legendText}>OI (Oído Izquierdo)</Text>
        </View>
        {hasMasked && (
          <>
            <View style={styles.legendItem}>
              <Svg width={24} height={8}><Line x1={0} y1={4} x2={24} y2={4} stroke="#d11c1c" strokeWidth={1.6} strokeDasharray="3,2" /></Svg>
              <Text style={styles.legendText}>OD Enmasc.</Text>
            </View>
            <View style={styles.legendItem}>
              <Svg width={24} height={8}><Line x1={0} y1={4} x2={24} y2={4} stroke="#1452d1" strokeWidth={1.6} strokeDasharray="3,2" /></Svg>
              <Text style={styles.legendText}>OI Enmasc.</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
