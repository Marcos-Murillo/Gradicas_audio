import React from 'react';
import { View, Text, Svg, Line, Path, G, StyleSheet } from '@react-pdf/renderer';
import type { DatosLogoaudiometria } from '@/types/evaluation';
import { generateSigmoidCurve } from '@/lib/chart-generators';

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontSize: 7 },
});

const VW = 460;
const VH = 220;
const PAD = { top: 14, right: 16, bottom: 40, left: 40 };
const PLOT_W = VW - PAD.left - PAD.right;
const PLOT_H = VH - PAD.top - PAD.bottom;

const X_MIN = 0;
const X_MAX = 100;
const Y_MIN = 0;
const Y_MAX = 100;

function toSvgX(x: number) {
  return PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_W;
}
function toSvgY(y: number) {
  return PAD.top + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * PLOT_H;
}

const X_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const Y_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

interface Coordinate { x: number; y: number }

function buildPath(coords: Coordinate[]): string {
  const pts = coords.filter(p => p.x >= X_MIN && p.x <= X_MAX).sort((a, b) => a.x - b.x);
  if (pts.length < 2) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x).toFixed(2)} ${toSvgY(p.y).toFixed(2)}`).join(' ');
}

export function PDFLogoaudiometryChart({ data }: { data: DatosLogoaudiometria }) {
  const curveOD = generateSigmoidCurve(data.srt.derecho, data.sds.derecho);
  const curveOI = generateSigmoidCurve(data.srt.izquierdo, data.sds.izquierdo);

  const coordsOD: Coordinate[] = curveOD.map(p => ({ x: p.db, y: p.percentage }));
  const coordsOI: Coordinate[] = curveOI.map(p => ({ x: p.db, y: p.percentage }));

  const pathOD = buildPath(coordsOD);
  const pathOI = buildPath(coordsOI);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logoaudiometría — Curva de Reconocimiento del Habla</Text>

      <Svg width={VW} height={VH}>
        {/* Plot background */}
        <Path
          d={`M ${PAD.left} ${PAD.top} h ${PLOT_W} v ${PLOT_H} h ${-PLOT_W} Z`}
          fill="white" stroke="#555" strokeWidth={0.8}
        />

        {/* Vertical grid lines */}
        {X_TICKS.map(x => (
          <Line key={`vg-${x}`}
            x1={toSvgX(x)} y1={PAD.top}
            x2={toSvgX(x)} y2={PAD.top + PLOT_H}
            stroke="#e5e7eb" strokeWidth={0.5}
          />
        ))}

        {/* Horizontal grid lines */}
        {Y_TICKS.map(y => (
          <Line key={`hg-${y}`}
            x1={PAD.left} y1={toSvgY(y)}
            x2={PAD.left + PLOT_W} y2={toSvgY(y)}
            stroke="#e5e7eb" strokeWidth={0.5}
          />
        ))}

        {/* Series OD */}
        {pathOD ? <Path d={pathOD} fill="none" stroke="#cc0000" strokeWidth={1.8} /> : null}

        {/* Series OI */}
        {pathOI ? <Path d={pathOI} fill="none" stroke="#0000cc" strokeWidth={1.8} /> : null}

        {/* X axis ticks + labels */}
        {X_TICKS.map(x => (
          <G key={`xt-${x}`}>
            <Line x1={toSvgX(x)} y1={PAD.top + PLOT_H} x2={toSvgX(x)} y2={PAD.top + PLOT_H + 4} stroke="#555" strokeWidth={0.6} />
            <Text x={toSvgX(x)} y={PAD.top + PLOT_H + 12} style={{ fontSize: 6, textAnchor: 'middle', fill: '#444' }}>{x}</Text>
          </G>
        ))}

        {/* X axis label */}
        <Text
          x={PAD.left + PLOT_W / 2} y={VH - 6}
          style={{ fontSize: 7, textAnchor: 'middle', fill: '#444' }}
        >
          Intensidad (dB)
        </Text>

        {/* Y axis ticks + labels */}
        {Y_TICKS.map(y => (
          <G key={`yt-${y}`}>
            <Line x1={PAD.left - 4} y1={toSvgY(y)} x2={PAD.left} y2={toSvgY(y)} stroke="#555" strokeWidth={0.6} />
            <Text x={PAD.left - 6} y={toSvgY(y) + 2} style={{ fontSize: 6, textAnchor: 'end', fill: '#444' }}>{y}</Text>
          </G>
        ))}

        {/* Y axis label */}
        <Text
          x={10} y={PAD.top + PLOT_H / 2}
          style={{ fontSize: 7, textAnchor: 'middle', fill: '#444' }}
        >
          Reconocimiento (%)
        </Text>
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Svg width={24} height={8}>
            <Line x1={0} y1={4} x2={24} y2={4} stroke="#cc0000" strokeWidth={2} />
          </Svg>
          <Text style={styles.legendText}>OD (Oído Derecho)</Text>
        </View>
        <View style={styles.legendItem}>
          <Svg width={24} height={8}>
            <Line x1={0} y1={4} x2={24} y2={4} stroke="#0000cc" strokeWidth={2} />
          </Svg>
          <Text style={styles.legendText}>OI (Oído Izquierdo)</Text>
        </View>
      </View>
    </View>
  );
}
