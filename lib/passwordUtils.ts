// lib/passwordUtils.ts

export interface PasswordOptions {
    length: number;
    includeNumbers: boolean;
    includeSymbols: boolean;
    excludeLookAlikes: boolean;
  }
  
  const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const NUMBERS = '0123456789';
  const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const LOOKALIKES = 'il1Lo0O';
  
  /**
   * Generates cryptographically secure password
   * Uses crypto.getRandomValues() for true randomness
   */
  export function generatePassword(options: PasswordOptions): string {
    let charset = LOWERCASE + UPPERCASE;
    
    if (options.includeNumbers) charset += NUMBERS;
    if (options.includeSymbols) charset += SYMBOLS;
    
    if (options.excludeLookAlikes) {
      charset = charset.split('').filter(c => !LOOKALIKES.includes(c)).join('');
    }
    
    const password = new Array(options.length);
    const randomValues = new Uint32Array(options.length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < options.length; i++) {
      password[i] = charset[randomValues[i] % charset.length];
    }
    
    return password.join('');
  }
  
  /**
   * Calculates password strength (0-100)
   */
  export function calculateStrength(password: string): number {
    if (!password) return 0;
    
    let score = 0;
    
    // Length bonus
    score += Math.min(password.length * 4, 40);
    
    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 25;
    
    return Math.min(score, 100);
  }