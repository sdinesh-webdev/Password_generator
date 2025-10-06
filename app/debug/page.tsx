'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { decryptData } from '@/lib/encryption';

export default function DebugPage() {
  const { user, isLoaded } = useUser();
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (isLoaded && user) {
      testEverything();
    }
  }, [isLoaded, user]);

  const testEverything = async () => {
    console.log('=== STARTING DIAGNOSTICS ===');
    const testResults: any = {
      userId: user?.id,
      timestamp: new Date().toISOString()
    };

    try {
      // Test 1: Fetch from API
      console.log('📡 Test 1: Fetching from API...');
      const res = await fetch('/api/vault');
      testResults.apiStatus = res.status;
      testResults.apiOk = res.ok;

      if (res.ok) {
        const data = await res.json();
        testResults.itemCount = data.items?.length || 0;
        testResults.rawItems = data.items;

        console.log('✅ API Response:', data);
        console.log(`📦 Found ${testResults.itemCount} items`);

        // Test 2: Decrypt items
        if (data.items && data.items.length > 0) {
          console.log('🔓 Test 2: Decrypting items...');
          testResults.decryption = data.items.map((item: any, i: number) => {
            try {
              console.log(`Decrypting item ${i + 1}...`);
              const decrypted = decryptData(item.encryptedData, user!.id);
              console.log('✅ Decrypted:', decrypted);
              return { success: true, data: decrypted };
            } catch (err: any) {
              console.error('❌ Decryption failed:', err);
              return { success: false, error: err.message };
            }
          });
        }
      } else {
        const errorData = await res.json();
        testResults.error = errorData;
        console.error('❌ API Error:', errorData);
      }
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      testResults.error = error.message;
    }

    console.log('=== RESULTS ===', testResults);
    setResults(testResults);
  };

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">🔍 Vault Debug Page</h1>
        
        <div className="mb-4">
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>User Email:</strong> {user?.emailAddresses[0]?.emailAddress}</p>
        </div>

        <button
          onClick={testEverything}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          Run Tests
        </button>

        {results && (
          <div className="mt-4">
            <h2 className="font-bold mb-2">Results:</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm"><strong>Check the browser console (F12)</strong> for detailed logs with emoji markers!</p>
        </div>
      </div>
    </div>
  );
}