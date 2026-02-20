import { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

import { useAppStore, type EditorPaper } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Trash2,
  ChevronLeft,
  Palette,
  Type,
  Moon,
  Sun,
  Monitor,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'

const PASTEL_COLORS = [
  { name: 'Rose', value: '#E8B4B8' },
  { name: 'Sky', value: '#B8D4E8' },
  { name: 'Mint', value: '#B8E8D4' },
  { name: 'Sand', value: '#E8D4B8' },
  { name: 'Lavender', value: '#D4B8E8' },
]

const PAPER_THEMES: { id: EditorPaper; label: string; icon: typeof Sun }[] = [
  { id: 'white', label: 'White', icon: Sun },
  { id: 'sepia', label: 'Sepia', icon: Palette },
  { id: 'cool-grey', label: 'Cool Grey', icon: Monitor },
  { id: 'oled', label: 'OLED', icon: Moon },
]

const SLASH_COMMANDS = [
  { label: 'Heading 1', icon: Heading1, command: 'heading', level: 1 },
  { label: 'Heading 2', icon: Heading2, command: 'heading', level: 2 },
  { label: 'Bullet List', icon: List, command: 'bulletList' },
  { label: 'Numbered List', icon: ListOrdered, command: 'orderedList' },
]

export function EditorView() {
  const {
    currentDocument,
    updateDocument,
    deleteDocument,
    setCurrentView,
    setCurrentDocument,
    editorPaper,
    setEditorPaper,
  } = useAppStore()

  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing... Type / for commands',
      }),
      Color,

      // ✅ NEW
      Image,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: '',
    autofocus: 'end',
  })

  // ✅ Sync content
  useEffect(() => {
    if (editor && currentDocument) {
      editor.commands.setContent(currentDocument.content || '')
    }
  }, [currentDocument, editor])

  // ✅ Save
  useEffect(() => {
    if (!editor || !currentDocument) return

    let timeout: ReturnType<typeof setTimeout>

    const handler = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        updateDocument(currentDocument.id, {
          content: editor.getHTML(),
          title: editor.getText().slice(0, 50) || 'Untitled',
        })
      }, 500)
    }

    editor.on('update', handler)
    return () => {
      clearTimeout(timeout)
      editor.off('update', handler)
    }
  }, [editor, currentDocument])

  // ✅ Slash menu
  useEffect(() => {
    if (!editor) return

    const ed = editor

    const checkSlash = () => {
      const { $from } = ed.state.selection
      const text = $from.parent.textContent.slice(0, $from.parentOffset)

      const match = text.match(/\/(\w*)$/)

      if (match) {
        setShowSlashMenu(true)
        setSlashQuery(match[1])
        setSelectedCommandIndex(0)
      } else {
        setShowSlashMenu(false)
      }
    }

    ed.on('update', checkSlash)

    return () => {
      ed.off('update', checkSlash)
    }
  }, [editor])

  const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(slashQuery.toLowerCase())
  )

  const executeCommand = (command: typeof SLASH_COMMANDS[0]) => {
    if (!editor) return

    const { $from } = editor.state.selection
    const from = $from.pos - slashQuery.length - 1

    editor.chain().focus().deleteRange({ from, to: $from.pos }).run()

    if (command.command === 'heading') {
      editor.chain().focus().toggleHeading({ level: command.level as 1 | 2 }).run()
    } else if (command.command === 'bulletList') {
      editor.chain().focus().toggleBulletList().run()
    } else {
      editor.chain().focus().toggleOrderedList().run()
    }

    setShowSlashMenu(false)
  }

  // ✅ IMAGE
  const addImage = () => {
    const url = prompt('Enter image URL')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  // ✅ LINK
  const addLink = () => {
    const url = prompt('Enter URL')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const handleDeleteDocument = () => {
    if (currentDocument) {
      deleteDocument(currentDocument.id)
      setCurrentDocument(null)
      setCurrentView('library')
    }
  }

  const handleBackToLibrary = () => {
    setCurrentDocument(null)
    setCurrentView('library')
  }

  const getPaperClass = () => {
    switch (editorPaper) {
      case 'sepia': return 'editor-paper-sepia'
      case 'cool-grey': return 'editor-paper-cool-grey'
      case 'oled': return 'editor-paper-oled'
      default: return 'editor-paper-white'
    }
  }

  if (!currentDocument) return null

  return (
    <div className="h-full flex flex-col bg-background">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackToLibrary}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentDocument.title || 'Untitled'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Type className="w-4 h-4 mr-2" />
                Theme
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {PAPER_THEMES.map((theme) => {
                const Icon = theme.icon
                return (
                  <DropdownMenuItem
                    key={theme.id}
                    onClick={() => setEditorPaper(theme.id)}
                    className={cn(editorPaper === theme.id && 'bg-accent')}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {theme.label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={handleDeleteDocument}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* EDITOR */}
      <div className="flex-1 overflow-auto">
        <div className={cn(
          'max-w-3xl mx-auto min-h-full p-8 md:p-12',
          'editor-paper',
          getPaperClass()
        )}>
          <EditorContent
            editor={editor}
            className="prose max-w-none focus:outline-none text-lg dark:prose-invert"
          />

          {/* SLASH MENU */}
          {showSlashMenu && filteredCommands.length > 0 && (
            <div className="mt-2 bg-popover border rounded-md shadow-md">
              {filteredCommands.map((command, index) => {
                const Icon = command.icon
                return (
                  <button
                    key={command.label}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2',
                      index === selectedCommandIndex && 'bg-accent'
                    )}
                    onClick={() => executeCommand(command)}
                  >
                    <Icon className="w-4 h-4" />
                    {command.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* FLOATING TOOLBAR */}
      {editor && editor.isFocused && !editor.state.selection.empty && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-xl border rounded-xl shadow-lg p-2 flex gap-1">

          <Button size="icon" variant="ghost"
            onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="w-4 h-4" />
          </Button>

          <Button size="icon" variant="ghost"
            onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="w-4 h-4" />
          </Button>

          <Button size="icon" variant="ghost" onClick={addLink}>
            <LinkIcon className="w-4 h-4" />
          </Button>

          <Button size="icon" variant="ghost" onClick={addImage}>
            <ImageIcon className="w-4 h-4" />
          </Button>

          <Button size="icon" variant="ghost"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 className="w-4 h-4" />
          </Button>

          <Button size="icon" variant="ghost"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}