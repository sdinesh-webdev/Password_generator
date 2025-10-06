// models/VaultItem.ts
import mongoose from 'mongoose';

const VaultItemSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  encryptedData: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.VaultItem || mongoose.model('VaultItem', VaultItemSchema);