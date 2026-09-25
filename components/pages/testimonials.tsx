"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit2, Trash2, Search, Download } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TestimonialItem {
  id: string
  name: string
  position: string | null
  company: string | null
  course: string | null
  review: string
  rating: number
  avatarUrl: string | null
  verified: boolean
  sortOrder: number
  status: string
}

const emptyForm = {
  name: "",
  position: "",
  company: "",
  course: "",
  review: "",
  rating: 5,
  avatarUrl: "",
  verified: true,
  sortOrder: 0,
  status: "Active",
}

export default function Testimonials() {
  const [items, setItems] = useState<TestimonialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TestimonialItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TestimonialItem | null>(null)
  const [seeding, setSeeding] = useState(false)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ limit: "1000" })
      if (statusFilter !== "All") params.set("status", statusFilter)
      if (searchTerm) params.set("search", searchTerm)
      let res = await fetch(`/api/admin/testimonials?${params}`)
      let result = await res.json()
      let data = result.success ? result.data || [] : []

      // Only auto-seed when browsing all statuses with an empty DB
      if (data.length === 0 && statusFilter === "All" && !searchTerm) {
        const seedRes = await fetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "seed" }),
        })
        const seedResult = await seedRes.json()
        if (seedResult.success && Array.isArray(seedResult.data)) {
          data = seedResult.data
        } else {
          res = await fetch(`/api/admin/testimonials?${params}`)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const filtered = useMemo(() => {
    if (!searchTerm) return items
    const q = searchTerm.toLowerCase()
    return items.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.course || "").toLowerCase().includes(q) ||
        t.review.toLowerCase().includes(q) ||
        (t.position || "").toLowerCase().includes(q)
    )
  }, [items, searchTerm])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, sortOrder: (items[0]?.sortOrder || 0) + 1 })
    setDialogOpen(true)
  }

  const openEdit = (item: TestimonialItem) => {
    setEditing(item)
    setForm({
      name: item.name,
      position: item.position || "",
      company: item.company || "",
      course: item.course || "",
      review: item.review,
      rating: item.rating,
      avatarUrl: item.avatarUrl || "",
      verified: item.verified,
      sortOrder: item.sortOrder,
      status: item.status,
    })
    setDialogOpen(true)
  }

  const handleAvatar = (file: File | null) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setForm((p) => ({ ...p, avatarUrl: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.review.trim()) {
      alert("Name and review are required")
      return
    }
    try {
      setSaving(true)
      const payload = {
        ...form,
        avatarUrl: form.avatarUrl || null,
        position: form.position || null,
        company: form.company || null,
        course: form.course || null,
      }
      const res = await fetch("/api/admin/testimonials", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
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
      const res = await fetch(`/api/admin/testimonials?id=${deleteTarget.id}`, { method: "DELETE" })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || "Delete failed")
      setDeleteTarget(null)
      await fetchItems()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  const handleSeed = async () => {
    if (!confirm("Import the current homepage testimonials into the database? (Only if empty)")) return
    try {
      setSeeding(true)
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      })
      const result = await res.json()
      alert(result.message || "Done")
      await fetchItems()
    } catch {
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
          <h1 className="text-4xl font-bold theme-text mb-2">Testimonials</h1>
          <p className="theme-muted">Manage student feedback shown on the homepage</p>
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
            Add New Testimonial
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search testimonials..."
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg theme-text"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-input border border-border rounded-lg theme-text"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="theme-card rounded-xl overflow-hidden shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Delegate</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Course</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Feedback Excerpt</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold theme-text">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center theme-muted">
                  No testimonials yet. Homepage still shows built-in defaults until you add or import items.
                </td>
              </tr>
            ) : (
              filtered.map((testimonial) => (
                <tr key={testimonial.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="theme-text font-medium">{testimonial.name}</p>
                      <p className="text-xs theme-muted">{testimonial.position || "—"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 theme-text">{testimonial.course || "—"}</td>
                  <td className="px-6 py-4 theme-muted max-w-xs truncate">{testimonial.review}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        testimonial.status === "Active"
                          ? "bg-green-500/20 text-green-500"
                          : testimonial.status === "Pending"
                            ? "bg-yellow-500/20 text-yellow-600"
                            : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {testimonial.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => openEdit(testimonial)}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors theme-primary"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(testimonial)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-sm theme-muted mb-1 block">Name *</label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm theme-muted mb-1 block">Position</label>
                <Input value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm theme-muted mb-1 block">Company</label>
                <Input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm theme-muted mb-1 block">Course</label>
              <Input value={form.course} onChange={(e) => setForm((p) => ({ ...p, course: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm theme-muted mb-1 block">Review *</label>
              <textarea
                value={form.review}
                onChange={(e) => setForm((p) => ({ ...p, review: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg theme-text"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm theme-muted mb-1 block">Rating</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) || 5 }))}
                />
              </div>
              <div>
                <label className="text-sm theme-muted mb-1 block">Sort</label>
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
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm theme-muted mb-1 block">Avatar (optional)</label>
              <Input type="file" accept="image/*" onChange={(e) => handleAvatar(e.target.files?.[0] || null)} />
            </div>
            <label className="flex items-center gap-2 text-sm theme-text">
              <input
                type="checkbox"
                checked={form.verified}
                onChange={(e) => setForm((p) => ({ ...p, verified: e.target.checked }))}
              />
              Verified
            </label>
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
            <AlertDialogTitle>Delete testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the review from &quot;{deleteTarget?.name}&quot;.
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
