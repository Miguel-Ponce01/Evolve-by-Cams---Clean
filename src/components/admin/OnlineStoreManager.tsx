'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  Package,
  DollarSign
} from 'lucide-react';

interface StoreProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  sold: number;
  category: string;
}

export default function OnlineStoreManager() {
  const [products, setProducts] = useState<StoreProduct[]>([
    { id: '1', name: 'Evolve Signature Grip Socks', price: 350, stock: 45, sold: 18, category: 'Apparel' },
    { id: '2', name: 'Liquid Grip Chalk (100ml)', price: 200, stock: 30, sold: 14, category: 'Accessories' },
    { id: '3', name: 'Evolve Microfiber Grip Towel', price: 450, stock: 20, sold: 9, category: 'Accessories' },
    { id: '4', name: 'Premium Non-Slip Yoga Mat', price: 1200, stock: 15, sold: 6, category: 'Equipment' },
    { id: '5', name: 'Reformer Resistance Loop Bands', price: 550, stock: 25, sold: 11, category: 'Equipment' },
  ]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(350);
  const [stock, setStock] = useState<number>(20);
  const [category, setCategory] = useState('Accessories');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setName('');
    setPrice(350);
    setStock(20);
    setCategory('Accessories');
    setEditingId(null);
    setShowAddModal(true);
  };

  const handleEditProduct = (p: StoreProduct) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(p.price);
    setStock(p.stock);
    setCategory(p.category);
    setShowAddModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      setProducts(prev =>
        prev.map(p => (p.id === editingId ? { ...p, name, price, stock, category } : p))
      );
      setToastMessage('Product updated successfully!');
    } else {
      const newProd: StoreProduct = {
        id: Date.now().toString(),
        name,
        price,
        stock,
        sold: 0,
        category
      };
      setProducts(prev => [newProd, ...prev]);
      setToastMessage('New product added to store!');
    }

    setShowAddModal(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setToastMessage('Product removed from store.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141416] p-6 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#C9A961]" />
            <span>Evolve Online Store & Merch Catalog</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage online shop merchandise, track inventory stock, and edit pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                viewMode === 'list' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <List size={14} />
              <span>List</span>
            </button>
          </div>

          {/* Add Product Button */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#C9A961] hover:bg-[#b09352] text-black font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-[#C9A961]/10 transition-all"
          >
            <Plus size={16} />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Modal Form for Add/Edit */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">
              {editingId ? 'Edit Store Product' : 'Add New Store Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evolve Grip Socks"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C9A961]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Price (PHP)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={e => setPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-[#C9A961]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={e => setStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-[#C9A961]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#C9A961]"
                >
                  <option value="Accessories">Accessories</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Supplements">Supplements</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C9A961] text-black font-bold rounded-xl hover:bg-[#b09352]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid or List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div
              key={p.id}
              className="bg-[#141416] p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                    {p.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditProduct(p)}
                      className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1 text-zinc-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{p.name}</h3>
                <p className="text-xl font-black text-[#C9A961] font-mono">₱{p.price.toLocaleString()}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Stock: <strong className="text-emerald-400">{p.stock} units</strong></span>
                <span className="text-zinc-500">Sold: {p.sold}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#141416] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900 text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Total Sold</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-zinc-900/40">
                  <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                  <td className="py-3 px-4 font-mono text-zinc-400">{p.category}</td>
                  <td className="py-3 px-4 font-mono text-[#C9A961] font-bold">₱{p.price.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400">{p.stock} units</td>
                  <td className="py-3 px-4 font-mono text-zinc-400">{p.sold}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleEditProduct(p)}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="px-2 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded text-[10px]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
