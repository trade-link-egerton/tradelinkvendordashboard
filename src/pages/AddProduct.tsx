import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
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
            status: product.status || 'draft'
          });
        }
      } catch {
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
        name: form.name,
        description: form.description,
        category_id: form.category_id || undefined,
        price: form.price,
        stock_quantity: form.stock_quantity,
        image_url: form.image_url || undefined,
        status: form.status
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
      toast.error('Unable to save product. Check required fields and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-[var(--text-secondary)]">{isEditMode ? 'Update product details.' : 'Create a new listing in your store.'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Product Name
            </label>
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={handleChange('name')}
              required
              disabled={isLoading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Description
            </label>
            <textarea
              className="input-field min-h-[120px]"
              value={form.description}
              onChange={handleChange('description')}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Category</label>
            <select
              className="input-field bg-[var(--bg-primary)]"
              value={form.category_id}
              onChange={handleChange('category_id')}
              disabled={isLoading}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Status</label>
            <select
              className="input-field bg-[var(--bg-primary)]"
              value={form.status}
              onChange={handleChange('status')}
              disabled={isLoading}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Price (KES)</label>
            <input
              type="number"
              className="input-field font-mono"
              value={form.price}
              onChange={handleChange('price')}
              min={0}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Stock Quantity</label>
            <input
              type="number"
              className="input-field font-mono"
              value={form.stock_quantity}
              onChange={handleChange('stock_quantity')}
              min={0}
              required
              disabled={isLoading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Image URL
            </label>
            <input
              type="url"
              className="input-field"
              value={form.image_url}
              onChange={handleChange('image_url')}
              placeholder="https://example.com/product-image.jpg"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={isSaving || isLoading}>
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
