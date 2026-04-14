"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface Study {
  id: string
  patientName: string
  patientId: string
  modality: string
  studyDate: string
  studyDescription: string
  status: string
  instanceCount: number
}

interface StudyTableProps {
  searchQuery: string
  modalityFilter: string
}

export function StudyTable({ searchQuery, modalityFilter }: StudyTableProps) {
  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudies() {
      try {
        const response = await fetch("/api/studies")
        if (response.ok) {
          const data = await response.json()
          setStudies(data)
        }
      } catch (error) {
        console.error("Failed to fetch studies:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudies()
  }, [])

  const filteredStudies = studies.filter((study) => {
    const matchesSearch = 
      study.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.studyDescription.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesModality = 
      modalityFilter === "All Modalities" || 
      study.modality.includes(modalityFilter)

    return matchesSearch && matchesModality
  })

  const getStatusBadge = (status: string, id: string) => {
    const statuses = ["In Progress", "Completed", "Urgent"]
    const mockStatus = statuses[id.length % 3] 
    
    switch (mockStatus) {
      case "Urgent":
        return <Badge variant="destructive">Urgent</Badge>
      case "Completed":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Completed</Badge>
      case "In Progress":
        return <Badge variant="secondary" className="bg-sky-500/10 text-sky-500 border-sky-500/20">In Progress</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (id: string) => {
    const priorities = ["STAT", "High", "Routine"]
    const priority = priorities[id.length % 3]
    
    switch (priority) {
      case "STAT":
        return <span className="text-destructive font-bold text-xs">STAT</span>
      case "High":
        return <span className="text-orange-500 font-semibold text-xs">High</span>
      default:
        return <span className="text-muted-foreground text-xs">Routine</span>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[250px]">Patient</TableHead>
            <TableHead>Modality</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No studies found.
              </TableCell>
            </TableRow>
          ) : (
            filteredStudies.map((study) => (
              <TableRow key={study.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{study.patientName}</span>
                    <span className="text-xs text-muted-foreground">{study.patientId}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">{study.modality}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {study.studyDate ? new Date(study.studyDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  {getStatusBadge(study.status, study.id)}
                </TableCell>
                <TableCell>
                  {getPriorityBadge(study.id)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/10">
                      <Eye className="size-4" />
                      <span>View Images</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open menu</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Metadata</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete Study</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
