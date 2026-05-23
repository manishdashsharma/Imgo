import mongoose from 'mongoose';

const FolderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

FolderSchema.index({ slug: 1, isActive: 1 });

export default mongoose.model('Folder', FolderSchema);
