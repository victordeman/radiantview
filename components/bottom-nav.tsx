"use client"

import { Home, ListTodo, Users, Calendar, FileText } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: ListTodo, label: "Worklist", href: "/dashboard#worklist" },
  { icon: Users, label: "Patients", href: "/patients" },
  { icon: Calendar, label: "Schedule", href: "/scheduling" },
  { icon: FileText, label: "Reports", href: "/reports" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border md:hidden flex items-center justify-around px-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="size-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
