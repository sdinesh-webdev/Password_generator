// app/page.tsx
import Link from 'next/link';
import { Lock, Shield, Key } from 'lucide-react';
import PasswordGenerator from '@/components/PasswordGenerator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Lock className="text-blue-600" size={48} />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Password Vault
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Zero-knowledge password manager with client-side encryption. Your passwords never leave your device unencrypted.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Shield className="text-blue-600 mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-lg mb-2">AES-256 Encryption</h3>
            <p className="text-sm text-gray-600">
              Military-grade encryption ensures your data is always protected
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Key className="text-blue-600 mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-lg mb-2">Zero-Knowledge</h3>
            <p className="text-sm text-gray-600">
              Server never sees your passwords. Only encrypted data is stored
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Lock className="text-blue-600 mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-lg mb-2">Secure Generation</h3>
            <p className="text-sm text-gray-600">
              Cryptographically secure random password generation
            </p>
          </div>
        </div>

        {/* Password Generator Demo */}
        <div className="flex justify-center mb-12">
          <PasswordGenerator />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            Get Started - It's Free
          </Link>
          <p className="text-sm text-gray-600 mt-4">
            Secure authentication powered by Clerk
          </p>
        </div>
      </div>
    </main>
  );
}