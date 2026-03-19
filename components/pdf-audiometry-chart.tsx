import React from 'react';
import { View, Text, Svg, Line, Path, G, Circle, Rect, StyleSheet } from '@react-pdf/renderer';
import type { DatosAudiometriaTonal } from '@/types/evaluation';

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  chartsRow: { flexDirection: 'row', gap: 6 },
  chartWrapper: { flex: 1 },
  chartLabel: { fontSize: 9, fontWeight: 'bold', textAlign: 'center', marginBottom: 2 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendText: { fontSize: 7 },
});

// Chart dimensions
const W = 230;
const H = 200;
const PAD = { top: 10, right: 10, bottom: 32, left: 36 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const FREQS = [250, 500, 1000, 2000, 4000, 8000];
const DB_MIN = 0;
const DB_MAX = 130;
const DB_TICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];

function toX(freq: number): number {
  const logMin = Math.log10(250);
  const logMax = Math.log10(8000);
  return PAD.left + ((Math.log10(freq) - logMin) / (logMax - logMin)) * PLOT_W;
}

function toY(db: number): number {
  return PAD.top + (db / DB_MAX) * PLOT_H;
}

// X symbol (close icon) — for left ear air conduction
function XSymbol({ cx, cy, s, color }: { cx: number; cy: number; s: number; color: string }) {
  const scale = s / 24;
  const tx = cx - 12 * scale;
  const ty = cy - 12 * scale;
  const d = 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';
  return (
    <G transform={`translate(${tx}, ${ty}) scale(${scale})`}>
      <Path d={d} fill={color} />
    </G>
  );
}

