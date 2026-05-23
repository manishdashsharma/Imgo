import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    folder: { type: String, default: 'default' },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ImageSchema.index({ folder: 1, isActive: 1 });

export default mongoose.model('Image', ImageSchema);
