// lib/encryption.ts
import CryptoJS from 'crypto-js';

export interface VaultData {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

/**
 * Encrypt vault data using AES-256
 */
export function encryptData(data: VaultData, userId: string): string {
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, userId).toString();
  return encrypted;
}

/**
 * Decrypt vault data
 */
export function decryptData(encryptedData: string, userId: string): VaultData | null {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, userId);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!jsonString) {
      return null;
    }
    
    return JSON.parse(jsonString) as VaultData;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

/**
 * Copy to clipboard with optional auto-clear after 15 seconds
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    
    // Auto-clear after 15 seconds (only if document is still focused)
    setTimeout(async () => {
      try {
        // Check if document is focused before attempting to read/write
        if (document.hasFocus()) {
          const current = await navigator.clipboard.readText();
          if (current === text) {
            await navigator.clipboard.writeText('');
          }
        }
      } catch (error) {
        // Silently fail if clipboard access is denied or document lost focus
        // This is expected behavior when user switches tabs
        console.debug('Clipboard auto-clear skipped:', error);
      }
    }, 15000);
  } catch (error) {
    console.error('Copy failed:', error);
    throw error;
  }
}