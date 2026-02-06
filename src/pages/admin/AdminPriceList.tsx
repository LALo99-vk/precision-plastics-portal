import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, FileText, FolderOpen, Folder, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase, PriceListSheet, PriceListFolder } from '@/lib/supabase';
import { toast } from 'sonner';

const BUCKET = 'price-list';

export default function AdminPriceList() {
  const [folders, setFolders] = useState<PriceListFolder[]>([]);
  const [sheets, setSheets] = useState<PriceListSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [sheetDialogOpen, setSheetDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<PriceListSheet | null>(null);
  const [editingFolder, setEditingFolder] = useState<PriceListFolder | null>(null);
  const [sheetTitle, setSheetTitle] = useState('');
  const [folderTitle, setFolderTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAll();
  }, []);

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

  const currentFolders = folders.filter((f) => f.parent_id === currentFolderId);
  const currentSheets = sheets.filter((s) => s.folder_id === currentFolderId);
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
    if (!sheetTitle.trim()) {
      toast.error('Enter a title');
      return;
    }
    if (!editingSheet && !file) {
      toast.error('Choose a PDF file');
      return;
    }
    if (file && file.type !== 'application/pdf') {
      toast.error('File must be a PDF');
      return;
    }

    setUploading(true);
    try {
      if (editingSheet) {
        let filePath = editingSheet.file_path;
        if (file) {
          const ext = file.name.split('.').pop() || 'pdf';
          filePath = `sheet-${editingSheet.id}.${ext}`;
          await supabase.storage.from(BUCKET).upload(filePath, file, { upsert: true, contentType: 'application/pdf' });
        }
        const { error } = await supabase
          .from('price_list_sheets')
          .update({ title: sheetTitle.trim(), file_path: filePath, folder_id: currentFolderId })
          .eq('id', editingSheet.id);
        if (error) throw error;
        toast.success('Sheet updated');
      } else {
        const ext = file!.name.split('.').pop() || 'pdf';
        const filePath = `sheet-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        await supabase.storage.from(BUCKET).upload(filePath, file!, { upsert: false, contentType: 'application/pdf' });
        const { error } = await supabase.from('price_list_sheets').insert({
          title: sheetTitle.trim(),
          file_path: filePath,
          folder_id: currentFolderId,
          sort_order: sheets.length,
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
    if (!folderTitle.trim()) {
      toast.error('Enter folder name');
      return;
    }
    try {
      if (editingFolder) {
        const { error } = await supabase
          .from('price_list_folders')
          .update({ title: folderTitle.trim() })
          .eq('id', editingFolder.id);
        if (error) throw error;
        toast.success('Folder updated');
      } else {
        const { error } = await supabase.from('price_list_folders').insert({
          title: folderTitle.trim(),
          parent_id: currentFolderId,
          sort_order: folders.length,
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

  const handleDeleteSheet = async (sheet: PriceListSheet) => {
    if (!confirm(`Remove "${sheet.title}"?`)) return;
    try {
      const { error } = await supabase.from('price_list_sheets').delete().eq('id', sheet.id);
      if (error) throw error;
      toast.success('Sheet removed');
      fetchAll();
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  const handleDeleteFolder = async (folder: PriceListFolder) => {
    const subCount = folders.filter((f) => f.parent_id === folder.id).length;
    const sheetCount = sheets.filter((s) => s.folder_id === folder.id).length;
    const msg =
      subCount || sheetCount
        ? `Remove folder "${folder.title}"? It contains ${subCount} sub-folder(s) and ${sheetCount} sheet(s). Sub-folders will be removed; sheets will move to root.`
        : `Remove folder "${folder.title}"?`;
    if (!confirm(msg)) return;
    try {
      const { error } = await supabase.from('price_list_folders').delete().eq('id', folder.id);
      if (error) throw error;
      toast.success('Folder removed');
      fetchAll();
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Price list</h1>
          <p className="text-muted-foreground">
            Create folders (categories) and add PDF sheets inside. Folders can contain sub-folders and multiple PDFs. Users see these as folders on the public page.
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 flex-wrap">
          <button
            type="button"
            onClick={() => setCurrentFolderId(null)}
            className="hover:text-foreground font-medium"
          >
            Root
          </button>
          {breadcrumb.map((f) => (
            <span key={f.id} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4" />
              <button
                type="button"
                onClick={() => setCurrentFolderId(f.id)}
                className="hover:text-foreground font-medium"
              >
                {f.title}
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={openAddFolder}>
                <Folder className="w-4 h-4 mr-2" />
                Add folder
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
                  <Input
                    value={folderTitle}
                    onChange={(e) => setFolderTitle(e.target.value)}
                    placeholder="e.g. Acrylic rods"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setFolderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingFolder ? 'Update' : 'Create folder'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={sheetDialogOpen} onOpenChange={setSheetDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddSheet}>
                <Plus className="w-4 h-4 mr-2" />
                Add sheet (PDF)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" aria-describedby="sheet-dialog-desc">
              <DialogHeader>
                <DialogTitle>{editingSheet ? 'Edit sheet' : 'Add PDF sheet'}</DialogTitle>
                <DialogDescription id="sheet-dialog-desc">
                  Upload a PDF. It will appear {currentFolderId ? 'inside this folder' : 'at root'} and be shown as-is on the public page.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSheetSubmit} className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={sheetTitle}
                    onChange={(e) => setSheetTitle(e.target.value)}
                    placeholder="e.g. Acrylic rods – price list"
                    required
                  />
                </div>
                <div>
                  <Label>PDF file {editingSheet && '(leave empty to keep current)'}</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setSheetDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Uploading…' : editingSheet ? 'Update' : 'Add sheet'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <ul className="space-y-2">
            {currentFolders.map((folder) => (
              <li
                key={folder.id}
                className="flex items-center justify-between rounded-xl border bg-card p-4"
              >
                <button
                  type="button"
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="flex items-center gap-3 text-left font-medium hover:opacity-80"
                >
                  <FolderOpen className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-700/90 font-semibold">Folder:</span>
                  <span>{folder.title}</span>
                </button>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditFolder(folder)} aria-label="Edit folder">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteFolder(folder)} aria-label="Delete folder">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
            {currentSheets.map((sheet) => (
              <li
                key={sheet.id}
                className="flex items-center justify-between rounded-xl border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{sheet.title}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditSheet(sheet)} aria-label="Edit sheet">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteSheet(sheet)} aria-label="Delete sheet">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
            {currentFolders.length === 0 && currentSheets.length === 0 && (
              <li className="rounded-xl border border-dashed bg-muted/30 p-8 text-center text-muted-foreground">
                {currentFolderId ? 'No folders or sheets in this folder yet. Add a folder or a PDF sheet above.' : 'No folders or sheets yet. Add a folder or a PDF sheet above.'}
              </li>
            )}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}
