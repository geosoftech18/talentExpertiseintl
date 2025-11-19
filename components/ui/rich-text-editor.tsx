"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Undo, Redo } from "lucide-react"
import { useEffect, useState } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = "Start typing..." }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (html !== value) {
        onChange(html)
      }
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    onCreate: ({ editor }) => {
      if (value) {
        editor.commands.setContent(value, false)
      }
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!editor || !isMounted) return

    const currentContent = editor.getHTML()
    if (value !== currentContent && value !== undefined) {
      editor.commands.setContent(value || "", false)
    }
  }, [value, editor, isMounted])

  if (!editor || !isMounted) {
    return (
      <div className="border border-border rounded-lg overflow-hidden theme-card">
        <div className="p-4 bg-muted/30 border-b border-border h-12" />
        <div className="bg-input min-h-[200px] flex items-center justify-center">
          <div className="theme-muted">Loading editor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden theme-card">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30 flex-wrap">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBold().run()
          }}
          className={`p-2 rounded hover:bg-muted transition-colors ${
            editor.isActive("bold") ? "bg-primary/20 text-primary" : "theme-muted hover:theme-text"
          }`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleItalic().run()
          }}
          className={`p-2 rounded hover:bg-muted transition-colors ${
            editor.isActive("italic") ? "bg-primary/20 text-primary" : "theme-muted hover:theme-text"
          }`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }}
          className={`p-2 rounded hover:bg-muted transition-colors ${
            editor.isActive("heading", { level: 1 }) ? "bg-primary/20 text-primary" : "theme-muted hover:theme-text"
          }`}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }}
          className={`p-2 rounded hover:bg-muted transition-colors ${
            editor.isActive("heading", { level: 2 }) ? "bg-primary/20 text-primary" : "theme-muted hover:theme-text"
          }`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }}
          className={`p-2 rounded hover:bg-muted transition-colors ${
            editor.isActive("heading", { level: 3 }) ? "bg-primary/20 text-primary" : "theme-muted hover:theme-text"
          }`}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBulletList().run()
          }}
          className={`p-2 rounded hover:bg-muted transition-colors ${
            editor.isActive("bulletList") ? "bg-primary/20 text-primary" : "theme-muted hover:theme-text"
          }`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleOrderedList().run()
          }}
          className={`p-2 rounded hover:bg-muted transition-colors ${
            editor.isActive("orderedList") ? "bg-primary/20 text-primary" : "theme-muted hover:theme-text"
          }`}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().undo().run()
          }}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-muted transition-colors theme-muted hover:theme-text disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().redo().run()
          }}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-muted transition-colors theme-muted hover:theme-text disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo size={18} />
        </button>
      </div>

      {/* Editor Content */}
      <div className="bg-input relative">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
