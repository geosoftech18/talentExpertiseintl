"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { TextAlign, type TextAlignment } from "@/lib/tiptap/text-align-extension"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Show left / center / right / justify alignment controls (e.g. Introduction field) */
  showTextAlign?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  showTextAlign = false,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  const extensions = useMemo(() => {
    const base = [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ]
    if (showTextAlign) {
      base.push(
        TextAlign.configure({
          types: ["heading", "paragraph"],
          alignments: ["left", "center", "right", "justify"],
          defaultAlignment: "left",
        })
      )
    }
    return base
  }, [placeholder, showTextAlign])

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: value || "",
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      if (html !== value) {
        onChange(html)
      }
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[180px] px-4 py-3 prose prose-sm max-w-none",
      },
    },
    onCreate: ({ editor: ed }) => {
      if (value) {
        ed.commands.setContent(value, false)
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

  const setAlignment = (alignment: TextAlignment) => {
    editor?.chain().focus().setTextAlign(alignment).run()
  }

  const isAlignmentActive = (alignment: TextAlignment) =>
    editor?.isActive({ textAlign: alignment }) ?? false

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

        {showTextAlign && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <span className="text-xs theme-muted px-1 hidden sm:inline">Align</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setAlignment("left")
              }}
              className={`p-2 rounded hover:bg-muted transition-colors ${
                isAlignmentActive("left") ? "bg-primary/20 text-primary" : "theme-muted hover:theme-text"
              }`}
              title="Align left"
            >
              <AlignLeft size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setAlignment("center")
              }}
              className={`p-2 rounded hover:bg-muted transition-colors ${
                isAlignmentActive("center") ? "bg-primary/20 text-primary" : "theme-muted hover:theme-text"
              }`}
              title="Align center"
            >
              <AlignCenter size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setAlignment("right")
              }}
              className={`p-2 rounded hover:bg-muted transition-colors ${
                isAlignmentActive("right") ? "bg-primary/20 text-primary" : "theme-muted hover:theme-text"
              }`}
              title="Align right"
            >
              <AlignRight size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setAlignment("justify")
              }}
              className={`p-2 rounded hover:bg-muted transition-colors ${
                isAlignmentActive("justify") ? "bg-primary/20 text-primary" : "theme-muted hover:theme-text"
              }`}
              title="Justify"
            >
              <AlignJustify size={18} />
            </button>
          </>
        )}

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
      <div className="bg-input relative [&_.ProseMirror]:min-h-[180px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

