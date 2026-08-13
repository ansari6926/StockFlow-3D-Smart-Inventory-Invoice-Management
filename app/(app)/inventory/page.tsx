'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/actions/products';
import { formatCurrency, isLowStock } from '@/lib/utils';
import type { Product, ProductFormInput } from '@/lib/types';

type SortField = 'name' | 'sku' | 'stock_quantity' | 'price';
type SortDir = 'asc' | 'desc';

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Peripherals', 'Storage', 'Accessories', 'Networking', 'General'];

function ProductForm({
  product,
  onSubmit,
  onCancel,
  loading,
}: {
  product?: Product;
  onSubmit: (data: ProductFormInput) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<ProductFormInput>({
    sku: product?.sku || '',
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'General',
    price: product?.price || 0,
    stock_quantity: product?.stock_quantity || 0,
    reorder_threshold: product?.reorder_threshold || 10,
  });

  function set(field: keyof ProductFormInput, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">SKU *</label>
        <input
          value={form.sku}
          onChange={(e) => set('sku', e.target.value)}
          placeholder="e.g. ELC-001"
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
        <select
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {CATEGORIES.filter((c) => c !== 'All').map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Product Name *</label>
        <input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Product name"
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
        <input
          value={form.description || ''}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Optional description"
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Price ($) *</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={form.price}
          onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Stock Quantity *</label>
        <input
          type="number"
          min="0"
          step="1"
          value={form.stock_quantity}
          onChange={(e) => set('stock_quantity', parseInt(e.target.value) || 0)}
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Reorder Threshold</label>
        <input
          type="number"
          min="0"
          step="1"
          value={form.reorder_threshold}
          onChange={(e) => set('reorder_threshold', parseInt(e.target.value) || 0)}
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="sm:col-span-2 flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" /> Cancel
        </Button>
        <Button
          type="button"
          variant="gradient"
          size="sm"
          loading={loading}
          onClick={() => onSubmit(form)}
        >
          <Check className="h-4 w-4" />
          {product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function loadProducts() {
    setLoading(true);
    const { data, error } = await getProducts();
    if (data) setProducts(data);
    if (error) console.error(error);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const filtered = products
    .filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        (categoryFilter === 'All' || p.category === categoryFilter) &&
        (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'sku') cmp = a.sku.localeCompare(b.sku);
      else if (sortField === 'stock_quantity') cmp = a.stock_quantity - b.stock_quantity;
      else if (sortField === 'price') cmp = a.price - b.price;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  }

  async function handleCreate(data: ProductFormInput) {
    setFormError(null);
    startTransition(async () => {
      const result = await createProduct(data);
      if (result.error) {
        setFormError(result.error);
      } else {
        setShowAddForm(false);
        setFormSuccess('Product added successfully!');
        setTimeout(() => setFormSuccess(null), 3000);
        loadProducts();
      }
    });
  }

  async function handleUpdate(data: ProductFormInput) {
    if (!editingProduct) return;
    setFormError(null);
    startTransition(async () => {
      const result = await updateProduct(editingProduct.id, data);
      if (result.error) {
        setFormError(result.error);
      } else {
        setEditingProduct(null);
        setFormSuccess('Product updated successfully!');
        setTimeout(() => setFormSuccess(null), 3000);
        loadProducts();
      }
    });
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result.error) {
        setFormError(result.error);
      } else {
        setFormSuccess('Product deleted.');
        setTimeout(() => setFormSuccess(null), 3000);
        loadProducts();
      }
    });
  }

  const lowStockCount = products.filter(isLowStock).length;

  return (
    <div>
      <Navbar title="Inventory" subtitle="Manage your product catalog" />
      <div className="p-6 space-y-4">
        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">
            <strong className="text-foreground">{products.length}</strong> products
          </span>
          {lowStockCount > 0 && (
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {lowStockCount} low stock
            </Badge>
          )}
        </div>

        {/* Alerts */}
        {formSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500" role="status">
            {formSuccess}
          </div>
        )}
        {formError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {formError}
          </div>
        )}

        {/* Controls */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or SKU..."
                  aria-label="Search products"
                  className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="flex h-9 rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => { setShowAddForm(true); setEditingProduct(null); setFormError(null); }}
                id="add-product-btn"
              >
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <h3 className="text-sm font-semibold mb-3">Add New Product</h3>
                <ProductForm onSubmit={handleCreate} onCancel={() => { setShowAddForm(false); setFormError(null); }} loading={isPending} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground">Loading products...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Products table">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => toggleSort('sku')} className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
                          SKU <SortIcon field="sku" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => toggleSort('name')} className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
                          Name <SortIcon field="name" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                      <th className="px-4 py-3 text-right">
                        <button onClick={() => toggleSort('price')} className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground ml-auto">
                          Price <SortIcon field="price" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-right">
                        <button onClick={() => toggleSort('stock_quantity')} className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground ml-auto">
                          Stock <SortIcon field="stock_quantity" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((product) => (
                      <>
                        <tr key={product.id} className="table-row-hover">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.sku}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.description && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs">{product.category}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">{formatCurrency(product.price)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className={isLowStock(product) ? 'font-semibold text-orange-500' : 'font-semibold'}>
                                {product.stock_quantity}
                              </span>
                              {isLowStock(product) && (
                                <Badge variant="warning" className="text-[10px] gap-1">
                                  <AlertTriangle className="h-2.5 w-2.5" /> Low
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => { setEditingProduct(product); setShowAddForm(false); setFormError(null); }}
                                aria-label={`Edit ${product.name}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(product)}
                                aria-label={`Delete ${product.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {editingProduct?.id === product.id && (
                          <tr key={`edit-${product.id}`}>
                            <td colSpan={6} className="px-4 py-4 bg-muted/20">
                              <ProductForm
                                product={editingProduct}
                                onSubmit={handleUpdate}
                                onCancel={() => { setEditingProduct(null); setFormError(null); }}
                                loading={isPending}
                              />
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
