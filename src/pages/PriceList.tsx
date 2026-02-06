import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, FolderOpen } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { supabase, getStoragePublicUrl } from '@/lib/supabase';
import type { PriceListSheet, PriceListFolder } from '@/lib/supabase';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const BUCKET = 'price-list';

type TreeNode = { type: 'folder'; folder: PriceListFolder; children: TreeNode[] } | { type: 'sheet'; sheet: PriceListSheet };

function buildTree(
  folders: PriceListFolder[],
  sheets: PriceListSheet[],
  parentId: string | null,
): TreeNode[] {
  const result: TreeNode[] = [];
  const childFolders = folders.filter((f) => f.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order || 0);
  const childSheets = sheets.filter((s) => s.folder_id === parentId).sort((a, b) => a.sort_order - b.sort_order || 0);
  childFolders.forEach((f) => {
    result.push({ type: 'folder', folder: f, children: buildTree(folders, sheets, f.id) });
  });
  childSheets.forEach((s) => {
    result.push({ type: 'sheet', sheet: s });
  });
  return result;
}

function FolderAccordion({ nodes, getPdfUrl }: { nodes: TreeNode[]; getPdfUrl: (path: string) => string }) {
  if (nodes.length === 0) return null;
  return (
    <Accordion type="single" collapsible className="w-full space-y-2 pl-2 border-l-2 border-muted">
      {nodes.map((node) => {
        if (node.type === 'folder') {
          const { folder, children } = node;
          const value = `folder-${folder.id}`;
          return (
            <AccordionItem key={value} value={value} className="rounded-xl border bg-card overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:bg-muted/50">
                <span className="flex items-center gap-2 text-left font-semibold">
                  <FolderOpen className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-amber-700/90">Folder:</span>
                  {folder.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                <FolderAccordion nodes={children} getPdfUrl={getPdfUrl} />
              </AccordionContent>
            </AccordionItem>
          );
        }
        const { sheet } = node;
        const value = `sheet-${sheet.id}`;
        return (
          <AccordionItem key={value} value={value} className="rounded-xl border bg-card overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:bg-muted/50">
              <span className="flex items-center gap-2 text-left font-semibold">
                <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                {sheet.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-0">
              <div className="rounded-lg border bg-muted/20 overflow-hidden">
                <iframe
                  title={sheet.title}
                  src={getPdfUrl(sheet.file_path)}
                  className="w-full min-h-[70vh] aspect-[3/4] max-h-[900px]"
                />
                <div className="flex justify-end p-2 border-t bg-muted/30">
                  <a
                    href={getPdfUrl(sheet.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Open in new tab
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export default function PriceList() {
  const [folders, setFolders] = useState<PriceListFolder[]>([]);
  const [sheets, setSheets] = useState<PriceListSheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <Layout>
      <Breadcrumb items={[{ label: 'Price list' }]} />

      <section className="industrial-section">
        <div className="industrial-container">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-2">Price list & catalogue</h1>
            <p className="text-muted-foreground max-w-3xl">
              Browse by folder and open PDF sheets. Items marked <strong>Folder:</strong> are categories containing more folders or PDFs. Each PDF is shown as-is.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 mt-4 rounded-full bg-black text-white px-5 py-2.5 text-sm font-semibold hover:bg-black/90 transition-colors"
            >
              Ask for your requirements
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Loading price list…</p>
          ) : tree.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No price list content yet.</p>
              <p className="text-sm mt-1">Folders and sheets will appear here once added from the admin panel.</p>
            </div>
          ) : (
            <FolderAccordion nodes={tree} getPdfUrl={getPdfUrl} />
          )}
        </div>
      </section>
    </Layout>
  );
}
