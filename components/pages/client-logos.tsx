"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit2, Trash2, Search, Image as ImageIcon, Download } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface ClientLogo {
  id: string
  name: string
  logoUrl: string
  sortOrder: number
  status: string
}

const emptyForm = { name: "", logoUrl: "", sortOrder: 0, status: "Active" }

export default function ClientLogos() {
  const [items, setItems] = useState<ClientLogo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ClientLogo | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ClientLogo | null>(null)
  const [seeding, setSeeding] = useState(false)

  const fetchItems = async () => {
    try {
      setLoading(true)
      let res = await fetch("/api/admin/client-logos?limit=1000")
      let result = await res.json()
      let data = result.success ? result.data || [] : []

      // Auto-import current homepage logos so admin can edit/delete them immediately
      if (data.length === 0) {
        const seedRes = await fetch("/api/admin/client-logos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "seed" }),
        })
        const seedResult = await seedRes.json()
        if (seedResult.success && Array.isArray(seedResult.data)) {
          data = seedResult.data
        } else {
          res = await fetch("/api/admin/client-logos?limit=1000")
          result = await res.json()
          data = result.success ? result.data || [] : []
        }
      }

      setItems(data)
    } catch (e) {
      console.error(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const filtered = useMemo(() => {
    if (!searchTerm) return items
    const q = searchTerm.toLowerCase()
    return items.filter((i) => i.name.toLowerCase().includes(q))
  }, [items, searchTerm])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, sortOrder: (items[items.length - 1]?.sortOrder || 0) + 1 })
    setDialogOpen(true)
  }

  const openEdit = (item: ClientLogo) => {
    setEditing(item)
    setForm({
      name: item.name,
      logoUrl: item.logoUrl,
      sortOrder: item.sortOrder,
      status: item.status,
    })
    setDialogOpen(true)
  }

  const handleImage = (file: File | null) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setForm((p) => ({ ...p, logoUrl: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.logoUrl) {
      alert("Name and logo image are required")
      return
    }
    try {
      setSaving(true)
      const res = await fetch("/api/admin/client-logos", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || "Save failed")
      setDialogOpen(false)
      await fetchItems()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/client-logos?id=${deleteTarget.id}`, { method: "DELETE" })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || "Delete failed")
      setDeleteTarget(null)
      await fetchItems()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  const handleSeed = async () => {
    if (!confirm("Import the current homepage client logos into the database? (Only if the list is empty)")) return
    try {
      setSeeding(true)
      const res = await fetch("/api/admin/client-logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      })
      const result = await res.json()
      alert(result.message || "Done")
      await fetchItems()
    } catch (e) {
      alert("Failed to import defaults")
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 theme-bg flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Client Logos</h1>
          <p className="theme-muted">Manage logos shown in &quot;Our Valued Clients&quot; on the homepage</p>
        </div>
        <div className="flex gap-2">
          {items.length === 0 && (
            <Button variant="outline" onClick={handleSeed} disabled={seeding}>
              <Download size={16} className="mr-2" />
              {seeding ? "Importing…" : "Import Defaults"}
            </Button>
          )}
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Add Logo
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search logos..."
          className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg theme-text"
        />
      </div>

      {items.length === 0 ? (
        <div className="theme-card rounded-xl p-10 text-center space-y-3">
          <p className="theme-muted">No logos in the database yet. The homepage still shows the built-in defaults.</p>
          <p className="text-sm theme-muted">Import defaults or add new logos to manage them from admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="theme-card rounded-xl p-3 border border-border space-y-2">
              <div className="relative h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {item.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.logoUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <ImageIcon className="theme-muted" />
                )}
              </div>
              <p className="text-sm font-medium theme-text truncate" title={item.name}>{item.name}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                <span className="text-[10px] theme-muted">#{item.sortOrder}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-primary/10 rounded theme-primary">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => setDeleteTarget(item)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Client Logo" : "Add Client Logo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm theme-muted mb-1 block">Name</label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm theme-muted mb-1 block">Logo image</label>
              <Input type="file" accept="image/*" onChange={(e) => handleImage(e.target.files?.[0] || null)} />
              {form.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoUrl} alt="Preview" className="mt-2 h-20 object-contain border rounded" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm theme-muted mb-1 block">Sort order</label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="text-sm theme-muted mb-1 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete logo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{deleteTarget?.name}&quot; from the homepage carousel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
