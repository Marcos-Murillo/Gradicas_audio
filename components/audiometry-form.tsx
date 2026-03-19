"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import type { DatosAudiometriaTonal } from "@/types/evaluation";

/**
 * Props para el componente AudiometryForm
 */
export interface AudiometryFormProps {
  onSubmit: (data: DatosAudiometriaTonal) => void;
  initialData?: DatosAudiometriaTonal;
}

/**
 * Frecuencias estándar para audiometría tonal
 */
const FREQUENCIES = [
  { value: '250', label: '250 Hz' },
  { value: '500', label: '500 Hz' },
  { value: '1000', label: '1000 Hz' },
  { value: '2000', label: '2000 Hz' },
  { value: '4000', label: '4000 Hz' },
  { value: '8000', label: '8000 Hz' },
] as const;

/**
 * Componente AudiometryForm
 * 
 * Captura datos de audiometría tonal para ambos oídos con validación.
 * Utiliza React Hook Form + Zod para validación.
 * Requiere al menos 4 frecuencias completadas por oído.
 * 
 * Valida: Requirements 3.1-3.6
 */
export function AudiometryForm({ onSubmit, initialData }: AudiometryFormProps) {
  const form = useForm<DatosAudiometriaTonal>({
    // @ts-ignore - Type compatibility issue between zod versions
    resolver: zodResolver(audiometriaTonalSchema),
    defaultValues: initialData || {
      tipo: 'tonal',
      oido_derecho: {},
      oido_izquierdo: {},
    },
  });

  // Submit on blur
  const handleBlur = React.useCallback(() => {
    const values = form.getValues();
    const cleanData: DatosAudiometriaTonal = {
      tipo: 'tonal',
      oido_derecho: Object.fromEntries(
        Object.entries(values.oido_derecho || {}).filter(([_, v]) => v !== undefined)
      ) as Partial<typeof values.oido_derecho>,
      oido_izquierdo: Object.fromEntries(
        Object.entries(values.oido_izquierdo || {}).filter(([_, v]) => v !== undefined)
      ) as Partial<typeof values.oido_izquierdo>,
    };
    const result = audiometriaTonalSchema.safeParse(cleanData);
    if (result.success) {
      onSubmit(result.data);
    }
  }, [form, onSubmit]);

  const handleSubmit = (data: DatosAudiometriaTonal) => {
    // Remove undefined values from the data
    const cleanData: DatosAudiometriaTonal = {
      tipo: 'tonal',
      oido_derecho: Object.fromEntries(
        Object.entries(data.oido_derecho).filter(([_, v]) => v !== undefined)
      ) as Partial<typeof data.oido_derecho>,
      oido_izquierdo: Object.fromEntries(
        Object.entries(data.oido_izquierdo).filter(([_, v]) => v !== undefined)
      ) as Partial<typeof data.oido_izquierdo>,
    };
    onSubmit(cleanData);
  };

  return (
    <Form {...form}>
      <div className="space-y-6" onBlur={handleBlur}>
        {/* Oído Derecho */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Oído Derecho (OD)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FREQUENCIES.map((freq) => (
              <FormField
                key={`derecho-${freq.value}`}
                control={form.control}
                name={`oido_derecho.${freq.value}` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{freq.label}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="dB"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                          className={cn(
                            "pr-10",
                            form.formState.errors.oido_derecho?.[freq.value] && "border-red-500"
                          )}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          dB
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            ))}
          </div>
          {form.formState.errors.oido_derecho?.root && (
            <p className="text-sm text-red-500">
              {form.formState.errors.oido_derecho.root.message}
            </p>
          )}
        </div>

        {/* Oído Izquierdo */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Oído Izquierdo (OI)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FREQUENCIES.map((freq) => (
              <FormField
                key={`izquierdo-${freq.value}`}
                control={form.control}
                name={`oido_izquierdo.${freq.value}` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{freq.label}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="dB"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                          className={cn(
                            "pr-10",
                            form.formState.errors.oido_izquierdo?.[freq.value] && "border-red-500"
                          )}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          dB
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            ))}
          </div>
          {form.formState.errors.oido_izquierdo?.root && (
            <p className="text-sm text-red-500">
              {form.formState.errors.oido_izquierdo.root.message}
            </p>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          * Se requieren al menos 4 frecuencias completadas por oído
        </p>
      </div>
    </Form>
  );
}
