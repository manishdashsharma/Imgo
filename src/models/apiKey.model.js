import mongoose from 'mongoose';

const ApiKeySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    keyHash: { type: String, required: true, unique: true },
    keyPrefix: { type: String, required: true },
    lastUsedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ApiKeySchema.index({ keyHash: 1, isActive: 1 });

export default mongoose.model('ApiKey', ApiKeySchema);
