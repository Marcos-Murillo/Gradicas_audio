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
import { examinadorSchema } from "@/lib/validation-schemas";
import type { Examinador } from "@/types/evaluation";

/**
 * Props para el componente ExaminerForm
 */
export interface ExaminerFormProps {
  onSubmit: (data: Examinador) => void;
  initialData?: Examinador;
}

/**
 * Componente ExaminerForm
 * 
 * Captura los datos del examinador con validación en tiempo real.
 * Utiliza React Hook Form + Zod para validación.
 * 
 * Valida: Requirements 6.1-6.6
 */
export function ExaminerForm({ onSubmit, initialData }: ExaminerFormProps) {
  const form = useForm<Examinador>({
    // @ts-ignore - Type compatibility issue between zod versions
    resolver: zodResolver(examinadorSchema),
    defaultValues: initialData || {
      nombre: "",
      codigo: "",
    },
  });

  // Submit on change
  const handleChange = React.useCallback(() => {
    const values = form.getValues();
    const result = examinadorSchema.safeParse(values);
    if (result.success) {
      onSubmit(result.data);
    }
  }, [form, onSubmit]);

  return (
    <Form {...form}>
      <div className="space-y-6" onChange={handleChange}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo Nombre */}
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Examinador *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese nombre completo"
                    {...field}
                    className={cn(
                      form.formState.errors.nombre && "border-red-500"
                    )}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Campo Código */}
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Profesional *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="6 dígitos"
                    maxLength={6}
                    {...field}
                    className={cn(
                      form.formState.errors.codigo && "border-red-500"
                    )}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  );
}
