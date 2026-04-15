import React, { useEffect, useState } from 'react';
import { Plus, Folder, FolderOpen, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Category, createCategory, deleteCategory, getCategoryTree } from '../lib/vendorApi';

function CategoryRow({
  category,
  depth,
  onDelete
}: {
  category: Category;
  depth: number;
  onDelete: (id: string) => Promise<void>;
}) {
  const hasChildren = Boolean(category.children && category.children.length > 0);

  return (
    <div className="mb-1" style={{ marginLeft: `${depth * 16}px` }}>
      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors group">
        <div className="flex items-center gap-3">
          <span className="text-[var(--text-secondary)]">
            {hasChildren ? <FolderOpen size={18} className="text-brand-500" /> : <Folder size={18} />}
          </span>
          <span className="font-medium text-[var(--text-primary)]">{category.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--text-secondary)] w-12 text-right">
            {category.product_count || 0}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 text-[var(--text-secondary)] hover:text-brand-600 rounded" disabled>
              <Edit size={16} />
            </button>
            <button
              className="p-1.5 text-[var(--text-secondary)] hover:text-destructive-600 rounded"
              onClick={() => void onDelete(String(category.id))}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {hasChildren && (
        <div className="pl-4 border-l border-[var(--border-color)] mt-1">
          {category.children?.map((child) => (
            <CategoryRow key={String(child.id)} category={child} depth={depth + 1} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      const response = await getCategoryTree();
      setCategories(response);
    } catch {
      toast.error('Failed to load categories.');
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Enter category name first.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCategory({ name: newCategoryName.trim() });
      setNewCategoryName('');
      toast.success('Category created.');
      await loadCategories();
    } catch {
      toast.error('Unable to create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success('Category deleted.');
      await loadCategories();
    } catch {
      toast.error('Unable to delete category.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">Categories</h1>
          <p className="text-[var(--text-secondary)]">
            Organize your products into categories for easier navigation.
          </p>
        </div>
      </div>

      <div className="card p-4 flex gap-3 items-center">
        <input
          className="input-field"
          placeholder="Create a new category"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button className="btn-primary" onClick={() => void handleCreate()} disabled={isSubmitting}>
          <Plus size={18} /> {isSubmitting ? 'Saving...' : 'Add Category'}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between">
          <span className="font-medium text-[var(--text-primary)]">Category Tree</span>
          <span className="text-sm text-[var(--text-secondary)]">Products Count</span>
        </div>

        <div className="p-2">
          {categories.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] p-4">No categories found.</p>
          ) : (
            categories.map((category) => (
              <CategoryRow
                key={String(category.id)}
                category={category}
                depth={0}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
