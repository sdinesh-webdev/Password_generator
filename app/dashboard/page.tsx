'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { Plus, Lock, AlertCircle } from 'lucide-react';
import VaultList from '@/components/VaultList';
import VaultItemModal from '@/components/VaultItemModal';
import SearchBar from '@/components/SearchBar';
import { encryptData, decryptData, VaultData } from '@/lib/encryption';

interface VaultItem {
  _id: string;
  encryptedData: string;
}

interface DecryptedItem {
  _id: string;
  data: VaultData;
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [items, setItems] = useState<DecryptedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DecryptedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DecryptedItem | null>(null);

  // ✅ Fetch items
  const fetchItems = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching for user:', user.id);

      const res = await fetch('/api/vault', {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch items');
      }

      const data = await res.json();
      console.log('Items received:', data.items?.length || 0);

      if (!data.items?.length) {
        setItems([]);
        setFilteredItems([]);
        return;
      }

      // ✅ Decrypt items safely
      const decrypted: DecryptedItem[] = [];
      
      for (const item of data.items) {
        try {
          console.log('Attempting to decrypt item:', item._id);
          const decryptedData = decryptData(item.encryptedData, user.id);
          
          if (!decryptedData) {
            console.error('Decryption returned null for item:', item._id);
            continue; // Skip failed items instead of showing error placeholders
          }
          
          // Validate decrypted data has required fields
          if (!decryptedData.title || !decryptedData.username || !decryptedData.password) {
            console.error('Decrypted data missing required fields:', item._id);
            continue;
          }
          
          decrypted.push({ _id: item._id, data: decryptedData });
          console.log('Successfully decrypted item:', item._id);
        } catch (err) {
          console.error('Failed to decrypt item:', item._id, err);
          continue;
        }
      }

      console.log('Total items:', data.items.length, 'Successfully decrypted:', decrypted.length);
      setItems(decrypted);
      setFilteredItems(decrypted);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ✅ Fetch once when user is ready
  useEffect(() => {
    if (isLoaded && user?.id) fetchItems();
  }, [isLoaded, user?.id, fetchItems]);

  // ✅ Improved search functionality
  useEffect(() => {
    try {
      // Reset to show all items if search is empty
      if (!searchQuery.trim()) {
        setFilteredItems(items);
        return;
      }

      const query = searchQuery.toLowerCase().trim();
      
      const filtered = items.filter(item => {
        // Safely check each field with null/undefined handling
        const title = item.data?.title?.toLowerCase() || '';
        const username = item.data?.username?.toLowerCase() || '';
        const url = item.data?.url?.toLowerCase() || '';
        const notes = item.data?.notes?.toLowerCase() || '';

        // Check if any field contains the search query
        return (
          title.includes(query) ||
          username.includes(query) ||
          url.includes(query) ||
          notes.includes(query)
        );
      });

      console.log(`Search: "${query}" found ${filtered.length} matches out of ${items.length} items`);
      setFilteredItems(filtered);
      
    } catch (error) {
      console.error('Search error:', error);
      // On error, show all items
      setFilteredItems(items);
    }
  }, [searchQuery, items]);

  // ✅ Save (Add / Edit)
  const handleSave = async (data: VaultData) => {
    if (!user?.id) {
      alert('Not authenticated');
      return;
    }

    try {
      const encrypted = encryptData(data, user.id);
      const url = editingItem ? `/api/vault/${editingItem._id}` : '/api/vault';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encryptedData: encrypted }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Save failed');
      }

      setModalOpen(false);
      setEditingItem(null);
      await fetchItems();
    } catch (error: any) {
      console.error('Save error:', error);
      alert(error.message || 'Failed to save');
    }
  };

  // ✅ Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      const res = await fetch(`/api/vault/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setItems(prev => prev.filter(item => item._id !== id));
      setFilteredItems(prev => prev.filter(item => item._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (item: DecryptedItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  // ✅ Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Lock className="animate-pulse text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading your vault...</p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Vault</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchItems}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ✅ Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Lock className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">Password Vault</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[250px]">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        {/* Debug preview (optional) */}
        {/* <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(filteredItems, null, 2)}</pre> */}

        {filteredItems.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <Lock className="text-gray-400 mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Your vault is empty</h3>
            <p className="text-gray-500 mb-6">Start by adding your first password</p>
            <button
              onClick={handleAddNew}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add Your First Item
            </button>
          </div>
        )}

        {filteredItems.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found for "{searchQuery}"</p>
          </div>
        )}

        {filteredItems.length > 0 && (
          <VaultList items={filteredItems} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </main>

      <VaultItemModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        initialData={editingItem?.data}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      />
    </div>
  );
}
