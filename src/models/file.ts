import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  fileName: String,
  fileUrl: String,
}, { timestamps: true });

export default mongoose.models.File || mongoose.model('File', FileSchema);
