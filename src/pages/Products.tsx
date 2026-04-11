import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MoreVerticalIcon,
  EditIcon,
  CopyIcon,
  Trash2Icon,
  EyeOffIcon,
  FilterIcon } from
'lucide-react';
import { DataTable, Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
// Mock Data
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'Active' | 'Draft' | 'Out of Stock';
  image: string;
}
const mockProducts: Product[] = [
{
  id: '1',
  name: 'Samsung Galaxy A54 5G',
  category: 'Electronics > Phones',
  price: 45000,
  stock: 12,
  status: 'Active',
  image:
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100&h=100&fit=crop'
},
{
  id: '2',
  name: 'Sony WH-1000XM5 Headphones',
  category: 'Electronics > Audio',
  price: 35000,
  stock: 5,
  status: 'Active',
  image:
  'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=100&h=100&fit=crop'
},
{
  id: '3',
  name: 'Anker PowerCore 20K',
  category: 'Electronics > Accessories',
  price: 6500,
  stock: 0,
  status: 'Out of Stock',
  image:
  'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=100&h=100&fit=crop'
},
{
  id: '4',
  name: "Men's Classic Leather Watch",
  category: 'Fashion > Watches',
  price: 12500,
  stock: 8,
  status: 'Active',
  image:
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=100&h=100&fit=crop'
},
{
  id: '5',
  name: 'Nike Air Max 270',
  category: 'Fashion > Shoes',
  price: 18000,
  stock: 24,
  status: 'Active',
  image:
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop'
},
{
  id: '6',
  name: 'MacBook Pro M2 14"',
  category: 'Electronics > Laptops',
  price: 285000,
  stock: 3,
  status: 'Draft',
  image:
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop'
},
{
  id: '7',
  name: 'Logitech MX Master 3S',
  category: 'Electronics > Accessories',
  price: 14500,
  stock: 15,
  status: 'Active',
  image:
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop'
}];

export function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const columns: Column<Product>[] = [
  {
    header: 'Product',
    accessor: (row) =>
    <div className="flex items-center gap-3">
          <img
        src={row.image}
        alt={row.name}
        className="w-10 h-10 rounded-lg object-cover border border-[var(--border-color)]" />
      
          <div>
            <p className="font-medium text-[var(--text-primary)]">{row.name}</p>
            <p className="text-xs text-[var(--text-secondary)]">
              ID: #{row.id.padStart(4, '0')}
            </p>
          </div>
        </div>

  },
  {
    header: 'Category',
    accessor: 'category',
    className: 'text-[var(--text-secondary)]'
  },
  {
    header: 'Price',
    accessor: (row) =>
    <span className="font-mono">KES {row.price.toLocaleString()}</span>

  },
  {
    header: 'Stock',
    accessor: (row) =>
    <span
      className={`font-mono ${row.stock === 0 ? 'text-destructive-600' : ''}`}>
      
          {row.stock}
        </span>

  },
  {
    header: 'Status',
    accessor: (row) =>
    <StatusBadge
      status={row.status}
      variant={
      row.status === 'Active' ?
      'success' :
      row.status === 'Out of Stock' ?
      'destructive' :
      'neutral'
      } />


  },
  {
    header: '',
    accessor: (row) =>
    <div className="flex justify-end">
          <button className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-md">
            <MoreVerticalIcon size={18} />
          </button>
        </div>

  }];

  const filteredProducts = mockProducts.filter(
    (p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
            Products
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage your inventory, pricing, and product details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">Export</button>
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
        <button className="btn-secondary py-1.5">
            <FilterIcon size={16} /> Filter
          </button>
        } />
      
    </div>);

}