// app/api/vault/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/mongodb';
import VaultItem from '@/models/VaultItems';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { encryptedData } = await req.json();
    
    if (!encryptedData) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }
    
    await connectDB();
    
    // Await params before accessing
    const params = await context.params;
    
    // Find item and verify ownership
    const item = await VaultItem.findOne({ _id: params.id, userId });
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Update the item
    item.encryptedData = encryptedData;
    await item.save();
    
    return NextResponse.json({ item });
  } catch (error) {
    console.error('PUT /api/vault/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Await params before accessing
    const params = await context.params;
    
    // Find and delete item (only if user owns it)
    const item = await VaultItem.findOneAndDelete({ _id: params.id, userId });
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/vault/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}