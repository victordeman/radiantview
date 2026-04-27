"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Send, CheckCircle, Eye, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { reportTemplates } from "@/lib/report-templates"
import Link from "next/link"

interface ReportComment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string | null
    email: string | null
  }
}

interface ReportData {
  id: string
  status: string
  templateName: string | null
  findings: string | null
  impression: string | null
  recommendation: string | null
  signedAt: string | null
  createdAt: string
  updatedAt: string
  study: {
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
  author: {
    id: string
    name: string | null
    email: string | null
  }
  comments: ReportComment[]
}

export default function ReportEditorPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string

  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [findings, setFindings] = useState("")
  const [impression, setImpression] = useState("")
  const [recommendation, setRecommendation] = useState("")
  const [templateName, setTemplateName] = useState("")
  const [signDialogOpen, setSignDialogOpen] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}`)
      if (res.ok) {
        const data = await res.json()
        setReport(data)
        setFindings(data.findings || "")
        setImpression(data.impression || "")
        setRecommendation(data.recommendation || "")
        setTemplateName(data.templateName || "")
      }
    } catch (error) {
      console.error("Failed to fetch report:", error)
    } finally {
      setLoading(false)
    }
  }, [reportId])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const handleSave = async (newStatus?: string) => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        findings,
        impression,
        recommendation,
        templateName: templateName || null,
      }
      if (newStatus) body.status = newStatus
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const updated = await res.json()
        setReport((prev) => prev ? { ...prev, ...updated, comments: prev.comments } : prev)
        if (newStatus === "FINAL") setSignDialogOpen(false)
      }
    } catch (error) {
      console.error("Failed to save report:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      })
      if (res.ok) {
        const comment = await res.json()
        setNewComment("")
        setReport((prev) => prev ? { ...prev, comments: [...prev.comments, comment] } : prev)
      }
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleTemplateChange = (name: string) => {
    setTemplateName(name)
    const template = reportTemplates.find((t) => t.name === name)
    if (template) {
      setFindings(template.sections.find((s) => s.label === "Findings")?.placeholder || "")
      setImpression(template.sections.find((s) => s.label === "Impression")?.placeholder || "")
      setRecommendation(template.sections.find((s) => s.label === "Recommendation")?.placeholder || "")
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

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <p className="text-lg font-medium">Report not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/reports")}>
          Back to Reports
        </Button>
      </div>
    )
  }

  const isFinal = report.status === "FINAL"

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/reports")}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Report Editor</h1>
              {getStatusBadge(report.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              {report.study.patient.name} — {report.study.modality || "N/A"} {report.study.studyDescription || ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="mr-2 size-4" />
            Comments ({report.comments.length})
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Template selector */}
          <div className="p-4 rounded-xl bg-card border border-border">
            <Label className="text-sm font-medium">Template</Label>
            <select
              className="w-full mt-2 h-10 px-3 py-2 rounded-md bg-background border border-border text-sm"
              value={templateName}
              onChange={(e) => handleTemplateChange(e.target.value)}
              disabled={isFinal}
            >
              <option value="">No template</option>
              {reportTemplates.map((t) => (
                <option key={t.name} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Findings */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <Label className="text-sm font-medium">Findings</Label>
            <Textarea
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Describe the findings..."
              className="min-h-[150px] bg-background border-border resize-y"
              disabled={isFinal}
            />
          </div>

          {/* Impression */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <Label className="text-sm font-medium">Impression</Label>
            <Textarea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="Summarize the impression..."
              className="min-h-[100px] bg-background border-border resize-y"
              disabled={isFinal}
            />
          </div>

          {/* Recommendation */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <Label className="text-sm font-medium">Recommendation</Label>
            <Textarea
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Provide recommendations..."
              className="min-h-[80px] bg-background border-border resize-y"
              disabled={isFinal}
            />
          </div>

          {/* Action bar */}
          {!isFinal && (
            <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-card border border-border">
              <Button variant="outline" onClick={() => handleSave()} disabled={saving}>
                <Save className="mr-2 size-4" />
                {saving ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                variant="outline"
                className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                onClick={() => handleSave("PRELIMINARY")}
                disabled={saving}
              >
                <Send className="mr-2 size-4" />
                Submit as Preliminary
              </Button>
              <Dialog open={signDialogOpen} onOpenChange={setSignDialogOpen}>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setSignDialogOpen(true)}
                  disabled={saving}
                >
                  <CheckCircle className="mr-2 size-4" />
                  Sign Report
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sign Report</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground py-4">
                    This will finalize the report and mark it as signed. This action cannot be undone. Are you sure?
                  </p>
                  <div className="flex gap-2">
                    <DialogClose render={<Button variant="outline" className="flex-1" />}>Cancel</DialogClose>
                    <Button
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleSave("FINAL")}
                      disabled={saving}
                    >
                      {saving ? "Signing..." : "Confirm & Sign"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {isFinal && report.signedAt && (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-sm">
              Signed on {new Date(report.signedAt).toLocaleString()} by {report.author.name || "Unknown"}
            </div>
          )}
        </div>

        {/* Right: Study info + Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Study info panel */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-4">
            <h3 className="font-semibold">Study Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-medium">{report.study.patient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient ID</span>
                <span className="font-mono text-xs">{report.study.patient.patientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modality</span>
                <Badge variant="outline" className="font-mono">{report.study.modality || "N/A"}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Study Date</span>
                <span>{report.study.studyDate ? new Date(report.study.studyDate).toLocaleDateString() : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Description</span>
                <span className="text-right max-w-[60%]">{report.study.studyDescription || "N/A"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Author</span>
                <span>{report.author.name || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <Link href={`/viewer/${encodeURIComponent(report.study.studyInstanceUid)}?patientName=${encodeURIComponent(report.study.patient.name)}&patientId=${encodeURIComponent(report.study.patient.patientId)}`}>
              <Button variant="outline" className="w-full mt-2">
                <Eye className="mr-2 size-4" />
                Open in Viewer
              </Button>
            </Link>
          </div>

          {/* Measurements placeholder */}
          <div className="p-4 rounded-xl bg-card border border-border space-y-2">
            <h3 className="font-semibold">Measurements</h3>
            <p className="text-sm text-muted-foreground">Auto-populated measurements from OHIF will appear here in the future.</p>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="p-4 rounded-xl bg-card border border-border space-y-4">
              <h3 className="font-semibold">Comments</h3>
              {report.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {report.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {getInitials(comment.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.author.name || "Unknown"}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Separator />
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[60px] bg-background border-border resize-none flex-1"
                />
                <Button
                  size="sm"
                  className="self-end bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleAddComment}
                  disabled={submittingComment || !newComment.trim()}
                >
                  {submittingComment ? "..." : "Post"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
