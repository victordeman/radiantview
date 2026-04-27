"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, FileText, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { reportTemplates } from "@/lib/report-templates"

interface ReportStudy {
  id: string
  studyInstanceUid: string
  modality: string | null
  studyDate: string | null
  studyDescription: string | null
  patient: {
    id: string
    name: string
    patientId: string
  }
}

interface ReportAuthor {
  id: string
  name: string | null
  email: string | null
}

interface Report {
  id: string
  status: string
  templateName: string | null
  findings: string | null
  impression: string | null
  signedAt: string | null
  createdAt: string
  study: ReportStudy
  author: ReportAuthor
}

interface StudyOption {
  id: string
  studyInstanceUid: string
  modality: string | null
  studyDate: string | null
  studyDescription: string | null
  patientName: string
  patientId: string
}

const statusTabs = ["ALL", "DRAFT", "PRELIMINARY", "FINAL", "AMENDED"]

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [studies, setStudies] = useState<StudyOption[]>([])
  const [studySearch, setStudySearch] = useState("")
  const [selectedStudyId, setSelectedStudyId] = useState("")
  const [selectedStudyUid, setSelectedStudyUid] = useState("")
  const [selectedStudyLabel, setSelectedStudyLabel] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchReports = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      if (searchQuery) params.set("search", searchQuery)
      const res = await fetch(`/api/reports?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setReports(data)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchReports])

  useEffect(() => {
    if (!studySearch) {
      setStudies([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/studies?search=${encodeURIComponent(studySearch)}`)
        if (res.ok) {
          const data = await res.json()
          setStudies(data)
        }
      } catch {
        // ignore
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [studySearch])

  const handleCreateReport = async () => {
    setFormError(null)
    if (!selectedStudyId) {
      setFormError("Please select a study.")
      return
    }
    setSubmitting(true)
    try {
      const template = reportTemplates.find((t) => t.name === selectedTemplate)
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studyId: selectedStudyId,
          studyInstanceUid: selectedStudyUid || undefined,
          templateName: selectedTemplate || null,
          findings: template?.sections.find((s) => s.label === "Findings")?.placeholder || "",
          impression: template?.sections.find((s) => s.label === "Impression")?.placeholder || "",
          recommendation: template?.sections.find((s) => s.label === "Recommendation")?.placeholder || "",
        }),
      })
      if (res.ok) {
        const report = await res.json()
        setDialogOpen(false)
        setSelectedStudyId("")
        setSelectedStudyUid("")
        setSelectedStudyLabel("")
        setStudySearch("")
        setSelectedTemplate("")
        router.push(`/reports/${report.id}`)
      } else {
        setFormError("Failed to create report.")
      }
    } catch {
      setFormError("Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">Draft</Badge>
      case "PRELIMINARY":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Preliminary</Badge>
      case "FINAL":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Final</Badge>
      case "AMENDED":
        return <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20">Amended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Create and manage diagnostic reports</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="bg-primary text-primary-foreground hover:bg-primary/90" />}>
            <Plus className="mr-2 size-4" />
            Create Report
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {formError && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <Label>Study</Label>
                {selectedStudyLabel ? (
                  <div className="flex items-center justify-between p-3 rounded-md bg-primary/5 border border-primary/20">
                    <span className="text-sm">{selectedStudyLabel}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedStudyId("")
                        setSelectedStudyUid("")
                        setSelectedStudyLabel("")
                        setStudySearch("")
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      placeholder="Search by patient name or description..."
                      value={studySearch}
                      onChange={(e) => setStudySearch(e.target.value)}
                      className="bg-background border-border"
                    />
                    {studies.length > 0 && (
                      <div className="border border-border rounded-md max-h-40 overflow-y-auto bg-card">
                        {studies.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setSelectedStudyId(s.id)
                              setSelectedStudyUid(s.studyInstanceUid)
                              setSelectedStudyLabel(
                                `${s.patientName} \u2014 ${s.modality || "N/A"} ${s.studyDescription || ""}`
                              )
                              setStudies([])
                              setStudySearch("")
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                          >
                            <div className="font-medium">{s.patientName}</div>
                            <div className="text-xs text-muted-foreground">
                              {s.modality || "N/A"} \u2014 {s.studyDescription || "No description"} \u2014{" "}
                              {s.studyDate ? new Date(s.studyDate).toLocaleDateString() : "N/A"}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md bg-background border border-border text-sm"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="">No template</option>
                  {reportTemplates.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <DialogClose render={<Button variant="outline" className="flex-1" />}>Cancel</DialogClose>
                <Button
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleCreateReport}
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create Report"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between bg-card/50 p-4 rounded-xl border border-border/50">
        <div className="flex flex-1 items-center gap-2 w-full md:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by patient or study..."
              className="w-full pl-9 bg-background border-border/50 focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 border-border/50">
            <Filter className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
          {statusTabs.map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              size="sm"
              className={tab === statusFilter ? "bg-primary/10 text-primary" : "text-muted-foreground"}
              onClick={() => setStatusFilter(tab)}
            >
              {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Study</TableHead>
                <TableHead>Modality</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="size-8 opacity-50" />
                      <p>No reports found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow
                    key={report.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/reports/${report.id}`)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{report.study.patient.name}</span>
                        <span className="text-xs text-muted-foreground">{report.study.patient.patientId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {report.study.studyDescription || "No description"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {report.study.modality || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.templateName || "\u2014"}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.author.name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
