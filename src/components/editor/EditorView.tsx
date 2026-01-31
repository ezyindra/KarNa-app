import { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Color from '@tiptap/extension-color';
import { useAppStore, type EditorPaper } from '@/store/appStore';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Pastel focus colors
const PASTEL_COLORS = [
  { name: 'Rose', value: '#E8B4B8' },
  { name: 'Sky', value: '#B8D4E8' },
  { name: 'Mint', value: '#B8E8D4' },
  { name: 'Sand', value: '#E8D4B8' },
  { name: 'Lavender', value: '#D4B8E8' },
];

// Paper theme options
const PAPER_THEMES: { id: EditorPaper; label: string; icon: typeof Sun }[] = [
  { id: 'white', label: 'White', icon: Sun },
  { id: 'sepia', label: 'Sepia', icon: Palette },
  { id: 'cool-grey', label: 'Cool Grey', icon: Monitor },
  { id: 'oled', label: 'OLED', icon: Moon },
];

// Slash command options
const SLASH_COMMANDS = [
  { label: 'Heading 1', icon: Heading1, command: 'heading', level: 1 },
  { label: 'Heading 2', icon: Heading2, command: 'heading', level: 2 },
  { label: 'Bullet List', icon: List, command: 'bulletList' },
  { label: 'Numbered List', icon: ListOrdered, command: 'orderedList' },
];

export function EditorView() {
  const { 
    currentDocument, 
    updateDocument, 
    deleteDocument, 
    setCurrentView,
    setCurrentDocument,
    editorPaper,
    setEditorPaper
  } = useAppStore();
  
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const slashMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing... Type / for commands',
      }),
      Color,
    ],
    content: currentDocument?.content || '',
    onUpdate: ({ editor }) => {
      if (currentDocument) {
        updateDocument(currentDocument.id, {
          content: editor.getHTML(),
          title: editor.getText().slice(0, 50) || 'Untitled',
        });
      }
    },
  });

  // Handle keyboard events for slash menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showSlashMenu) return;
      
      if (event.key === 'Escape') {
        setShowSlashMenu(false);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedCommandIndex((prev) => 
          Math.min(prev + 1, filteredCommands.length - 1)
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedCommandIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (filteredCommands[selectedCommandIndex]) {
          executeCommand(filteredCommands[selectedCommandIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSlashMenu, selectedCommandIndex, slashQuery]);

  // Handle slash command detection
  useEffect(() => {
    if (!editor) return;

    const handleTextInput = () => {
      const { selection } = editor.state;
      const { $from } = selection;
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      
      const slashMatch = textBefore.match(/\/(\w*)$/);
      if (slashMatch) {
        setShowSlashMenu(true);
        setSlashQuery(slashMatch[1]);
        setSelectedCommandIndex(0);
      } else {
        setShowSlashMenu(false);
      }
    };

    editor.on('update', handleTextInput);
    return () => {
      editor.off('update', handleTextInput);
    };
  }, [editor]);

  const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(slashQuery.toLowerCase())
  );

  const executeCommand = (command: typeof SLASH_COMMANDS[0]) => {
    if (!editor) return;
    
    // Remove the slash query
    const { selection } = editor.state;
    const { $from } = selection;
    const from = $from.pos - slashQuery.length - 1;
    editor.chain().focus().deleteRange({ from, to: $from.pos }).run();
    
    // Execute the command
    if (command.command === 'heading') {
      editor.chain().focus().toggleHeading({ level: command.level as 1 | 2 }).run();
    } else if (command.command === 'bulletList') {
      editor.chain().focus().toggleBulletList().run();
    } else if (command.command === 'orderedList') {
      editor.chain().focus().toggleOrderedList().run();
    }
    
    setShowSlashMenu(false);
  };

  const handleDeleteDocument = () => {
    if (currentDocument) {
      deleteDocument(currentDocument.id);
      setCurrentDocument(null);
      setCurrentView('library');
    }
  };

  const handleBackToLibrary = () => {
    setCurrentDocument(null);
    setCurrentView('library');
  };

  const getPaperClass = () => {
    switch (editorPaper) {
      case 'sepia': return 'editor-paper-sepia';
      case 'cool-grey': return 'editor-paper-cool-grey';
      case 'oled': return 'editor-paper-oled';
      default: return 'editor-paper-white';
    }
  };

  if (!currentDocument) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No document selected</p>
          <Button onClick={() => setCurrentView('library')}>
            Go to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBackToLibrary}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          <span className="text-sm text-muted-foreground mx-2">
            {currentDocument.title || 'Untitled'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Paper Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Type className="w-4 h-4 mr-2" />
                Theme
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {PAPER_THEMES.map((theme) => {
                const Icon = theme.icon;
                return (
                  <DropdownMenuItem
                    key={theme.id}
                    onClick={() => setEditorPaper(theme.id)}
                    className={cn(editorPaper === theme.id && 'bg-accent')}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {theme.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={handleDeleteDocument}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Editor Area */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-background">
        <div className={cn(
          'max-w-3xl mx-auto min-h-full p-8 md:p-12',
          'editor-paper',
          getPaperClass()
        )}>
          <EditorContent 
            editor={editor} 
            className="prose prose-sm max-w-none focus:outline-none"
          />
          
          {/* Slash Command Menu */}
          {showSlashMenu && filteredCommands.length > 0 && (
            <div 
              ref={slashMenuRef}
              className="slash-menu mt-2"
            >
              {filteredCommands.map((command, index) => {
                const Icon = command.icon;
                return (
                  <button
                    key={command.label}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      index === selectedCommandIndex 
                        ? 'bg-accent text-accent-foreground' 
                        : 'hover:bg-accent/50'
                    )}
                    onClick={() => executeCommand(command)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{command.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Toolbar */}
      {editor && editor.isFocused && editor.state.selection.empty === false && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 floating-toolbar z-50">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              editor.isActive('bold') && 'bg-accent'
            )}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              editor.isActive('italic') && 'bg-accent'
            )}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              editor.isActive('heading', { level: 1 }) && 'bg-accent'
            )}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              editor.isActive('heading', { level: 2 }) && 'bg-accent'
            )}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-4 bg-border mx-1" />
          
          {/* Color Picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <div 
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ 
                    backgroundColor: editor.getAttributes('textStyle').color || 'currentColor' 
                  }}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="flex gap-1 p-2">
              {PASTEL_COLORS.map((color) => (
                <button
                  key={color.value}
                  className="w-6 h-6 rounded-full border border-border/50 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  onClick={() => editor.chain().focus().setColor(color.value).run()}
                  title={color.name}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
