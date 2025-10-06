// app/api/vault/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import VaultItem from '@/models/VaultItems';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    console.log('🔐 GET /api/vault - User ID:', userId);
    
    if (!userId) {
      console.error('❌ No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    console.log('✅ Database connected');
    
    const items = await VaultItem.find({ userId }).sort({ createdAt: -1 });
    console.log('📦 Found items:', items.length);
    console.log('📋 Items data:', items.map(i => ({ id: i._id, userId: i.userId })));
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error('❌ GET /api/vault error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch items',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    console.log('💾 POST /api/vault - User ID:', userId);
    
    if (!userId) {
      console.error('❌ No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    console.log('📝 Request body received:', Object.keys(body));
    
    const { encryptedData } = body;
    
    if (!encryptedData) {
      console.error('❌ No encryptedData provided');
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }
    
    console.log('🔒 Encrypted data length:', encryptedData.length);
    
    await connectDB();
    console.log('✅ Database connected');
    
    const item = await VaultItem.create({
      userId,
      encryptedData,
    });
    
    console.log('✅ Item created:', item._id);
    
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('❌ POST /api/vault error:', error);
    return NextResponse.json({ 
      error: 'Failed to create item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}