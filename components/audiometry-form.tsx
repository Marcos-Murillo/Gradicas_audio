"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { audiometriaTonalSchema } from "@/lib/validation-schemas";
import type { DatosAudiometriaTonal, FrecuenciasAudiometry } from "@/types/evaluation";

export interface AudiometryFormProps {
  onSubmit: (data: DatosAudiometriaTonal) => void;
  initialData?: DatosAudiometriaTonal;
}

const FREQUENCIES = [
  { value: '250', label: '250 Hz' },
  { value: '500', label: '500 Hz' },
  { value: '1000', label: '1000 Hz' },
  { value: '2000', label: '2000 Hz' },
  { value: '4000', label: '4000 Hz' },
  { value: '8000', label: '8000 Hz' },
] as const;

type FreqKey = keyof FrecuenciasAudiometry;

/** Renders a row of 6 frequency inputs for a given field prefix */
function FrequencyRow({
  form,
  prefix,
  label,
  color,
  symbol,
}: {
  form: any;
  prefix: string;
  label: string;
  color: string;
  symbol: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span style={{ color }} className="font-semibold text-sm">{label}</span>
        <span className="text-muted-foreground text-xs">{symbol}</span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {FREQUENCIES.map((freq) => (
          <FormField
            key={`${prefix}.${freq.value}`}
            control={form.control}
            name={`${prefix}.${freq.value}` as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{freq.label}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="dB"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === '' ? undefined : Number(v));
                      }}
                      className="pr-8 text-sm h-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      dB
                    </span>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
}

function cleanFreqs(obj: any): Partial<FrecuenciasAudiometry> | undefined {
  if (!obj) return undefined;
  const entries = Object.entries(obj).filter(([_, v]) => v !== undefined && v !== '');
  return entries.length > 0 ? Object.fromEntries(entries) as Partial<FrecuenciasAudiometry> : undefined;
}

export function AudiometryForm({ onSubmit, initialData }: AudiometryFormProps) {
  const [showOseo, setShowOseo] = useState(false);
  const [showEnmascarado, setShowEnmascarado] = useState(false);

  const form = useForm<DatosAudiometriaTonal>({
    // @ts-ignore
    resolver: zodResolver(audiometriaTonalSchema),
    defaultValues: initialData || {
      tipo: 'tonal',
      oido_derecho: {},
      oido_izquierdo: {},
    },
  });

  const buildCleanData = React.useCallback((): DatosAudiometriaTonal => {
    const values = form.getValues();
    return {
      tipo: 'tonal',
      oido_derecho: cleanFreqs(values.oido_derecho) ?? {},
      oido_izquierdo: cleanFreqs(values.oido_izquierdo) ?? {},
      oido_derecho_enmascarado: cleanFreqs(values.oido_derecho_enmascarado),
      oido_izquierdo_enmascarado: cleanFreqs(values.oido_izquierdo_enmascarado),
      oseo_derecho: cleanFreqs(values.oseo_derecho),
      oseo_izquierdo: cleanFreqs(values.oseo_izquierdo),
      oseo_derecho_enmascarado: cleanFreqs(values.oseo_derecho_enmascarado),
      oseo_izquierdo_enmascarado: cleanFreqs(values.oseo_izquierdo_enmascarado),
    };
  }, [form]);

  const handleBlur = React.useCallback(() => {
    const cleanData = buildCleanData();
    const result = audiometriaTonalSchema.safeParse(cleanData);
    if (result.success) onSubmit(result.data as DatosAudiometriaTonal);
  }, [buildCleanData, onSubmit]);

  const handleConfirm = React.useCallback(() => {
    const cleanData = buildCleanData();
    const result = audiometriaTonalSchema.safeParse(cleanData);
    if (result.success) {
      onSubmit(result.data as DatosAudiometriaTonal);
    } else {
      form.trigger();
    }
  }, [buildCleanData, form, onSubmit]);

  return (
    <Form {...form}>
      <div className="space-y-6" onChange={handleBlur}>

        {/* ── Vía Aérea ── */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold border-b pb-1">Vía Aérea — Sin enmascarar</h3>
          <p className="text-xs text-muted-foreground">
            OD: símbolo <span className="font-bold text-red-600">O</span> &nbsp;|&nbsp;
            OI: símbolo <span className="font-bold text-blue-600">X</span>
          </p>

          <FrequencyRow form={form} prefix="oido_derecho" label="Oído Derecho (OD)" color="#dc2626"
            symbol={<svg width={14} height={14}><circle cx={7} cy={7} r={5} stroke="#dc2626" strokeWidth={2} fill="none" /></svg>}
          />
          <FrequencyRow form={form} prefix="oido_izquierdo" label="Oído Izquierdo (OI)" color="#2563eb"
            symbol={<svg width={14} height={14}><line x1={3} y1={3} x2={11} y2={11} stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" /><line x1={11} y1={3} x2={3} y2={11} stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" /></svg>}
          />

          {(form.formState.errors.oido_derecho as any)?.root && (
            <p className="text-sm text-red-500">{(form.formState.errors.oido_derecho as any).root.message}</p>
          )}
          {(form.formState.errors.oido_izquierdo as any)?.root && (
            <p className="text-sm text-red-500">{(form.formState.errors.oido_izquierdo as any).root.message}</p>
          )}
          <p className="text-xs text-muted-foreground">* Se requieren al menos 4 frecuencias por oído</p>
        </div>

        {/* ── Vía Aérea Enmascarada (opcional) ── */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowEnmascarado(v => !v)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showEnmascarado ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Vía Aérea — Enmascarada (opcional)
            <span className="text-xs">
              OD: <span className="text-red-600 font-bold">△</span> &nbsp;OI: <span className="text-blue-600 font-bold">□</span>
            </span>
          </button>

          {showEnmascarado && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <FrequencyRow form={form} prefix="oido_derecho_enmascarado" label="OD Enmascarado" color="#dc2626"
                symbol={<svg width={14} height={14}><polygon points="7,2 13,12 1,12" stroke="#dc2626" strokeWidth={2} fill="none" /></svg>}
              />
              <FrequencyRow form={form} prefix="oido_izquierdo_enmascarado" label="OI Enmascarado" color="#2563eb"
                symbol={<svg width={14} height={14}><rect x={2} y={2} width={10} height={10} stroke="#2563eb" strokeWidth={2} fill="none" /></svg>}
              />
            </div>
          )}
        </div>

        {/* ── Vía Ósea (opcional) ── */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowOseo(v => !v)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showOseo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Vía Ósea (opcional)
            <span className="text-xs">
              OD sin enmasc.: <span className="text-red-600 font-bold">&lt;</span> &nbsp;
              OI sin enmasc.: <span className="text-blue-600 font-bold">&gt;</span> &nbsp;
              OD enmasc.: <span className="text-red-600 font-bold">[</span> &nbsp;
              OI enmasc.: <span className="text-blue-600 font-bold">]</span>
            </span>
          </button>

          {showOseo && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <h4 className="text-sm font-medium text-muted-foreground">Sin enmascarar</h4>
              <FrequencyRow form={form} prefix="oseo_derecho" label="OD Óseo" color="#dc2626"
                symbol={<svg width={14} height={14}><line x1={12} y1={2} x2={2} y2={7} stroke="#dc2626" strokeWidth={2} strokeLinecap="round" /><line x1={2} y1={7} x2={12} y2={12} stroke="#dc2626" strokeWidth={2} strokeLinecap="round" /></svg>}
              />
              <FrequencyRow form={form} prefix="oseo_izquierdo" label="OI Óseo" color="#2563eb"
                symbol={<svg width={14} height={14}><line x1={2} y1={2} x2={12} y2={7} stroke="#2563eb" strokeWidth={2} strokeLinecap="round" /><line x1={12} y1={7} x2={2} y2={12} stroke="#2563eb" strokeWidth={2} strokeLinecap="round" /></svg>}
              />

              <h4 className="text-sm font-medium text-muted-foreground">Enmascarada</h4>
              <FrequencyRow form={form} prefix="oseo_derecho_enmascarado" label="OD Óseo Enmasc." color="#dc2626"
                symbol={<svg width={14} height={14}><line x1={7} y1={1} x2={7} y2={13} stroke="#dc2626" strokeWidth={2} strokeLinecap="round" /><line x1={7} y1={1} x2={12} y2={1} stroke="#dc2626" strokeWidth={2} strokeLinecap="round" /><line x1={7} y1={13} x2={12} y2={13} stroke="#dc2626" strokeWidth={2} strokeLinecap="round" /></svg>}
              />
              <FrequencyRow form={form} prefix="oseo_izquierdo_enmascarado" label="OI Óseo Enmasc." color="#2563eb"
                symbol={<svg width={14} height={14}><line x1={7} y1={1} x2={7} y2={13} stroke="#2563eb" strokeWidth={2} strokeLinecap="round" /><line x1={7} y1={1} x2={2} y2={1} stroke="#2563eb" strokeWidth={2} strokeLinecap="round" /><line x1={7} y1={13} x2={2} y2={13} stroke="#2563eb" strokeWidth={2} strokeLinecap="round" /></svg>}
              />
            </div>
          )}
        </div>

        {/* ── Confirm button ── */}
        <div className="pt-2">
          <Button type="button" variant="outline" size="sm" onClick={handleConfirm}>
            Confirmar datos de audiometría
          </Button>
        </div>

      </div>
    </Form>
  );
}
