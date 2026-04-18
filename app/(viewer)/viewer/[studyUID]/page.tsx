"use client"

import { useParams, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ViewerToolbar } from "@/components/viewer/viewer-toolbar"
import { PatientHeaderBar } from "@/components/viewer/patient-header-bar"
import { ViewerPlaceholder } from "@/components/viewer/viewer-placeholder"
import Link from "next/link"

export default function ViewerStudyPage() {
  const params = useParams()
  const searchParams = useSearchParams()

  const studyUID = params.studyUID as string
  const patientName = searchParams.get("patientName") || undefined
  const patientId = searchParams.get("patientId") || undefined
  const modality = searchParams.get("modality") || undefined
  const studyDate = searchParams.get("date") || undefined
  const studyDescription = searchParams.get("description") || undefined
  const accessionNumber = searchParams.get("accession") || undefined
  const dob = searchParams.get("dob") || undefined
  const gender = searchParams.get("gender") || undefined

  const ohifUrl = process.env.NEXT_PUBLIC_OHIF_URL

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border-b border-border shrink-0">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to Worklist</span>
          </Button>
        </Link>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">
            {patientName || "DICOM Viewer"}
          </span>
          {modality && (
            <span className="text-xs text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">
              {modality}
            </span>
          )}
        </div>
        <div className="ml-auto text-xs text-muted-foreground hidden lg:block font-mono truncate max-w-96">
          {studyUID}
        </div>
      </div>

      {/* Viewer Toolbar */}
      <ViewerToolbar />

      {/* Patient Header Bar */}
      <PatientHeaderBar
        patientName={patientName}
        patientId={patientId}
        dob={dob}
        gender={gender}
        modality={modality}
        studyDate={studyDate}
        studyDescription={studyDescription}
        accessionNumber={accessionNumber}
      />

      {/* Viewer Area */}
      <div className="flex-1 flex overflow-hidden">
        {ohifUrl ? (
          <iframe
            src={`${ohifUrl}/viewer?StudyInstanceUIDs=${encodeURIComponent(studyUID)}`}
            className="flex-1 border-0"
            title="OHIF DICOM Viewer"
            allow="fullscreen"
          />
        ) : (
          <ViewerPlaceholder
            patientName={patientName}
            patientId={patientId}
            modality={modality}
            studyDate={studyDate}
            studyDescription={studyDescription}
            studyInstanceUid={studyUID}
          />
        )}
      </div>
    </div>
  )
}
