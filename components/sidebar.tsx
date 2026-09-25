"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Database, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    {
      href: "/",
      label: "Inicio",
      icon: Home,
    },
    {
      href: "/saved",
      label: "Guardadas",
      icon: Database,
    },
  ]

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-20 border-r border-border bg-card">
      <div className="flex h-full flex-col items-center py-6">
        <Link
          href="/"
          className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-brand"
        >
          <Activity className="h-6 w-6 text-white" />
        </Link>

        <nav className="flex flex-1 flex-col gap-4">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
