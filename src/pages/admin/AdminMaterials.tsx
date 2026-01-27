import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase, Material } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    tier: 'standard' as 'high-performance' | 'engineering' | 'standard',
    description: '',
    maxTemp: '',
    applications: '',
    industries: '',
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('tier', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch materials: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const materialData = {
      name: formData.name,
      fullName: formData.fullName,
      tier: formData.tier,
      description: formData.description,
      maxTemp: formData.maxTemp || null,
      applications: formData.applications ? formData.applications.split(',').map(a => a.trim()) : [],
      industries: formData.industries ? formData.industries.split(',').map(i => i.trim()) : [],
    };

    try {
      if (editingMaterial) {
        const { error } = await supabase
          .from('materials')
          .update(materialData)
          .eq('id', editingMaterial.id);

        if (error) throw error;
        toast.success('Material updated successfully!');
      } else {
        const { error } = await supabase
          .from('materials')
          .insert([materialData]);

        if (error) throw error;
        toast.success('Material created successfully!');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchMaterials();
    } catch (error: any) {
      toast.error('Failed to save material: ' + error.message);
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      fullName: material.fullName,
      tier: material.tier,
      description: material.description,
      maxTemp: material.maxTemp || '',
      applications: material.applications?.join(', ') || '',
      industries: material.industries?.join(', ') || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Material deleted successfully!');
      fetchMaterials();
    } catch (error: any) {
      toast.error('Failed to delete material: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      fullName: '',
      tier: 'standard',
      description: '',
      maxTemp: '',
      applications: '',
      industries: '',
    });
    setEditingMaterial(null);
  };

  const materialsByTier = {
    'high-performance': materials.filter(m => m.tier === 'high-performance'),
    'engineering': materials.filter(m => m.tier === 'engineering'),
    'standard': materials.filter(m => m.tier === 'standard'),
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Material Management</h1>
            <p className="text-muted-foreground">Manage your material catalog</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMaterial ? 'Edit Material' : 'Add New Material'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Material Name (Short) *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="PEEK"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      placeholder="Polyetheretherketone"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tier">Tier *</Label>
                  <Select value={formData.tier} onValueChange={(value: any) => setFormData({ ...formData, tier: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-performance">High-Performance</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="maxTemp">Maximum Temperature</Label>
                  <Input
                    id="maxTemp"
                    value={formData.maxTemp}
                    onChange={(e) => setFormData({ ...formData, maxTemp: e.target.value })}
                    placeholder="250°C"
                  />
                </div>
                <div>
                  <Label htmlFor="applications">Applications (comma-separated)</Label>
                  <Input
                    id="applications"
                    value={formData.applications}
                    onChange={(e) => setFormData({ ...formData, applications: e.target.value })}
                    placeholder="Bearings, Seals, Electrical insulators"
                  />
                </div>
                <div>
                  <Label htmlFor="industries">Industries (comma-separated)</Label>
                  <Input
                    id="industries"
                    value={formData.industries}
                    onChange={(e) => setFormData({ ...formData, industries: e.target.value })}
                    placeholder="Aerospace, Medical, Semiconductor"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingMaterial ? 'Update' : 'Create'} Material
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading materials...</div>
        ) : (
          <div className="space-y-8">
            {(['high-performance', 'engineering', 'standard'] as const).map((tier) => (
              <div key={tier}>
                <h2 className="text-xl font-semibold mb-4 capitalize">{tier.replace('-', ' ')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materialsByTier[tier].map((material) => (
                    <div key={material.id} className="bg-background border border-border rounded-lg p-4">
                      <h3 className="font-semibold mb-1">{material.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{material.fullName}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{material.description}</p>
                      {material.maxTemp && (
                        <p className="text-xs text-muted-foreground mb-2">Max Temp: {material.maxTemp}</p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(material)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(material.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
