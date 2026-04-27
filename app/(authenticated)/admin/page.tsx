"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  ShieldCheck,
  Users,
  Settings,
  ClipboardList,
  Plus,
  Trash2,
  Server,
  Database,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
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
  DialogClose,
} from "@/components/ui/dialog"

interface UserRecord {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: string
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"users" | "system" | "audit">("users")
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLINICIAN",
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [orthancStatus, setOrthancStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "disconnected">("checking")
  const [dbCounts, setDbCounts] = useState({ users: 0, patients: 0, studies: 0, reports: 0 })

  const userRole = (session?.user as { role?: string })?.role

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (activeTab === "system") {
      // Test Orthanc connection
      setOrthancStatus("checking")
      fetch("/api/orthanc/dicom-web/studies")
        .then((res) => {
          setOrthancStatus(res.ok ? "connected" : "disconnected")
        })
        .catch(() => setOrthancStatus("disconnected"))

      // Test DB connection via analytics endpoint
      setDbStatus("checking")
      fetch("/api/analytics")
        .then((res) => {
          if (res.ok) {
            setDbStatus("connected")
            return res.json()
          }
          setDbStatus("disconnected")
          return null
        })
        .then((data) => {
          if (data) {
            setDbCounts({
              users: users.length,
              patients: 0,
              studies: data.totalStudies || 0,
              reports: data.pendingReports || 0, // pending only
            })
          }
        })
        .catch(() => setDbStatus("disconnected"))
    }
  }, [activeTab, users.length])

  const handleAddUser = async () => {
    setFormError(null)
    if (!formData.name || !formData.email || !formData.password) {
      setFormError("All fields are required.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setAddDialogOpen(false)
        setFormData({ name: "", email: "", password: "", role: "CLINICIAN" })
        fetchUsers()
      } else {
        const data = await res.json()
        setFormError(data.error || "Failed to create user.")
      }
    } catch {
      setFormError("Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      fetchUsers()
    } catch (error) {
      console.error("Failed to update role:", error)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    setFormError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, { method: "DELETE" })
      if (res.ok) {
        setDeleteDialogOpen(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        const data = await res.json()
        setFormError(data.error || "Failed to delete user.")
      }
    } catch {
      setFormError("Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  // Access control - show loading while session loads, deny non-admin users
  if (!userRole) {
    return (
      <div className="flex items-center justify-center py-24">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  if (userRole !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <ShieldCheck className="size-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">Access Denied</p>
        <p className="text-sm mb-4">You need administrator privileges to access this page.</p>
        <a href="/dashboard">
          <Button variant="outline">Go to Dashboard</Button>
        </a>
      </div>
    )
  }

  const tabs = [
    { id: "users" as const, label: "Users", icon: Users },
    { id: "system" as const, label: "System", icon: Settings },
    { id: "audit" as const, label: "Audit Log", icon: ClipboardList },
  ]

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">Manage users, roles, and system configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            className={activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground"}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="mr-2 size-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => { setFormError(null); setAddDialogOpen(true) }}
            >
              <Plus className="mr-2 size-4" />
              Add User
            </Button>
          </div>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{user.name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email || "—"}</TableCell>
                      <TableCell>
                        <select
                          className="h-8 px-2 rounded-md bg-background border border-border text-xs"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={user.id === session?.user?.id}
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="RADIOLOGIST">Radiologist</option>
                          <option value="CLINICIAN">Clinician</option>
                          <option value="TECH">Technologist</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.id !== session?.user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setFormError(null)
                              setSelectedUser(user)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* System Tab */}
      {activeTab === "system" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-3">
              <Server className="size-5 text-muted-foreground" />
              <h3 className="font-semibold">Orthanc DICOM Server</h3>
            </div>
            <div className="flex items-center gap-2">
              {orthancStatus === "checking" ? (
                <div className="size-3 rounded-full bg-amber-500 animate-pulse" />
              ) : orthancStatus === "connected" ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <XCircle className="size-4 text-destructive" />
              )}
              <span className="text-sm capitalize">{orthancStatus}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              URL: {process.env.NEXT_PUBLIC_ORTHANC_URL || "Not configured"}
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-3">
              <Database className="size-5 text-muted-foreground" />
              <h3 className="font-semibold">Database Status</h3>
            </div>
            <div className="flex items-center gap-2">
              {dbStatus === "checking" ? (
                <div className="size-3 rounded-full bg-amber-500 animate-pulse" />
              ) : dbStatus === "connected" ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <XCircle className="size-4 text-destructive" />
              )}
              <span className="text-sm capitalize">{dbStatus}</span>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Users</p>
                <p className="font-medium">{dbCounts.users}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Studies</p>
                <p className="font-medium">{dbCounts.studies}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pending Reports</p>
                <p className="font-medium">{dbCounts.reports}</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border space-y-4 md:col-span-2">
            <h3 className="font-semibold">Environment Info</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">App Version</p>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">Framework</p>
                <p className="font-medium">Next.js 15</p>
              </div>
              <div>
                <p className="text-muted-foreground">Runtime</p>
                <p className="font-medium">Node.js</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === "audit" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <ClipboardList className="size-8 opacity-50" />
                    <p>Audit logging will be implemented in Phase 5.</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {formError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="john@hospital.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                className="w-full h-10 px-3 py-2 rounded-md bg-background border border-border text-sm"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="ADMIN">Admin</option>
                <option value="RADIOLOGIST">Radiologist</option>
                <option value="CLINICIAN">Clinician</option>
                <option value="TECH">Technologist</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <DialogClose render={<Button variant="outline" className="flex-1" />}>Cancel</DialogClose>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleAddUser}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <strong>{selectedUser?.name || selectedUser?.email}</strong>? This action cannot be undone.
          </p>
          {formError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {formError}
            </div>
          )}
          <div className="flex gap-2">
            <DialogClose render={<Button variant="outline" className="flex-1" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteUser}
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
