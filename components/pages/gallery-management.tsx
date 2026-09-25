"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit2, Trash2, Search, Image as ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface GalleryImage {
  id: string
  name: string
  imageUrl: string
  sortOrder: number
  status: string
}

const emptyForm = { name: "", imageUrl: "", sortOrder: 0, status: "Active" }

export default function GalleryManagement() {
  const [items, setItems] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<GalleryImage | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/gallery?limit=1000")
      const result = await res.json()
      setItems(result.success ? result.data || [] : [])
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

  const openEdit = (item: GalleryImage) => {
    setEditing(item)
    setForm({
      name: item.name,
      imageUrl: item.imageUrl,
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
    reader.onloadend = () => setForm((p) => ({ ...p, imageUrl: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.imageUrl) {
      alert("Name and image are required")
      return
    }
    try {
      setSaving(true)
      const res = await fetch("/api/admin/gallery", {
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
      const res = await fetch(`/api/admin/gallery?id=${deleteTarget.id}`, { method: "DELETE" })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || "Delete failed")
      setDeleteTarget(null)
      await fetchItems()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete")
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
          <h1 className="text-4xl font-bold theme-text mb-2">Gallery</h1>
          <p className="theme-muted">Manage images shown on the public Gallery page</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Add Image
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search gallery images..."
          className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg theme-text"
        />
      </div>

      {items.length === 0 ? (
        <div className="theme-card rounded-xl p-10 text-center space-y-3">
          <ImageIcon className="mx-auto theme-muted" size={40} />
          <p className="theme-muted">No gallery images yet.</p>
          <p className="text-sm theme-muted">Add images here to show them on the public Gallery page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="theme-card rounded-xl p-3 border border-border space-y-2">
              <div className="relative h-28 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="theme-muted" />
                )}
              </div>
              <p className="text-sm font-medium theme-text truncate" title={item.name}>
                {item.name}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">
                  {item.status}
                </Badge>
                <span className="text-[10px] theme-muted">#{item.sortOrder}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 hover:bg-primary/10 rounded theme-primary"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="p-1.5 hover:bg-destructive/10 rounded text-destructive"
                >
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
            <DialogTitle>{editing ? "Edit Gallery Image" : "Add Gallery Image"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm theme-muted mb-1 block">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Image name"
              />
            </div>
            <div>
              <label className="text-sm theme-muted mb-1 block">Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImage(e.target.files?.[0] || null)}
              />
              {form.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="mt-2 h-32 w-full object-cover border rounded"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm theme-muted mb-1 block">Sort order</label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))
                  }
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete gallery image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{deleteTarget?.name}&quot; from the public Gallery page.
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
