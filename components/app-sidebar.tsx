"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { logoutUser } from "@/lib/actions/auth"
import {
  Home,
  ListTodo,
  Users,
  Calendar,
  FileText,
  Monitor,
  BarChart3,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  User
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Worklist",
    url: "/dashboard",
    icon: ListTodo,
  },
  {
    title: "Patients",
    url: "/patients",
    icon: Users,
  },
  {
    title: "Schedule",
    url: "/scheduling",
    icon: Calendar,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Viewer",
    url: "/viewer",
    icon: Monitor,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ListTodo,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Admin",
    url: "/admin",
    icon: ShieldCheck,
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="hidden md:flex" data-tour="sidebar">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_15px_rgba(45,212,191,0.3)]">
            <LayoutDashboard className="size-4" />
          </div>
          {state === "expanded" && (
            <span className="font-bold text-xl tracking-tight text-foreground">RadiantView</span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="p-2 gap-1">
          {items.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title} 
                  isActive={isActive}
                  render={<a href={item.url} />}
                >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="User Profile">
              <User className="size-4" />
              <span>Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={() => logoutUser()}
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
