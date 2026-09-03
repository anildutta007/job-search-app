import mongoose, { Schema, Document } from 'mongoose';

interface ApplicationDoc extends Document {
  userId: string;
  jobId: string;
  status: 'applied' | 'interview' | 'rejected' | 'offer' | 'interested';
  appliedAt: Date;
  generatedCvId?: string;
  generatedCoverId?: string;
  notes?: string;
}

const ApplicationSchema = new Schema<ApplicationDoc>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  jobId: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['applied', 'interview', 'rejected', 'offer', 'interested'],
    default: 'interested',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  generatedCvId: String,
  generatedCoverId: String,
  notes: String,
});

// Create compound index for faster queries
ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const Application =
  mongoose.models.Application ||
  mongoose.model<ApplicationDoc>('Application', ApplicationSchema);
