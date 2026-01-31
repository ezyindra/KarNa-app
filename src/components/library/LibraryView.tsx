import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  FileText, 
  Trash2, 
  ArrowRightLeft,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

type SortField = 'name' | 'date' | 'size';
type SortOrder = 'asc' | 'desc';

export function LibraryView() {
  const { 
    documents, 
    quickThoughts, 
    addDocument, 
    deleteDocument, 
    addQuickThought,
    deleteQuickThought,
    convertThoughtToDocument,
    setCurrentDocument,
    setCurrentView 
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [newThought, setNewThought] = useState('');
  const [isNewDocDialogOpen, setIsNewDocDialogOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');

  // Filter and sort documents
  const filteredDocs = documents
    .filter((doc) => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
        case 'size':
          comparison = b.size - a.size;
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

  const handleCreateDocument = () => {
    if (newDocTitle.trim()) {
      addDocument({
        title: newDocTitle.trim(),
        content: '',
      });
      setNewDocTitle('');
      setIsNewDocDialogOpen(false);
    }
  };

  const handleAddThought = () => {
    if (newThought.trim()) {
      addQuickThought(newThought.trim());
      setNewThought('');
    }
  };

  const handleOpenDocument = (doc: typeof documents[0]) => {
    setCurrentDocument(doc);
    setCurrentView('editor');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Documents */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortField('name')}>
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortField('date')}>
                  Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortField('size')}>
                  Size
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </Button>
            
            <Dialog open={isNewDocDialogOpen} onOpenChange={setIsNewDocDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Document title..."
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateDocument()}
                  />
                  <Button onClick={handleCreateDocument} className="w-full">
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Documents Grid */}
        <div className="flex-1 overflow-auto custom-scrollbar p-4">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No documents yet</p>
              <p className="text-sm">Create your first document to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="doc-card group"
                  onClick={() => handleOpenDocument(doc)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="w-8 h-8 text-primary/60" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDocument(doc.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h4 className="font-medium text-foreground line-clamp-2 mb-2">
                    {doc.title || 'Untitled'}
                  </h4>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{format(new Date(doc.updatedAt), 'MMM d, yyyy')}</span>
                    <span>{formatFileSize(doc.size)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Right Panel - Quick Thoughts */}
      <div className="w-80 border-l border-border bg-secondary/30 flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Quick Thoughts</h3>
          <p className="text-xs text-muted-foreground">Jot down ideas quickly</p>
        </div>
        
        {/* Add Thought */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Type a quick note..."
              value={newThought}
              onChange={(e) => setNewThought(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddThought()}
            />
            <Button size="icon" onClick={handleAddThought}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Thoughts List */}
        <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-3">
          {quickThoughts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No quick thoughts yet</p>
              <p className="text-xs">Add ideas that you can convert to documents later</p>
            </div>
          ) : (
            quickThoughts.map((thought) => (
              <div key={thought.id} className="thought-item group">
                <p className="text-sm text-foreground mb-3 line-clamp-3">
                  {thought.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(thought.createdAt), 'h:mm a')}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => convertThoughtToDocument(thought.id)}
                      title="Convert to document"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteQuickThought(thought.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
