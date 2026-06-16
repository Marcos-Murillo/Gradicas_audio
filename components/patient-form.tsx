"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { pacienteSchema } from "@/lib/validation-schemas";
import type { Paciente } from "@/types/evaluation";

/**
 * Props para el componente PatientForm
 */
export interface PatientFormProps {
  onSubmit: (data: Paciente) => void;
  initialData?: Paciente;
}

/**
 * Componente PatientForm
 * 
 * Captura los datos demográficos del paciente con validación en tiempo real.
 * Utiliza React Hook Form + Zod para validación.
 * 
 * Valida: Requirements 2.1-2.7, 17.1-17.7
 */
export function PatientForm({ onSubmit, initialData }: PatientFormProps) {
  const form = useForm<Paciente>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: initialData || {
      apellido: "",
      nombre: "",
      fechaNacimiento: undefined,
      sexo: undefined,
    },
  });

  // Submit on change - updates parent state immediately on any field change
  const handleChange = React.useCallback(() => {
    const values = form.getValues();
    const result = pacienteSchema.safeParse(values);
    if (result.success) {
      onSubmit(result.data);
    }
  }, [form, onSubmit]);

  return (
    <Form {...form}>
      <div className="space-y-6" onChange={handleChange}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo Apellido */}
          <FormField
            control={form.control}
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese apellido"
                    {...field}
                    className={cn(
                      form.formState.errors.apellido && "border-red-500"
                    )}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Campo Nombre */}
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese nombre"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo Fecha de Nacimiento */}
          <FormField
            control={form.control}
            name="fechaNacimiento"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Nacimiento *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                          form.formState.errors.fechaNacimiento && "border-red-500"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccione fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => { field.onChange(date); handleChange(); }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Campo Sexo */}
          <FormField
            control={form.control}
            name="sexo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo *</FormLabel>
                <Select onValueChange={(v) => { field.onChange(v); handleChange(); }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        form.formState.errors.sexo && "border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Seleccione sexo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  );
}
