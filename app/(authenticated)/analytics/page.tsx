"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Activity, Clock, FileText, CalendarDays } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsData {
  totalStudies: number
  avgTurnaroundMinutes: number
  pendingReports: number
  todayAppointments: number
  studiesPerDay: { date: string; count: number }[]
  modalityBreakdown: { modality: string; count: number }[]
  turnaroundPerDay: { date: string; avgMinutes: number }[]
  appointmentsByStatus: { status: string; count: number }[]
}

const MODALITY_COLORS: Record<string, string> = {
  CT: "#3b82f6",
  MR: "#8b5cf6",
  US: "#10b981",
  CR: "#f59e0b",
  XR: "#ef4444",
  NM: "#06b6d4",
  PT: "#ec4899",
  MG: "#84cc16",
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "#3b82f6",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
  IN_PROGRESS: "#f59e0b",
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics")
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Operational insights and performance metrics</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-8 pb-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Failed to load analytics data.</p>
        </div>
      </div>
    )
  }

  const maxStudyCount = Math.max(...data.studiesPerDay.map((d) => d.count), 1)
  const maxTurnaround = Math.max(...data.turnaroundPerDay.map((d) => d.avgMinutes), 1)
  const totalModality = data.modalityBreakdown.reduce((sum, m) => sum + m.count, 0)
  const totalAppointments = data.appointmentsByStatus.reduce((sum, a) => sum + a.count, 0)

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Operational insights and performance metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <Activity className="size-5 text-muted-foreground" />
            <div className="flex items-center gap-1 text-emerald-500 text-xs">
              <TrendingUp className="size-3" />
              +12%
            </div>
          </div>
          <p className="text-2xl font-bold">{data.totalStudies.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Studies</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <Clock className="size-5 text-muted-foreground" />
            <div className="flex items-center gap-1 text-emerald-500 text-xs">
              <TrendingDown className="size-3" />
              -8%
            </div>
          </div>
          <p className="text-2xl font-bold">
            {data.avgTurnaroundMinutes < 60
              ? `${data.avgTurnaroundMinutes}m`
              : `${Math.floor(data.avgTurnaroundMinutes / 60)}h ${data.avgTurnaroundMinutes % 60}m`}
          </p>
          <p className="text-sm text-muted-foreground">Avg Turnaround</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <FileText className="size-5 text-muted-foreground" />
            {data.pendingReports > 5 && (
              <div className="flex items-center gap-1 text-amber-500 text-xs">
                <TrendingUp className="size-3" />
                Needs attention
              </div>
            )}
          </div>
          <p className="text-2xl font-bold">{data.pendingReports}</p>
          <p className="text-sm text-muted-foreground">Reports Pending</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <CalendarDays className="size-5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold">{data.todayAppointments}</p>
          <p className="text-sm text-muted-foreground">Appointments Today</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Studies per Day - Bar Chart */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="font-semibold mb-1">Studies per Day</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 30 days</p>
          <div className="h-48 flex items-end gap-[2px]">
            {data.studiesPerDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                <div className="absolute -top-8 hidden group-hover:block bg-[#0f172a] border border-border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                  {d.date}: {d.count} studies
                </div>
                <div
                  className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors cursor-pointer"
                  style={{ height: `${(d.count / maxStudyCount) * 100}%`, minHeight: d.count > 0 ? "4px" : "1px" }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{data.studiesPerDay[0]?.date.slice(5)}</span>
            <span>{data.studiesPerDay[data.studiesPerDay.length - 1]?.date.slice(5)}</span>
          </div>
        </div>

        {/* Modality Breakdown - Donut-like display */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="font-semibold mb-1">Modality Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution by type</p>
          {totalModality === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No data available</p>
          ) : (
            <>
              <div className="h-4 rounded-full overflow-hidden flex mb-4">
                {data.modalityBreakdown.map((m) => (
                  <div
                    key={m.modality}
                    className="h-full transition-all"
                    style={{
                      width: `${(m.count / totalModality) * 100}%`,
                      backgroundColor: MODALITY_COLORS[m.modality] || "#64748b",
                    }}
                    title={`${m.modality}: ${m.count}`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {data.modalityBreakdown.map((m) => (
                  <div key={m.modality} className="flex items-center gap-2 text-sm">
                    <div
                      className="size-3 rounded-full shrink-0"
                      style={{ backgroundColor: MODALITY_COLORS[m.modality] || "#64748b" }}
                    />
                    <span className="text-muted-foreground">{m.modality}</span>
                    <span className="font-medium ml-auto">{m.count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((m.count / totalModality) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Report Turnaround Time - Bar Chart */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="font-semibold mb-1">Report Turnaround Time</h3>
          <p className="text-xs text-muted-foreground mb-4">Average minutes per day (last 30 days)</p>
          <div className="h-48 flex items-end gap-[2px]">
            {data.turnaroundPerDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                <div className="absolute -top-8 hidden group-hover:block bg-[#0f172a] border border-border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                  {d.date}: {d.avgMinutes}min
                </div>
                <div
                  className="w-full rounded-t bg-teal-500/70 hover:bg-teal-500 transition-colors cursor-pointer"
                  style={{ height: `${(d.avgMinutes / maxTurnaround) * 100}%`, minHeight: "2px" }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{data.turnaroundPerDay[0]?.date.slice(5)}</span>
            <span>{data.turnaroundPerDay[data.turnaroundPerDay.length - 1]?.date.slice(5)}</span>
          </div>
        </div>

        {/* Appointments by Status - Horizontal Bar Chart */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="font-semibold mb-1">Appointments by Status</h3>
          <p className="text-xs text-muted-foreground mb-4">Current distribution</p>
          {totalAppointments === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No data available</p>
          ) : (
            <div className="space-y-4 mt-6">
              {data.appointmentsByStatus.map((a) => (
                <div key={a.status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {a.status.toLowerCase().replace("_", " ")}
                    </span>
                    <span className="font-medium">{a.count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(a.count / totalAppointments) * 100}%`,
                        backgroundColor: STATUS_COLORS[a.status] || "#64748b",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
