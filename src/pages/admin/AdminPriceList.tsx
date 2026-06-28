import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, FileText, FolderOpen, Folder, ChevronRight, Search, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/admin/PageHeader';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingState } from '@/components/admin/LoadingState';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';
import { supabase, PriceListSheet, PriceListFolder } from '@/lib/supabase';
import { toast } from 'sonner';

const BUCKET = 'price-list';

export default function AdminPriceList() {
  const [folders, setFolders] = useState<PriceListFolder[]>([]);
  const [sheets, setSheets] = useState<PriceListSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetDialogOpen, setSheetDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<PriceListSheet | null>(null);
  const [editingFolder, setEditingFolder] = useState<PriceListFolder | null>(null);
  const [sheetTitle, setSheetTitle] = useState('');
  const [folderTitle, setFolderTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'sheet' | 'folder'; item: PriceListSheet | PriceListFolder } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [foldersRes, sheetsRes] = await Promise.all([
        supabase.from('price_list_folders').select('*').order('sort_order').order('created_at'),
        supabase.from('price_list_sheets').select('*').order('sort_order').order('created_at'),
      ]);
      if (foldersRes.error) throw foldersRes.error;
      if (sheetsRes.error) throw sheetsRes.error;
      setFolders(foldersRes.data || []);
      setSheets(sheetsRes.data || []);
    } catch (error: any) {
      toast.error('Failed to load: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Search filters across all folders/sheets
  const isSearching = searchQuery.trim().length > 0;
  const q = searchQuery.toLowerCase();
  const currentFolders = isSearching
    ? folders.filter((f) => f.title.toLowerCase().includes(q))
    : folders.filter((f) => f.parent_id === currentFolderId);
  const currentSheets = isSearching
    ? sheets.filter((s) => s.title.toLowerCase().includes(q))
    : sheets.filter((s) => s.folder_id === currentFolderId);

  // Breadcrumb
  const breadcrumb: PriceListFolder[] = [];
  let pid: string | null = currentFolderId;
  while (pid) {
    const f = folders.find((x) => x.id === pid);
    if (!f) break;
    breadcrumb.unshift(f);
    pid = f.parent_id;
  }

  const openAddSheet = () => {
    setEditingSheet(null);
    setSheetTitle('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSheetDialogOpen(true);
  };

  const openEditSheet = (sheet: PriceListSheet) => {
    setEditingSheet(sheet);
    setSheetTitle(sheet.title);
    setSheetDialogOpen(true);
  };

  const openAddFolder = () => {
    setEditingFolder(null);
    setFolderTitle('');
    setFolderDialogOpen(true);
  };

  const openEditFolder = (folder: PriceListFolder) => {
    setEditingFolder(folder);
    setFolderTitle(folder.title);
    setFolderDialogOpen(true);
  };

  const handleSheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!sheetTitle.trim()) { toast.error('Enter a title'); return; }
    if (!editingSheet && !file) { toast.error('Choose a PDF file'); return; }
    if (file && file.type !== 'application/pdf') { toast.error('File must be a PDF'); return; }
    setUploading(true);
    try {
      if (editingSheet) {
        let filePath = editingSheet.file_path;
        if (file) {
          const ext = file.name.split('.').pop() || 'pdf';
          filePath = `sheet-${editingSheet.id}.${ext}`;
          await supabase.storage.from(BUCKET).upload(filePath, file, { upsert: true, contentType: 'application/pdf' });
        }
        const { error } = await supabase.from('price_list_sheets')
          .update({ title: sheetTitle.trim(), file_path: filePath, folder_id: currentFolderId })
          .eq('id', editingSheet.id);
        if (error) throw error;
        toast.success('Sheet updated');
      } else {
        const ext = file!.name.split('.').pop() || 'pdf';
        const filePath = `sheet-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        await supabase.storage.from(BUCKET).upload(filePath, file!, { upsert: false, contentType: 'application/pdf' });
        const { error } = await supabase.from('price_list_sheets').insert({
          title: sheetTitle.trim(), file_path: filePath,
          folder_id: currentFolderId, sort_order: sheets.length,
        });
        if (error) throw error;
        toast.success('Sheet added');
      }
      setSheetDialogOpen(false);
      fetchAll();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    } finally {
      setUploading(false);
    }
  };

  const handleFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderTitle.trim()) { toast.error('Enter folder name'); return; }
    try {
      if (editingFolder) {
        const { error } = await supabase.from('price_list_folders')
          .update({ title: folderTitle.trim() }).eq('id', editingFolder.id);
        if (error) throw error;
        toast.success('Folder updated');
      } else {
        const { error } = await supabase.from('price_list_folders').insert({
          title: folderTitle.trim(), parent_id: currentFolderId, sort_order: folders.length,
        });
        if (error) throw error;
        toast.success('Folder created');
      }
      setFolderDialogOpen(false);
      fetchAll();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'sheet') {
        const { error } = await supabase.from('price_list_sheets').delete().eq('id', deleteTarget.item.id);
        if (error) throw error;
        toast.success('Sheet removed');
      } else {
        const { error } = await supabase.from('price_list_folders').delete().eq('id', deleteTarget.item.id);
        if (error) throw error;
        toast.success('Folder removed');
      }
      fetchAll();
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getDeleteDescription = () => {
    if (!deleteTarget) return '';
    if (deleteTarget.type === 'folder') {
      const folder = deleteTarget.item as PriceListFolder;
      const subCount = folders.filter((f) => f.parent_id === folder.id).length;
      const sheetCount = sheets.filter((s) => s.folder_id === folder.id).length;
      if (subCount || sheetCount) {
        return `This folder contains ${subCount} sub-folder(s) and ${sheetCount} sheet(s). Sub-folders will be removed; sheets will move to root.`;
      }
    }
    return 'This action cannot be undone.';
  };

  const sheetCount = (folderId: string) => sheets.filter((s) => s.folder_id === folderId).length;
  const subFolderCount = (folderId: string) => folders.filter((f) => f.parent_id === folderId).length;

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <PageHeader
          title="Price List"
          description="Organize price sheets in folders. Users browse these as a folder structure on the public page."
          action={
            <div className="flex gap-2">
              <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={openAddFolder}>
                    <Folder className="w-4 h-4 mr-2" /> Add Folder
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" aria-describedby="folder-dialog-desc">
                  <DialogHeader>
                    <DialogTitle>{editingFolder ? 'Edit folder' : 'New folder'}</DialogTitle>
                    <DialogDescription id="folder-dialog-desc">
                      Folders help organize PDF sheets. Users will see this as a folder on the price list page.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleFolderSubmit} className="space-y-4">
                    <div>
                      <Label>Folder name *</Label>
                      <Input value={folderTitle} onChange={(e) => setFolderTitle(e.target.value)}
                        placeholder="e.g. Acrylic rods" required className="mt-1" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setFolderDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">{editingFolder ? 'Update' : 'Create folder'}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={sheetDialogOpen} onOpenChange={setSheetDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddSheet}>
                    <Plus className="w-4 h-4 mr-2" /> Add PDF Sheet
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" aria-describedby="sheet-dialog-desc">
                  <DialogHeader>
                    <DialogTitle>{editingSheet ? 'Edit sheet' : 'Add PDF sheet'}</DialogTitle>
                    <DialogDescription id="sheet-dialog-desc">
                      Upload a PDF. It will appear {currentFolderId ? 'inside this folder' : 'at root'}.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSheetSubmit} className="space-y-4">
                    <div>
                      <Label>Title *</Label>
                      <Input value={sheetTitle} onChange={(e) => setSheetTitle(e.target.value)}
                        placeholder="e.g. Acrylic rods – price list" required className="mt-1" />
                    </div>
                    <div>
                      <Label>PDF file {editingSheet && <span className="text-muted-foreground font-normal">(leave empty to keep current)</span>}</Label>
                      <input ref={fileInputRef} type="file" accept="application/pdf"
                        className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground file:cursor-pointer" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setSheetDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={uploading}>
                        {uploading ? 'Uploading…' : editingSheet ? 'Update' : 'Add sheet'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          }
        />

        {/* Search */}
        <div className="bg-background border border-border rounded-lg p-4 mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search folders and sheets…" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-11 text-base" />
          </div>
        </div>

        {/* Breadcrumb */}
        {!isSearching && (
          <div className="flex items-center gap-1.5 text-sm mb-4 flex-wrap">
            <button type="button"
              onClick={() => setCurrentFolderId(null)}
              className={`flex items-center gap-1 transition-colors ${currentFolderId ? 'text-muted-foreground hover:text-foreground' : 'text-foreground font-medium'}`}>
              <Home className="w-3.5 h-3.5" />
              <span>Root</span>
            </button>
            {breadcrumb.map((f) => (
              <span key={f.id} className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                <button type="button" onClick={() => setCurrentFolderId(f.id)}
                  className={`transition-colors ${currentFolderId === f.id ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                  {f.title}
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          {isLoading ? (
            <LoadingState />
          ) : currentFolders.length === 0 && currentSheets.length === 0 ? (
            <EmptyState
              icon={isSearching ? Search : FileText}
              title={isSearching ? 'No results found' : currentFolderId ? 'This folder is empty' : 'No price list items yet'}
              description={isSearching ? 'Try a different search term.' : 'Add a folder or a PDF sheet using the buttons above.'}
            />
          ) : (
            <ul className="divide-y divide-border">
              {/* Folders */}
              {currentFolders.map((folder) => {
                const sub = subFolderCount(folder.id);
                const sheets_ = sheetCount(folder.id);
                return (
                  <li key={folder.id} className="flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors">
                    <button type="button" onClick={() => { setCurrentFolderId(folder.id); setSearchQuery(''); }}
                      className="flex items-center gap-4 flex-1 text-left min-w-0 group">
                      <div className="w-11 h-11 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
                        <FolderOpen className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-foreground group-hover:text-primary truncate">{folder.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {sub > 0 ? `${sub} sub-folder${sub !== 1 ? 's' : ''} · ` : ''}{sheets_} sheet{sheets_ !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-9 w-9"
                        onClick={() => openEditFolder(folder)} title="Edit folder">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget({ type: 'folder', item: folder })} title="Delete folder">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}

              {/* Sheets */}
              {currentSheets.map((sheet) => (
                <li key={sheet.id} className="flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-md bg-slate-50 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-foreground truncate">{sheet.title}</p>
                      <p className="text-sm text-muted-foreground">PDF sheet</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9"
                      onClick={() => openEditSheet(sheet)} title="Edit sheet">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget({ type: 'sheet', item: sheet })} title="Delete sheet">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={deleteTarget?.type === 'folder' ? 'Delete folder?' : 'Remove sheet?'}
        description={getDeleteDescription()}
      />
    </AdminLayout>
  );
}
