// components/VaultList.tsx
'use client';

import { useState } from 'react';
import { Copy, Edit2, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { VaultData } from '@/lib/encryption';
import { copyToClipboard } from '@/lib/encryption';

interface VaultItem {
  _id: string;
  data: VaultData;
}

interface Props {
  items: VaultItem[];
  onEdit: (item: VaultItem) => void;
  onDelete: (id: string) => void;
}

export default function VaultList({ items, onEdit, onDelete }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  const handleCopy = async (password: string, id: string) => {
    await copyToClipboard(password);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this vault item? This cannot be undone.')) {
      onDelete(id);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No vault items yet</p>
        <p className="text-sm mt-2">Click "Add Item" to create your first entry</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{item.data.title}</h3>
              <p className="text-gray-600 text-sm">{item.data.username}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 text-gray-500 hover:text-blue-600 transition"
                title="Edit"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="p-1.5 text-gray-500 hover:text-red-600 transition"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 relative">
              <input
                type={visiblePasswords.has(item._id) ? "text" : "password"}
                value={item.data.password}
                readOnly
                className="w-full bg-gray-50 px-3 py-1.5 rounded border border-gray-200"
              />
            </div>
            <button
              onClick={() => togglePasswordVisibility(item._id)}
              className="p-1.5 text-gray-500 hover:text-blue-600 transition"
              title={visiblePasswords.has(item._id) ? "Hide password" : "Show password"}
            >
              {visiblePasswords.has(item._id) ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button
              onClick={() => handleCopy(item.data.password, item._id)}
              className="p-1.5 text-gray-500 hover:text-blue-600 transition"
              title="Copy password"
            >
              <Copy size={18} />
            </button>
          </div>

          {item.data.url && (
            <a
              href={item.data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ExternalLink size={14} />
              {item.data.url}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}