import React from 'react';
import {
  Plus,
  ChevronRight,
  Folder,
  FolderOpen,
  MoreVertical,
  Edit,
  Trash2 } from
'lucide-react';
const mockCategories = [
{
  id: '1',
  name: 'Electronics',
  count: 145,
  isOpen: true,
  children: [
  {
    id: '1-1',
    name: 'Phones & Tablets',
    count: 56
  },
  {
    id: '1-2',
    name: 'Laptops & Computers',
    count: 42
  },
  {
    id: '1-3',
    name: 'Audio & Headphones',
    count: 28
  },
  {
    id: '1-4',
    name: 'Accessories',
    count: 19
  }]

},
{
  id: '2',
  name: 'Fashion',
  count: 89,
  isOpen: false,
  children: [
  {
    id: '2-1',
    name: "Men's Clothing",
    count: 34
  },
  {
    id: '2-2',
    name: "Women's Clothing",
    count: 41
  },
  {
    id: '2-3',
    name: 'Shoes',
    count: 14
  }]

},
{
  id: '3',
  name: 'Home & Living',
  count: 67,
  isOpen: false,
  children: []
}];

export function Categories() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
            Categories
          </h1>
          <p className="text-[var(--text-secondary)]">
            Organize your products into categories for easier navigation.
          </p>
        </div>
        <button className="btn-primary">
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between">
          <span className="font-medium text-[var(--text-primary)]">
            Category Tree
          </span>
          <span className="text-sm text-[var(--text-secondary)]">
            Products Count
          </span>
        </div>

        <div className="p-2">
          {mockCategories.map((category) =>
          <div key={category.id} className="mb-1">
              <div
              className={`flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors group ${category.isOpen ? 'bg-[var(--bg-secondary)]/50' : ''}`}>
              
                <div className="flex items-center gap-3">
                  <button className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    {category.isOpen ?
                  <FolderOpen size={18} className="text-brand-500" /> :

                  <Folder size={18} />
                  }
                  </button>
                  <span className="font-medium text-[var(--text-primary)]">
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[var(--text-secondary)] w-12 text-right">
                    {category.count}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-[var(--text-secondary)] hover:text-brand-600 rounded">
                      <Edit size={16} />
                    </button>
                    <button className="p-1.5 text-[var(--text-secondary)] hover:text-destructive-600 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {category.isOpen && category.children.length > 0 &&
            <div className="ml-6 pl-4 border-l border-[var(--border-color)] mt-1 space-y-1">
                  {category.children.map((child) =>
              <div
                key={child.id}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors group">
                
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-px bg-[var(--border-color)]"></span>
                        <span className="text-[var(--text-primary)]">
                          {child.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[var(--text-secondary)] w-12 text-right">
                          {child.count}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-[var(--text-secondary)] hover:text-brand-600 rounded">
                            <Edit size={16} />
                          </button>
                          <button className="p-1.5 text-[var(--text-secondary)] hover:text-destructive-600 rounded">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
              )}
                  <button className="flex items-center gap-2 p-2.5 text-sm text-brand-600 hover:text-brand-700 font-medium ml-4">
                    <Plus size={16} /> Add Subcategory
                  </button>
                </div>
            }
            </div>
          )}
        </div>
      </div>
    </div>);

}