"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Monitor, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StudyTable } from "@/components/dashboard/study-table"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [modalityFilter, setModalityFilter] = useState("All Modalities")

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Worklist</h1>
          <p className="text-muted-foreground">Manage and review incoming diagnostic studies.</p>
        </div>

        {/* Quick Action Hubs */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card border-2 border-primary/20 group-hover:border-primary group-hover:bg-primary/10 text-primary transition-all duration-300 shadow-[0_0_15px_rgba(45,212,191,0.1)] group-hover:shadow-[0_0_25px_rgba(45,212,191,0.2)]">
              <Plus className="size-7" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase opacity-80 group-hover:opacity-100 transition-opacity">New Order</span>
          </Link>
          
          <Link href="/viewer" className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card border-2 border-primary/20 group-hover:border-primary group-hover:bg-primary/10 text-primary transition-all duration-300 shadow-[0_0_15px_rgba(45,212,191,0.1)] group-hover:shadow-[0_0_25px_rgba(45,212,191,0.2)]">
              <Monitor className="size-7" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase opacity-80 group-hover:opacity-100 transition-opacity">Viewer</span>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between bg-card/50 p-4 rounded-xl border border-border/50">
        <div className="flex flex-1 items-center gap-2 w-full md:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by Patient Name, ID, or Accession..."
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
          {["All Modalities", "CR", "CT", "MR", "US"].map((m) => (
            <Button 
              key={m} 
              variant="ghost" 
              size="sm" 
              className={m === modalityFilter ? "bg-primary/10 text-primary" : "text-muted-foreground"}
              onClick={() => setModalityFilter(m)}
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Worklist Table */}
      <StudyTable searchQuery={searchQuery} modalityFilter={modalityFilter} />
    </div>
  );
}
