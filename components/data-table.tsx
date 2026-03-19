"use client"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableIcon } from "lucide-react"
import { useRef, KeyboardEvent, ClipboardEvent } from "react"

interface DataTableProps {
  columnA: string
  columnB: string
  rows: { a: number; b: number }[]
  onCellChange: (rowIndex: number, field: "a" | "b", value: number) => void
}

export function DataTable({ columnA, columnB, rows, onCellChange }: DataTableProps) {
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  if (rows.length === 0) return null

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, field: "a" | "b") => {
    const currentKey = `${rowIndex}-${field}`
    
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault()
      const nextKey = `${rowIndex + 1}-${field}`
      inputRefs.current[nextKey]?.focus()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const prevKey = `${rowIndex - 1}-${field}`
      inputRefs.current[prevKey]?.focus()
    } else if (e.key === "ArrowRight" || e.key === "Tab") {
      if (field === "a" && !e.shiftKey) {
        e.preventDefault()
        const nextKey = `${rowIndex}-b`
        inputRefs.current[nextKey]?.focus()
      }
    } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
      if (field === "b") {
        e.preventDefault()
        const prevKey = `${rowIndex}-a`
        inputRefs.current[prevKey]?.focus()
      }
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>, startRow: number, startField: "a" | "b") => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")
    const rows_data = pastedData.split("\n").filter(row => row.trim())
    
    rows_data.forEach((row, rowOffset) => {
      const cells = row.split("\t")
      const targetRow = startRow + rowOffset
      
      if (targetRow < rows.length) {
        if (startField === "a" && cells[0]) {
          const val = parseFloat(cells[0].trim())
          if (!isNaN(val)) onCellChange(targetRow, "a", val)
        }
        if (cells.length > 1 && cells[1]) {
          const val = parseFloat(cells[1].trim())
          if (!isNaN(val)) onCellChange(targetRow, "b", val)
        } else if (startField === "b" && cells[0]) {
          const val = parseFloat(cells[0].trim())
          if (!isNaN(val)) onCellChange(targetRow, "b", val)
        }
      }
    })
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <TableIcon className="h-5 w-5 text-green-500" />
          Tabla de Datos
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {rows.length} {rows.length === 1 ? "fila" : "filas"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {columnA || "Columna A"}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                  {columnB || "Columna B"}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-2 text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      ref={(el) => { inputRefs.current[`${index}-a`] = el }}
                      type="text"
                      inputMode="decimal"
                      placeholder=""
                      value={row.a === 0 ? "" : row.a}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        onCellChange(index, "a", isNaN(val) ? 0 : val)
                      }}
                      onKeyDown={(e) => handleKeyDown(e, index, "a")}
                      onPaste={(e) => handlePaste(e, index, "a")}
                      className="h-8 w-full max-w-32 bg-background text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label={`${columnA || "Columna A"} fila ${index + 1}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      ref={(el) => { inputRefs.current[`${index}-b`] = el }}
                      type="text"
                      inputMode="decimal"
                      placeholder=""
                      value={row.b === 0 ? "" : row.b}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        onCellChange(index, "b", isNaN(val) ? 0 : val)
                      }}
                      onKeyDown={(e) => handleKeyDown(e, index, "b")}
                      onPaste={(e) => handlePaste(e, index, "b")}
                      className="h-8 w-full max-w-32 bg-background text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label={`${columnB || "Columna B"} fila ${index + 1}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
