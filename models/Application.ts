import mongoose, { Schema, Document } from 'mongoose';
import { Application } from '@/types/job';

interface ApplicationDoc extends Document, Application {}

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
