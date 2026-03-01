import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, FolderOpen, ChevronRight, ChevronDown, Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { supabase, getStoragePublicUrl } from '@/lib/supabase';
import type { PriceListSheet, PriceListFolder } from '@/lib/supabase';

const BUCKET = 'price-list';

/* ------------------------------------------------------------------ */
/*  Tree builder — unchanged logic                                     */
/* ------------------------------------------------------------------ */
type TreeNode =
  | { type: 'folder'; folder: PriceListFolder; children: TreeNode[] }
  | { type: 'sheet'; sheet: PriceListSheet };

function buildTree(
  folders: PriceListFolder[],
  sheets: PriceListSheet[],
  parentId: string | null,
): TreeNode[] {
  const result: TreeNode[] = [];
  const childFolders = folders
    .filter((f) => f.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order || 0);
  const childSheets = sheets
    .filter((s) => s.folder_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order || 0);
  childFolders.forEach((f) => {
    result.push({ type: 'folder', folder: f, children: buildTree(folders, sheets, f.id) });
  });
  childSheets.forEach((s) => {
    result.push({ type: 'sheet', sheet: s });
  });
  return result;
}

/* ------------------------------------------------------------------ */
/*  Recursive folder tree navigation (sidebar)                         */
/* ------------------------------------------------------------------ */
function FolderTreeNav({
  nodes,
  selectedId,
  onSelect,
  depth = 0,
}: {
  nodes: TreeNode[];
  selectedId: string | null;
  onSelect: (sheet: PriceListSheet) => void;
  depth?: number;
}) {
  const [openFolders, setOpenFolders] = useState<Set<string>>(() => {
    // Auto-open top-level folders
    const ids = new Set<string>();
    if (depth === 0) nodes.forEach((n) => { if (n.type === 'folder') ids.add(n.folder.id); });
    return ids;
  });

  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-0.5">
      {nodes.map((node) => {
        if (node.type === 'folder') {
          const { folder, children } = node;
          const isOpen = openFolders.has(folder.id);
          return (
            <div key={folder.id}>
              <button
                onClick={() => toggleFolder(folder.id)}
                className="w-full flex items-center gap-2 text-left py-2 px-3 rounded-lg hover:bg-black/5 transition-colors group"
                style={{ paddingLeft: `${depth * 16 + 12}px` }}
              >
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-black/30 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-black/30 shrink-0" />
                )}
                <FolderOpen className="w-4 h-4 text-black/40 shrink-0" />
                <span className="text-[13px] font-semibold text-black/70 group-hover:text-black truncate">
                  {folder.title}
                </span>
              </button>
              {isOpen && children.length > 0 && (
                <FolderTreeNav
                  nodes={children}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  depth={depth + 1}
                />
              )}
            </div>
          );
        }

        const { sheet } = node;
        const isActive = selectedId === sheet.id;
        return (
          <button
            key={sheet.id}
            onClick={() => onSelect(sheet)}
            className={`w-full flex items-center gap-2 text-left py-2 px-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-black text-white'
                : 'hover:bg-black/5 text-black/60 hover:text-black'
            }`}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
          >
            <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white/70' : 'text-black/30'}`} />
            <span className="text-[13px] font-medium truncate">{sheet.title}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile sheet selector (dropdown-style for small screens)           */
/* ------------------------------------------------------------------ */
function MobileSheetSelector({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: TreeNode[];
  selectedId: string | null;
  onSelect: (sheet: PriceListSheet) => void;
}) {
  // Flatten all sheets for a simple select dropdown
  const allSheets: { sheet: PriceListSheet; folderPath: string }[] = [];
  function flatten(items: TreeNode[], path: string) {
    items.forEach((node) => {
      if (node.type === 'folder') {
        flatten(node.children, path ? `${path} / ${node.folder.title}` : node.folder.title);
      } else {
        allSheets.push({ sheet: node.sheet, folderPath: path });
      }
    });
  }
  flatten(nodes, '');

  return (
    <div className="lg:hidden mb-6">
      <label className="text-xs font-bold uppercase tracking-wider text-black/40 block mb-2">
        Select a price list
      </label>
      <select
        value={selectedId || ''}
        onChange={(e) => {
          const found = allSheets.find((s) => s.sheet.id === e.target.value);
          if (found) onSelect(found.sheet);
        }}
        className="w-full border border-black/15 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
      >
        <option value="">— Choose a sheet —</option>
        {allSheets.map(({ sheet, folderPath }) => (
          <option key={sheet.id} value={sheet.id}>
            {folderPath ? `${folderPath} / ${sheet.title}` : sheet.title}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PDF Viewer panel                                                   */
/* ------------------------------------------------------------------ */
function PDFViewerPanel({
  sheet,
  pdfUrl,
}: {
  sheet: PriceListSheet | null;
  pdfUrl: string | null;
}) {
  if (!sheet || !pdfUrl) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 min-h-[60vh] lg:min-h-0">
        <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-black/20" />
        </div>
        <p className="text-sm font-medium text-black/40 mb-1">No sheet selected</p>
        <p className="text-xs text-black/25">Choose a price list from the sidebar to view it here.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-[70vh] lg:min-h-0">
      {/* Toolbar — sticky below navbar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-black/8 bg-[#fafaf8] sticky top-[72px] z-10">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-black truncate">{sheet.title}</h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={pdfUrl}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/15 bg-white text-xs font-semibold text-black hover:bg-black hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/15 bg-white text-xs font-semibold text-black hover:bg-black hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in new tab
          </a>
        </div>
      </div>

      {/* PDF iframe */}
      <div className="flex-1 bg-[#f0f0ee]">
        <iframe
          key={sheet.id}
          title={sheet.title}
          src={pdfUrl}
          className="w-full h-full min-h-[70vh]"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function PriceList() {
  const [folders, setFolders] = useState<PriceListFolder[]>([]);
  const [sheets, setSheets] = useState<PriceListSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState<PriceListSheet | null>(null);

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
      console.error('Failed to fetch price list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPdfUrl = (filePath: string) => getStoragePublicUrl(BUCKET, filePath);
  const tree = buildTree(folders, sheets, null);
  const pdfUrl = selectedSheet ? getPdfUrl(selectedSheet.file_path) : null;

  // Auto-select the first sheet when data loads
  useEffect(() => {
    if (selectedSheet || tree.length === 0) return;
    function findFirstSheet(nodes: TreeNode[]): PriceListSheet | null {
      for (const node of nodes) {
        if (node.type === 'sheet') return node.sheet;
        if (node.type === 'folder') {
          const found = findFirstSheet(node.children);
          if (found) return found;
        }
      }
      return null;
    }
    const first = findFirstSheet(tree);
    if (first) setSelectedSheet(first);
  }, [folders, sheets]);

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        <Breadcrumb items={[{ label: 'Price list' }]} />

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <p className="text-sm text-black/40 uppercase tracking-wider">Loading price list...</p>
          </div>
        ) : tree.length === 0 ? (
          /* Empty state */
          <div className="max-w-xl mx-auto px-4 py-32 text-center">
            <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-black/20" />
            </div>
            <p className="font-medium text-black/60 mb-1">No price list content yet</p>
            <p className="text-sm text-black/30 mb-6">
              Folders and sheets will appear here once added from the admin panel.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-black text-white px-5 py-2.5 text-sm font-semibold hover:bg-black/90 transition-colors"
            >
              Contact us for pricing
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile: dropdown selector */}
            <div className="lg:hidden max-w-[1400px] mx-auto px-4 pt-6">
              <h1 className="text-2xl font-bold tracking-tight mb-1">Price List & Catalogue</h1>
              <p className="text-sm text-black/40 mb-6">
                Browse our pricing sheets by category.
              </p>
              <MobileSheetSelector
                nodes={tree}
                selectedId={selectedSheet?.id || null}
                onSelect={setSelectedSheet}
              />
              <PDFViewerPanel sheet={selectedSheet} pdfUrl={pdfUrl} />
            </div>

            {/* Desktop: two-column layout */}
            <div className="hidden lg:flex max-w-[1400px] mx-auto pt-4" style={{ minHeight: 'calc(100vh - 140px)' }}>
              {/* Left sidebar */}
              <aside className="w-72 flex-shrink-0 border-r border-black/8">
                <div className="sticky top-24 h-[calc(100vh-96px)] overflow-y-auto px-4 py-6">
                  <h1 className="text-xl font-bold tracking-tight mb-1">Price List & Catalogue</h1>
                  <p className="text-xs text-black/40 mb-6">
                    Browse our pricing sheets by category.
                  </p>

                  <FolderTreeNav
                    nodes={tree}
                    selectedId={selectedSheet?.id || null}
                    onSelect={setSelectedSheet}
                  />

                  {/* CTA */}
                  <div className="mt-8 pt-6 border-t border-black/8">
                    <p className="text-xs text-black/35 mb-3">
                      Can't find what you need?
                    </p>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-xs font-semibold hover:bg-black/90 transition-colors"
                    >
                      Contact us
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </aside>

              {/* Right panel — PDF viewer */}
              <PDFViewerPanel sheet={selectedSheet} pdfUrl={pdfUrl} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
