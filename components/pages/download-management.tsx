"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
} from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { slugifyDownloadCategory } from "@/lib/download-slug"

interface DownloadCategory {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  status: string
  _count?: { items: number }
}

interface DownloadItem {
  id: string
  categoryId: string
  name: string
  description: string | null
  imageUrl: string | null
  fileUrl: string
  fileName: string | null
  fileSize: string | null
  sortOrder: number
  status: string
  category?: { id: string; name: string; slug: string }
}

const emptyCategory = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  sortOrder: 0,
  status: "Active",
}

const emptyItem = {
  categoryId: "",
  name: "",
  description: "",
  imageUrl: "",
  fileUrl: "",
  fileName: "",
  fileSize: "",
  sortOrder: 0,
  status: "Active",
}

export default function DownloadManagement() {
  const [tab, setTab] = useState<"categories" | "items">("categories")
  const [categories, setCategories] = useState<DownloadCategory[]>([])
  const [items, setItems] = useState<DownloadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  const [categoryDialog, setCategoryDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<DownloadCategory | null>(null)
  const [categoryForm, setCategoryForm] = useState(emptyCategory)
  const [savingCategory, setSavingCategory] = useState(false)
  const [deleteCategory, setDeleteCategory] = useState<DownloadCategory | null>(null)

  const [itemDialog, setItemDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<DownloadItem | null>(null)
  const [itemForm, setItemForm] = useState(emptyItem)
  const [savingItem, setSavingItem] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [deleteItem, setDeleteItem] = useState<DownloadItem | null>(null)

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [catRes, itemRes] = await Promise.all([
        fetch("/api/admin/download-categories?limit=500"),
        fetch("/api/admin/download-items?limit=1000"),
      ])
      const catJson = await catRes.json()
      const itemJson = await itemRes.json()
      setCategories(catJson.success ? catJson.data || [] : [])
      setItems(itemJson.success ? itemJson.data || [] : [])
    } catch (e) {
      console.error(e)
      setCategories([])
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories
    const q = searchTerm.toLowerCase()
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
    )
  }, [categories, searchTerm])

  const filteredItems = useMemo(() => {
    let list = items
    if (categoryFilter) list = list.filter((i) => i.categoryId === categoryFilter)
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description || "").toLowerCase().includes(q) ||
          (i.fileName || "").toLowerCase().includes(q)
      )
    }
    return list
  }, [items, categoryFilter, searchTerm])

  const openCreateCategory = () => {
    setEditingCategory(null)
    setCategoryForm({
      ...emptyCategory,
      sortOrder: (categories[categories.length - 1]?.sortOrder || 0) + 1,
    })
    setCategoryDialog(true)
  }

  const openEditCategory = (c: DownloadCategory) => {
    setEditingCategory(c)
    setCategoryForm({
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      imageUrl: c.imageUrl || "",
      sortOrder: c.sortOrder,
      status: c.status,
    })
    setCategoryDialog(true)
  }

  const handleCategoryImage = (file: File | null) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () =>
      setCategoryForm((p) => ({ ...p, imageUrl: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert("Category name is required")
      return
    }
    try {
      setSavingCategory(true)
      const payload = {
        ...categoryForm,
        slug: categoryForm.slug.trim() || slugifyDownloadCategory(categoryForm.name),
        description: categoryForm.description || null,
        imageUrl: categoryForm.imageUrl || null,
      }
      const res = await fetch("/api/admin/download-categories", {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingCategory ? { id: editingCategory.id, ...payload } : payload
        ),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || "Save failed")
      setCategoryDialog(false)
      await fetchAll()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save category")
    } finally {
      setSavingCategory(false)
    }
  }

  const confirmDeleteCategory = async () => {
    if (!deleteCategory) return
    try {
      const res = await fetch(`/api/admin/download-categories?id=${deleteCategory.id}`, {
        method: "DELETE",
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || "Delete failed")
      setDeleteCategory(null)
      await fetchAll()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete category")
    }
  }

  const openCreateItem = () => {
    setEditingItem(null)
    setItemForm({
      ...emptyItem,
      categoryId: categoryFilter || categories[0]?.id || "",
      sortOrder: 0,
    })
    setItemDialog(true)
  }

  const openEditItem = (item: DownloadItem) => {
    setEditingItem(item)
    setItemForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      fileUrl: item.fileUrl,
      fileName: item.fileName || "",
      fileSize: item.fileSize || "",
      sortOrder: item.sortOrder,
      status: item.status,
    })
    setItemDialog(true)
  }

  const handleItemImage = (file: File | null) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setItemForm((p) => ({ ...p, imageUrl: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const handleFileUpload = async (file: File | null) => {
    if (!file) return
    try {
      setUploadingFile(true)
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/admin/download-files", { method: "POST", body })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || "Upload failed")
      setItemForm((p) => ({
        ...p,
        fileUrl: result.data.url,
        fileName: result.data.fileName,
        fileSize: result.data.fileSize,
      }))
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to upload file")
    } finally {
      setUploadingFile(false)
    }
  }

  const saveItem = async () => {
    if (!itemForm.name.trim() || !itemForm.categoryId || !itemForm.fileUrl) {
      alert("Name, category, and downloadable file are required")
      return
    }
    try {
      setSavingItem(true)
      const payload = {
        ...itemForm,
        description: itemForm.description || null,
        imageUrl: itemForm.imageUrl || null,
        fileName: itemForm.fileName || null,
        fileSize: itemForm.fileSize || null,
      }
      const res = await fetch("/api/admin/download-items", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem ? { id: editingItem.id, ...payload } : payload),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || "Save failed")
      setItemDialog(false)
      await fetchAll()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save item")
    } finally {
      setSavingItem(false)
    }
  }

  const confirmDeleteItem = async () => {
    if (!deleteItem) return
    try {
      const res = await fetch(`/api/admin/download-items?id=${deleteItem.id}`, {
        method: "DELETE",
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || "Delete failed")
      setDeleteItem(null)
      await fetchAll()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete item")
    }
  }

  return (
    <div className="p-8 space-y-6 theme-bg">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold theme-text mb-2">Downloads</h1>
          <p className="theme-muted">
            Manage download categories and downloadable cards shown on /downloads
          </p>
        </div>
        <Button
          onClick={tab === "categories" ? openCreateCategory : openCreateItem}
          className="gap-2"
          disabled={tab === "items" && categories.length === 0}
        >
          <Plus size={18} />
          {tab === "categories" ? "Add Category" : "Add Download Card"}
        </Button>
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setTab("categories")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "categories"
              ? "bg-primary text-primary-foreground"
              : "theme-muted hover:theme-text hover:bg-muted"
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setTab("items")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "items"
              ? "bg-primary text-primary-foreground"
              : "theme-muted hover:theme-text hover:bg-muted"
          }`}
        >
          Download Cards
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 theme-muted"
          />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              tab === "categories"
                ? "Search categories..."
                : "Search download cards..."
            }
            className="pl-10"
          />
        </div>
        {tab === "items" && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-input border border-border rounded-lg theme-text"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin theme-primary" />
        </div>
      ) : tab === "categories" ? (
        <div className="theme-card rounded-xl overflow-hidden shadow-lg overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold">Image</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Items</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center theme-muted">
                    No categories yet. Add one to appear on /downloads.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => (
                  <tr key={c.id} className="border-b border-border hover:bg-muted/40">
                    <td className="px-4 py-3">
                      {c.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          className="w-14 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-14 h-10 bg-muted rounded flex items-center justify-center">
                          <ImageIcon size={16} className="theme-muted" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium theme-text">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-xs theme-muted">{c.slug}</td>
                    <td className="px-4 py-3 theme-muted">{c._count?.items ?? 0}</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.status === "Active" ? "default" : "secondary"}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditCategory(c)}
                          className="p-2 hover:bg-primary/10 rounded-lg theme-primary"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteCategory(c)}
                          className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="theme-card rounded-xl overflow-hidden shadow-lg overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold">Image</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">File</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center theme-muted">
                    No download cards yet. Create cards under a category for the slug page.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/40">
                    <td className="px-4 py-3">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-14 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-14 h-10 bg-muted rounded flex items-center justify-center">
                          <FileText size={16} className="theme-muted" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium theme-text">{item.name}</div>
                      {item.description && (
                        <div className="text-xs theme-muted line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 theme-muted text-sm">
                      {item.category?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={`${item.fileUrl}${item.fileUrl.includes("?") ? "&" : "?"}download=1`}
                        className="theme-primary hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.fileName || "Download"}
                      </a>
                      {item.fileSize && (
                        <span className="theme-muted text-xs ml-2">{item.fileSize}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.status === "Active" ? "default" : "secondary"}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditItem(item)}
                          className="p-2 hover:bg-primary/10 rounded-lg theme-primary"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Category dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={categoryForm.name}
                onChange={(e) => {
                  const name = e.target.value
                  setCategoryForm((p) => ({
                    ...p,
                    name,
                    slug: editingCategory ? p.slug : slugifyDownloadCategory(name),
                  }))
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Slug *</label>
              <Input
                value={categoryForm.slug}
                onChange={(e) =>
                  setCategoryForm((p) => ({
                    ...p,
                    slug: slugifyDownloadCategory(e.target.value),
                  }))
                }
              />
              <p className="text-xs theme-muted mt-1">
                Public URL: /downloads/{categoryForm.slug || "slug"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full min-h-[80px] px-3 py-2 bg-input border border-border rounded-lg theme-text"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category image</label>
              {categoryForm.imageUrl ? (
                <div className="relative mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={categoryForm.imageUrl}
                    alt="Preview"
                    className="w-full h-36 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setCategoryForm((p) => ({ ...p, imageUrl: "" }))}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                  <Upload size={20} className="theme-muted mb-1" />
                  <span className="text-xs theme-muted">Upload image (max 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleCategoryImage(e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Sort order</label>
                <Input
                  type="number"
                  value={categoryForm.sortOrder}
                  onChange={(e) =>
                    setCategoryForm((p) => ({
                      ...p,
                      sortOrder: parseInt(e.target.value || "0", 10),
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={categoryForm.status}
                  onChange={(e) =>
                    setCategoryForm((p) => ({ ...p, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveCategory} disabled={savingCategory}>
              {savingCategory ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item dialog */}
      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Download Card" : "Add Download Card"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Category *</label>
              <select
                value={itemForm.categoryId}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, categoryId: e.target.value }))
                }
                className="w-full px-3 py-2 bg-input border border-border rounded-lg"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={itemForm.name}
                onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full min-h-[80px] px-3 py-2 bg-input border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Card image</label>
              {itemForm.imageUrl ? (
                <div className="relative mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={itemForm.imageUrl}
                    alt="Preview"
                    className="w-full h-36 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setItemForm((p) => ({ ...p, imageUrl: "" }))}
                    className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                  <Upload size={20} className="theme-muted mb-1" />
                  <span className="text-xs theme-muted">Upload image (max 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleItemImage(e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Downloadable file *</label>
              {itemForm.fileUrl ? (
                <div className="mt-2 flex items-center justify-between gap-2 p-3 border rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {itemForm.fileName || "File uploaded"}
                    </p>
                    {itemForm.fileSize && (
                      <p className="text-xs theme-muted">{itemForm.fileSize}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setItemForm((p) => ({
                        ...p,
                        fileUrl: "",
                        fileName: "",
                        fileSize: "",
                      }))
                    }
                    className="p-1.5 text-destructive"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="mt-2 flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                  {uploadingFile ? (
                    <Loader2 className="animate-spin theme-primary" />
                  ) : (
                    <>
                      <Upload size={20} className="theme-muted mb-1" />
                      <span className="text-xs theme-muted text-center px-2">
                        PDF, Word, Excel, PowerPoint, ZIP · max 30MB
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                    disabled={uploadingFile}
                    onChange={(e) => {
                      handleFileUpload(e.target.files?.[0] || null)
                      e.target.value = ""
                    }}
                  />
                </label>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Sort order</label>
                <Input
                  type="number"
                  value={itemForm.sortOrder}
                  onChange={(e) =>
                    setItemForm((p) => ({
                      ...p,
                      sortOrder: parseInt(e.target.value || "0", 10),
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={itemForm.status}
                  onChange={(e) => setItemForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveItem} disabled={savingItem || uploadingFile}>
              {savingItem ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteCategory}
        onOpenChange={(open) => !open && setDeleteCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also delete all download cards in "{deleteCategory?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete download card?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{deleteItem?.name}" from the public downloads page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