// O symbol — for right ear air conduction
function OSymbol({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  return <Circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={1.5} fill="none" />;
}

// Bracket [ symbol — for right ear bone conduction
function BracketRightSymbol({ cx, cy, s, color }: { cx: number; cy: number; s: number; color: string }) {
  const h = s;
  const w = s * 0.5;
  return (
    <G>
      <Line x1={cx} y1={cy - h / 2} x2={cx} y2={cy + h / 2} stroke={color} strokeWidth={1.2} />
      <Line x1={cx} y1={cy - h / 2} x2={cx - w} y2={cy - h / 2} stroke={color} strokeWidth={1.2} />
      <Line x1={cx} y1={cy + h / 2} x2={cx - w} y2={cy + h / 2} stroke={color} strokeWidth={1.2} />
    </G>
  );
}

// Bracket ] symbol — for left ear bone conduction
function BracketLeftSymbol({ cx, cy, s, color }: { cx: number; cy: number; s: number; color: string }) {
  const h = s;
  const w = s * 0.5;
  return (
    <G>
      <Line x1={cx} y1={cy - h / 2} x2={cx} y2={cy + h / 2} stroke={color} strokeWidth={1.2} />
      <Line x1={cx} y1={cy - h / 2} x2={cx + w} y2={cy - h / 2} stroke={color} strokeWidth={1.2} />
      <Line x1={cx} y1={cy + h / 2} x2={cx + w} y2={cy + h / 2} stroke={color} strokeWidth={1.2} />
    </G>
  );
}

interface EarData {
  [freq: string]: number | undefined;
}

interface AudioChartProps {
  airData: EarData;
  boneData?: EarData;
  color: string;
  isLeft: boolean; // left ear uses X, right ear uses O
}

function AudioChart({ airData, boneData, color, isLeft }: AudioChartProps) {
  // Build air conduction points
  const airPoints = FREQS
    .map(f => ({ f, v: airData[String(f)] }))
    .filter(p => p.v !== undefined) as { f: number; v: number }[];

  // Build bone conduction points
  const bonePoints = boneData
    ? FREQS
        .map(f => ({ f, v: boneData[String(f)] }))
        .filter(p => p.v !== undefined) as { f: number; v: number }[]
    : [];

  // Build polyline string for air conduction
  const airLine = airPoints.length >= 2
    ? airPoints.map(p => `${toX(p.f).toFixed(1)},${toY(p.v).toFixed(1)}`).join(' ')
    : null;

  // Build polyline string for bone conduction (dashed via segments)
  const boneLine = bonePoints.length >= 2 ? bonePoints : [];

  return (
    <Svg width={W} height={H}>
      {/* Plot area background */}
      <Rect
        x={PAD.left} y={PAD.top}
        width={PLOT_W} height={PLOT_H}
        fill="white" stroke="#333" strokeWidth={0.8}
      />

      {/* Horizontal grid lines (dB ticks) */}
      {DB_TICKS.map(db => (
        <Line
          key={db}
          x1={PAD.left} y1={toY(db)}
          x2={PAD.left + PLOT_W} y2={toY(db)}
          stroke={db === 0 ? '#999' : '#e0e0e0'}
          strokeWidth={db === 0 ? 0.6 : 0.3}
        />
      ))}

      {/* Vertical grid lines (frequency) */}
      {FREQS.map(f => (
        <Line
          key={f}
          x1={toX(f)} y1={PAD.top}
          x2={toX(f)} y2={PAD.top + PLOT_H}
          stroke="#e0e0e0" strokeWidth={0.3}
        />
      ))}

      {/* Air conduction line */}
      {airLine && (
        <Path
          d={`M ${airPoints.map(p => `${toX(p.f).toFixed(1)} ${toY(p.v).toFixed(1)}`).join(' L ')}`}
          stroke={color} strokeWidth={1.5} fill="none"
        />
      )}

      {/* Bone conduction dashed line segments */}
      {boneLine.length >= 2 && boneLine.slice(0, -1).map((p, i) => (
        <Line
          key={i}
          x1={toX(p.f)} y1={toY(p.v)}
          x2={toX(boneLine[i + 1].f)} y2={toY(boneLine[i + 1].v)}
          stroke={color} strokeWidth={1.2} strokeDasharray="3,2"
        />
      ))}

      {/* Air conduction symbols */}
      {airPoints.map(p => (
        isLeft
          ? <XSymbol key={p.f} cx={toX(p.f)} cy={toY(p.v)} s={9} color={color} />
          : <OSymbol key={p.f} cx={toX(p.f)} cy={toY(p.v)} r={4.5} color={color} />
      ))}

      {/* Bone conduction symbols */}
      {bonePoints.map(p => (
        isLeft
          ? <BracketLeftSymbol key={p.f} cx={toX(p.f)} cy={toY(p.v)} s={9} color={color} />
          : <BracketRightSymbol key={p.f} cx={toX(p.f)} cy={toY(p.v)} s={9} color={color} />
      ))}

      {/* X axis: frequency labels */}
      {FREQS.map(f => (
        <Text
          key={f}
          x={toX(f)}
          y={PAD.top + PLOT_H + 10}
          style={{ fontSize: 6, textAnchor: 'middle', fill: '#333' }}
        >
          {f >= 1000 ? `${f / 1000}k` : String(f)}
        </Text>
      ))}

      {/* X axis label */}
      <Text
        x={PAD.left + PLOT_W / 2}
        y={H - 2}
        style={{ fontSize: 7, textAnchor: 'middle', fill: '#555' }}
      >
        Frecuencia (Hz)
      </Text>

      {/* Y axis: dB labels */}
      {DB_TICKS.filter((_, i) => i % 2 === 0).map(db => (
        <Text
          key={db}
          x={PAD.left - 4}
          y={toY(db) + 2}
          style={{ fontSize: 6, textAnchor: 'end', fill: '#333' }}
        >
          {db}
        </Text>
      ))}

      {/* Y axis label */}
      <Text
        x={8}
        y={PAD.top + PLOT_H / 2}
        style={{ fontSize: 7, textAnchor: 'middle', fill: '#555' }}
      >
        dB
      </Text>
    </Svg>
  );
}

export function PDFAudiometryChart({ data }: { data: DatosAudiometriaTonal }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audiograma</Text>
      <View style={styles.chartsRow}>
        {/* Oído Derecho */}
        <View style={styles.chartWrapper}>
          <Text style={[styles.chartLabel, { color: '#cc0000' }]}>Oído Derecho (OD)</Text>
          <AudioChart
            airData={data.oido_derecho}
            color="#cc0000"
            isLeft={false}
          />
        </View>
        {/* Oído Izquierdo */}
        <View style={styles.chartWrapper}>
          <Text style={[styles.chartLabel, { color: '#0000cc' }]}>Oído Izquierdo (OI)</Text>
          <AudioChart
            airData={data.oido_izquierdo}
            color="#0000cc"
            isLeft={true}
          />
        </View>
      </View>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Svg width={12} height={12}>
            <Circle cx={6} cy={6} r={4} stroke="#cc0000" strokeWidth={1.5} fill="none" />
          </Svg>
          <Text style={styles.legendText}>OD Aéreo</Text>
        </View>
        <View style={styles.legendItem}>
          <Svg width={12} height={12}>
            <Path
              d="M8 2.41L6.59 1 4 3.59 1.41 1 0 2.41 2.59 5 0 7.59 1.41 9 4 6.41 6.59 9 8 7.59 5.41 5z"
              fill="#0000cc"
            />
          </Svg>
          <Text style={styles.legendText}>OI Aéreo</Text>
        </View>
      </View>
    </View>
  );
}
