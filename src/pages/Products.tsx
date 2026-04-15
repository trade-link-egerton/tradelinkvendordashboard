import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EditIcon, Trash2Icon, FilterIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { ApiError } from '../lib/api';
import { Product, deleteProduct, listProducts } from '../lib/vendorApi';

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'Active' | 'Draft' | 'Out of Stock';
  image: string;
}

function mapProductToRow(product: Product): ProductRow {
  const stock = Number(product.stock_quantity || 0);
  const statusFromApi = product.status || (product.is_published ? 'active' : 'draft');
  const normalizedStatus: ProductRow['status'] =
    stock <= 0 ? 'Out of Stock' : statusFromApi === 'active' ? 'Active' : 'Draft';

  return {
    id: String(product.id),
    name: product.name,
    category: product.category_name || 'Uncategorized',
    price: Number(product.price || 0),
    stock,
    status: normalizedStatus,
    image:
      product.image_url ||
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=100&h=100&fit=crop'
  };
}

export function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await listProducts();
      setProducts(response.map(mapProductToRow));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.detail
          : 'Failed to fetch products.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success('Product deleted.');
      await loadProducts();
    } catch {
      toast.error('Unable to delete product.');
    }
  };

  const columns: Column<ProductRow>[] = [
    {
      header: 'Product',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image}
            alt={row.name}
            className="w-10 h-10 rounded-lg object-cover border border-[var(--border-color)]"
          />
          <div>
            <p className="font-medium text-[var(--text-primary)]">{row.name}</p>
            <p className="text-xs text-[var(--text-secondary)]">ID: #{row.id}</p>
          </div>
        </div>
      )
    },
    { header: 'Category', accessor: 'category', className: 'text-[var(--text-secondary)]' },
    {
      header: 'Price',
      accessor: (row) => <span className="font-mono">KES {row.price.toLocaleString()}</span>
    },
    {
      header: 'Stock',
      accessor: (row) => (
        <span className={`font-mono ${row.stock === 0 ? 'text-destructive-600' : ''}`}>{row.stock}</span>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <StatusBadge
          status={row.status}
          variant={
            row.status === 'Active' ? 'success' : row.status === 'Out of Stock' ? 'destructive' : 'neutral'
          }
        />
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/products/${row.id}/edit`}
            className="p-1.5 text-[var(--text-secondary)] hover:text-brand-600 rounded-md"
            title="Edit Product"
          >
            <EditIcon size={18} />
          </Link>
          <button
            className="p-1.5 text-[var(--text-secondary)] hover:text-destructive-600 rounded-md"
            title="Delete Product"
            onClick={() => void handleDelete(row.id)}
          >
            <Trash2Icon size={18} />
          </button>
        </div>
      )
    }
  ];

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [products, searchQuery]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">Products</h1>
          <p className="text-[var(--text-secondary)]">
            Manage your inventory, pricing, and product details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary" disabled>
            Export
          </button>
          <Link to="/products/new" className="btn-primary">
            <PlusIcon size={18} /> Add Product
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        searchPlaceholder="Search products by name or category..."
        onSearch={setSearchQuery}
        actions={
          <button className="btn-secondary py-1.5" onClick={() => void loadProducts()} disabled={isLoading}>
            <FilterIcon size={16} /> {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />
    </div>
  );
}
