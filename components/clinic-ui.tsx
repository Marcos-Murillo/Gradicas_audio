import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export const COLOR_OD = "#d11c1c"
export const COLOR_OI = "#1452d1"

export function SectionBanner({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-[3px] bg-banner px-3 py-1.5 text-sm font-bold uppercase tracking-[1px] text-white",
        className
      )}
    >
      {children}
    </div>
  )
}

export function EarTitle({
  ear,
  children,
  className,
}: {
  ear: "od" | "oi"
  children: ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "text-sm font-extrabold uppercase tracking-[0.4px]",
        ear === "od" ? "text-od" : "text-oi",
        className
      )}
    >
      {children}
    </p>
  )
}

export function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.6px] text-muted-foreground">
      {children}
    </div>
  )
}

export function ControlPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-[10px] border border-border bg-card px-4 py-3.5", className)}>
      {children}
    </div>
  )
}

export function ClinicSheet({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-border bg-card px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {children}
    </div>
  )
}

export function ImpBox({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <div className="flex min-h-40 flex-col rounded-lg border-[1.5px] border-dashed border-[#b9c0cc] p-3.5 dark:border-border">
      <div className="text-[13px] font-extrabold uppercase tracking-[0.6px] text-navy">{title}</div>
      {children ? <div className="mt-2 text-xs text-muted-foreground">{children}</div> : null}
    </div>
  )
}
