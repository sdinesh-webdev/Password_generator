// components/PasswordGenerator.tsx
'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { generatePassword, calculateStrength, PasswordOptions } from '@/lib/passwordUtils';
import { copyToClipboard } from '@/lib/encryption';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeNumbers: true,
    includeSymbols: true,
    excludeLookAlikes: false
  });

  const strength = calculateStrength(password);

  useEffect(() => {
    setPassword(generatePassword(options));
  }, []);

  const handleGenerate = () => {
    setPassword(generatePassword(options));
    setCopied(false);
  };

  const handleCopy = async () => {
    await copyToClipboard(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrengthColor = () => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Password Generator</h2>
      
      {/* Password Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 break-all font-mono text-lg">
        {password || 'Click generate'}
      </div>

      {/* Strength Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Strength</span>
          <span className="font-semibold">{strength}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${getStrengthColor()}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Length Slider */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Length: {options.length}
        </label>
        <input
          type="range"
          min="8"
          max="32"
          value={options.length}
          onChange={(e) => setOptions({ ...options, length: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={options.includeNumbers}
            onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Include Numbers</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={options.includeSymbols}
            onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Include Symbols</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={options.excludeLookAlikes}
            onChange={(e) => setOptions({ ...options, excludeLookAlikes: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Exclude Look-alikes (i,l,1,O,0)</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} />
          Generate
        </button>
        <button
          onClick={handleCopy}
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {copied && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Clipboard will auto-clear in 15 seconds
        </p>
      )}
    </div>
  );
}