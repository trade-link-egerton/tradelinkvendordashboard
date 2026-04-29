import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, Loader2, Package, Tag, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  createProduct,
  getProduct,
  listCategories,
  ProductStatus,
  updateProduct
} from '../lib/vendorApi';

interface ProductFormState {
  name: string;
  description: string;
  category_id: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  status: ProductStatus;
}

const INITIAL_STATE: ProductFormState = {
  name: '',
  description: '',
  category_id: '',
  price: 0,
  stock_quantity: 0,
  image_url: '',
  status: 'draft'
};

export function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState<ProductFormState>(INITIAL_STATE);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      try {
        const categoriesResponse = await listCategories();
        setCategories(
          categoriesResponse.map((category) => ({ id: String(category.id), name: category.name }))
        );

        if (id) {
          const product = await getProduct(id);
          setForm({
            name: product.name || '',
            description: product.description || '',
            category_id: product.category_id || '',
            price: Number(product.price || 0),
            stock_quantity: Number(product.stock_quantity || 0),
            image_url: product.image_url || '',
            status: (product.status as ProductStatus) || 'draft'
          });
        }
      } catch (error) {
        toast.error('Failed to load product form data.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadInitial();
  }, [id]);

  const handleChange =
    (field: keyof ProductFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        field === 'price' || field === 'stock_quantity'
          ? Number(event.target.value)
          : event.target.value;

      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...form,
        category_id: form.category_id || undefined,
        image_url: form.image_url || undefined,
      };

      if (id) {
        await updateProduct(id, payload);
        toast.success('Product updated successfully.');
      } else {
        await createProduct(payload);
        toast.success('Product created successfully.');
      }

      navigate('/products');
    } catch {
      toast.error('Unable to save product. Check required fields.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[var(--text-secondary)] animate-pulse">Fetching product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className="group p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] transition-all"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {isEditMode ? 'Edit Product' : 'New Listing'}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              {isEditMode ? `ID: ${id}` : 'Create a new product for your digital storefront.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border-color)] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm disabled:opacity-50 transition-all"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? 'Saving...' : 'Publish Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <section className="bg-white rounded-2xl border border-[var(--border-color)] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-50">
              <Info size={18} className="text-blue-500" />
              <h2 className="font-bold text-lg">General Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g., Premium Leather Jacket"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  value={form.name}
                  onChange={handleChange('name')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Description</label>
                <textarea
                  placeholder="Describe the features, materials, and benefits..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none min-h-[180px]"
                  value={form.description}
                  onChange={handleChange('description')}
                />
              </div>
            </div>
          </section>

          {/* Pricing and Inventory */}
          <section className="bg-white rounded-2xl border border-[var(--border-color)] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-50">
              <Package size={18} className="text-orange-500" />
              <h2 className="font-bold text-lg">Pricing & Inventory</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Price (KES)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">KES</span>
                  <input
                    type="number"
                    className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-mono"
                    value={form.price}
                    onChange={handleChange('price')}
                    min={0}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Available Stock</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-mono"
                  value={form.stock_quantity}
                  onChange={handleChange('stock_quantity')}
                  min={0}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Category */}
          <section className="bg-white rounded-2xl border border-[var(--border-color)] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={18} className="text-purple-500" />
              <h2 className="font-bold text-lg">Organization</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Status</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={form.status}
                  onChange={handleChange('status')}
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="active">Active (Public)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Category</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={form.category_id}
                  onChange={handleChange('category_id')}
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Media */}
          <section className="bg-white rounded-2xl border border-[var(--border-color)] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon size={18} className="text-green-500" />
              <h2 className="font-bold text-lg">Product Media</h2>
            </div>
            <div className="space-y-4">
              <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                {form.image_url ? (
                  <img 
                    src={form.image_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x400?text=Invalid+URL')}
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-xs text-gray-400 font-medium">Image preview will appear here</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs font-mono"
                  value={form.image_url}
                  onChange={handleChange('image_url')}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}