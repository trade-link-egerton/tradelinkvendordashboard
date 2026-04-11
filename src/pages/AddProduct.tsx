import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Info, Plus, Trash2 } from 'lucide-react';
import { FileUpload } from '../components/shared/FileUpload';
type Tab = 'basic' | 'media' | 'pricing' | 'variants' | 'seo';
export function AddProduct() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [variants, setVariants] = useState([
  {
    name: '',
    options: ''
  }]
  );
  const tabs: {
    id: Tab;
    label: string;
  }[] = [
  {
    id: 'basic',
    label: 'Basic Info'
  },
  {
    id: 'media',
    label: 'Media'
  },
  {
    id: 'pricing',
    label: 'Pricing & Stock'
  },
  {
    id: 'variants',
    label: 'Variants'
  },
  {
    id: 'seo',
    label: 'SEO & Tags'
  }];

  const handleAddVariant = () => {
    setVariants([
    ...variants,
    {
      name: '',
      options: ''
    }]
    );
  };
  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };
  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors">
            
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
              Add New Product
            </h1>
            <p className="text-[var(--text-secondary)]">
              Create a new listing in your store.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--text-secondary)] mr-2">
            Status:
          </span>
          <select className="input-field py-1.5 bg-[var(--bg-primary)] w-32">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
          <button className="btn-primary">
            <Save size={18} /> Save Product
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0">
          <div className="card p-2 sticky top-24">
            <nav className="space-y-1">
              {tabs.map((tab) =>
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'}`}>
                
                  {tab.label}
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <div className="card p-6">
            {activeTab === 'basic' &&
            <div className="space-y-6 animate-in fade-in">
                <h2 className="text-lg font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
                  Basic Information
                </h2>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Product Title{' '}
                    <span className="text-destructive-500">*</span>
                  </label>
                  <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Samsung Galaxy A54 5G" />
                
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Description
                  </label>
                  <div className="border border-[var(--border-color)] rounded-lg overflow-hidden">
                    <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] p-2 flex gap-2">
                      <button className="p-1.5 hover:bg-[var(--bg-primary)] rounded text-[var(--text-secondary)] font-bold">
                        B
                      </button>
                      <button className="p-1.5 hover:bg-[var(--bg-primary)] rounded text-[var(--text-secondary)] italic">
                        I
                      </button>
                      <button className="p-1.5 hover:bg-[var(--bg-primary)] rounded text-[var(--text-secondary)] underline">
                        U
                      </button>
                    </div>
                    <textarea
                    className="w-full p-4 bg-transparent focus:outline-none text-[var(--text-primary)] min-h-[150px] resize-y"
                    placeholder="Describe your product...">
                  </textarea>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Category <span className="text-destructive-500">*</span>
                    </label>
                    <select className="input-field bg-[var(--bg-primary)]">
                      <option value="">Select Category</option>
                      <option value="electronics">Electronics</option>
                      <option value="phones">
                        &nbsp;&nbsp;Phones & Tablets
                      </option>
                      <option value="laptops">&nbsp;&nbsp;Laptops</option>
                      <option value="fashion">Fashion</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Brand
                    </label>
                    <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Samsung" />
                  
                  </div>
                </div>
              </div>
            }

            {activeTab === 'media' &&
            <div className="space-y-6 animate-in fade-in">
                <h2 className="text-lg font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
                  Product Images
                </h2>

                <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-lg flex items-start gap-3 border border-brand-100 dark:border-brand-900/50">
                  <Info
                  className="text-brand-600 dark:text-brand-400 shrink-0 mt-0.5"
                  size={18} />
                
                  <p className="text-sm text-brand-800 dark:text-brand-300">
                    Upload up to 8 images. The first image will be used as the
                    primary thumbnail. Recommended size: 1080x1080px (Square).
                  </p>
                </div>

                <FileUpload multiple accept="image/*" />
              </div>
            }

            {activeTab === 'pricing' &&
            <div className="space-y-6 animate-in fade-in">
                <h2 className="text-lg font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
                  Pricing & Inventory
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Price (KES){' '}
                      <span className="text-destructive-500">*</span>
                    </label>
                    <input
                    type="number"
                    className="input-field font-mono"
                    placeholder="0.00" />
                  
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Compare-at Price (KES)
                    </label>
                    <input
                    type="number"
                    className="input-field font-mono"
                    placeholder="0.00" />
                  
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      To show a reduced price, move the original price here.
                    </p>
                  </div>
                </div>

                <div className="border-t border-[var(--border-color)] pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      SKU (Stock Keeping Unit)
                    </label>
                    <input
                    type="text"
                    className="input-field font-mono"
                    placeholder="e.g. SAM-A54-BLK" />
                  
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Barcode (ISBN, UPC, GTIN)
                    </label>
                    <input
                    type="text"
                    className="input-field font-mono"
                    placeholder="Optional" />
                  
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Available Quantity{' '}
                      <span className="text-destructive-500">*</span>
                    </label>
                    <input
                    type="number"
                    className="input-field font-mono"
                    placeholder="0" />
                  
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                    type="number"
                    className="input-field font-mono"
                    placeholder="5" />
                  
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                  type="checkbox"
                  id="backorder"
                  className="w-4 h-4 rounded border-[var(--border-color)] text-brand-600 focus:ring-brand-500" />
                
                  <label
                  htmlFor="backorder"
                  className="text-sm text-[var(--text-primary)]">
                  
                    Continue selling when out of stock
                  </label>
                </div>
              </div>
            }

            {activeTab === 'variants' &&
            <div className="space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                  <h2 className="text-lg font-heading font-semibold text-[var(--text-primary)]">
                    Product Variants
                  </h2>
                </div>

                <p className="text-sm text-[var(--text-secondary)]">
                  Does this product have options, like size or color?
                </p>

                <div className="space-y-4">
                  {variants.map((variant, index) =>
                <div
                  key={index}
                  className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)]/50">
                  
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-medium text-[var(--text-primary)]">
                          Option {index + 1}
                        </h4>
                        {variants.length > 1 &&
                    <button
                      onClick={() => handleRemoveVariant(index)}
                      className="text-destructive-600 hover:text-destructive-700 text-sm flex items-center gap-1">
                      
                            <Trash2 size={14} /> Remove
                          </button>
                    }
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                            Option Name
                          </label>
                          <input
                        type="text"
                        className="input-field py-1.5 text-sm"
                        placeholder="e.g. Size, Color"
                        value={variant.name}
                        onChange={() => {}} />
                      
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                            Option Values (comma separated)
                          </label>
                          <input
                        type="text"
                        className="input-field py-1.5 text-sm"
                        placeholder="e.g. Small, Medium, Large"
                        value={variant.options}
                        onChange={() => {}} />
                      
                        </div>
                      </div>
                    </div>
                )}
                </div>

                <button
                onClick={handleAddVariant}
                className="btn-secondary text-sm">
                
                  <Plus size={16} /> Add another option
                </button>
              </div>
            }

            {activeTab === 'seo' &&
            <div className="space-y-6 animate-in fade-in">
                <h2 className="text-lg font-heading font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
                  Search Engine Optimization
                </h2>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Page Title
                  </label>
                  <input
                  type="text"
                  className="input-field"
                  placeholder="Leave blank to use product title" />
                
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    0 of 70 characters used
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Meta Description
                  </label>
                  <textarea
                  className="input-field min-h-[100px]"
                  placeholder="Brief description for search results...">
                </textarea>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    0 of 320 characters used
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                    Product Tags
                  </label>
                  <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. smartphone, android, 5g (comma separated)" />
                
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

}