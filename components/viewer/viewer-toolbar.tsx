"use client"

import { useState } from "react"
import {
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Ruler,
  Minus,
  Circle,
  ArrowUpRight,
  Type,
  Crosshair,
  Grid2x2,
  Layers,
  Box,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface ToolButtonProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  disabled?: boolean
}

function ToolButton({ icon, label, active, onClick, disabled }: ToolButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${active ? "bg-primary/20 text-primary border border-primary/50" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            onClick={onClick}
            disabled={disabled}
          />
        }>
          {icon}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ToolDivider() {
  return <div className="w-px h-6 bg-border mx-1" />
}

const windowPresets = [
  { name: "Soft Tissue", ww: 400, wl: 40 },
  { name: "Lung", ww: 1500, wl: -600 },
  { name: "Bone", ww: 2500, wl: 480 },
  { name: "Brain", ww: 80, wl: 40 },
  { name: "Abdomen", ww: 350, wl: 50 },
  { name: "Custom", ww: 0, wl: 0 },
]

const layoutOptions = [
  { name: "1×1", cols: 1, rows: 1 },
  { name: "1×2", cols: 2, rows: 1 },
  { name: "2×2", cols: 2, rows: 2 },
  { name: "2×3", cols: 3, rows: 2 },
]

const hangingProtocols = [
  "Default",
  "CT Chest",
  "MRI Brain",
  "Comparison",
  "Mammography",
]

export function ViewerToolbar() {
  const [activeTool, setActiveTool] = useState("pan")
  const [activeLayout, setActiveLayout] = useState("1×1")

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 bg-slate-900/80 border-b border-border overflow-x-auto">
      {/* Navigation Tools */}
      <ToolButton
        icon={<ZoomIn className="size-4" />}
        label="Zoom In"
        active={activeTool === "zoomIn"}
        onClick={() => setActiveTool("zoomIn")}
      />
      <ToolButton
        icon={<ZoomOut className="size-4" />}
        label="Zoom Out"
        active={activeTool === "zoomOut"}
        onClick={() => setActiveTool("zoomOut")}
      />
      <ToolButton
        icon={<Move className="size-4" />}
        label="Pan"
        active={activeTool === "pan"}
        onClick={() => setActiveTool("pan")}
      />
      <ToolButton
        icon={<RotateCcw className="size-4" />}
        label="Reset View"
        onClick={() => setActiveTool("pan")}
      />

      <ToolDivider />

      {/* Window/Level Presets */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground" />
        }>
          W/L
          <ChevronDown className="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Window/Level Presets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {windowPresets.map((preset) => (
              <DropdownMenuItem key={preset.name}>
                <span>{preset.name}</span>
                {preset.ww > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    W:{preset.ww} L:{preset.wl}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolDivider />

      {/* Measurement Tools */}
      <ToolButton
        icon={<Ruler className="size-4" />}
        label="Length Measurement"
        active={activeTool === "length"}
        onClick={() => setActiveTool("length")}
      />
      <ToolButton
        icon={<Minus className="size-4 rotate-45" />}
        label="Angle Measurement"
        active={activeTool === "angle"}
        onClick={() => setActiveTool("angle")}
      />
      <ToolButton
        icon={<Circle className="size-4" />}
        label="Ellipse ROI"
        active={activeTool === "ellipse"}
        onClick={() => setActiveTool("ellipse")}
      />

      <ToolDivider />

      {/* Annotation Tools */}
      <ToolButton
        icon={<ArrowUpRight className="size-4" />}
        label="Arrow Annotation"
        active={activeTool === "arrow"}
        onClick={() => setActiveTool("arrow")}
      />
      <ToolButton
        icon={<Type className="size-4" />}
        label="Text Annotation"
        active={activeTool === "text"}
        onClick={() => setActiveTool("text")}
      />
      <ToolButton
        icon={<Crosshair className="size-4" />}
        label="Marker"
        active={activeTool === "marker"}
        onClick={() => setActiveTool("marker")}
      />

      <ToolDivider />

      {/* Layout Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground" />
        }>
          <Grid2x2 className="size-4" />
          {activeLayout}
          <ChevronDown className="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Viewport Layout</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {layoutOptions.map((layout) => (
              <DropdownMenuItem
                key={layout.name}
                onClick={() => setActiveLayout(layout.name)}
              >
                <Grid2x2 className="size-4 mr-2" />
                {layout.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolDivider />

      {/* Advanced Tools */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground" />
        }>
          <Layers className="size-4" />
          MPR
          <ChevronDown className="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Multi-Planar Reconstruction</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Axial</DropdownMenuItem>
            <DropdownMenuItem>Sagittal</DropdownMenuItem>
            <DropdownMenuItem>Coronal</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolButton
        icon={<Box className="size-4" />}
        label="3D Volume Rendering"
        disabled
      />

      {/* Hanging Protocols */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground" />
        }>
          <MoreHorizontal className="size-4" />
          Protocols
          <ChevronDown className="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Hanging Protocols</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hangingProtocols.map((protocol) => (
              <DropdownMenuItem key={protocol}>{protocol}</DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
