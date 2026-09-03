import mongoose, { Schema, Document } from 'mongoose';
import { GeneratedContent } from '@/types/job';

interface GeneratedContentDoc extends Document, GeneratedContent {}

const GeneratedContentSchema = new Schema<GeneratedContentDoc>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  jobId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['cv', 'cover_letter'],
    required: true,
  },
  originalContent: String,
  generatedContent: {
    type: String,
    required: true,
  },
  promptUsed: String,
  claudeTokensUsed: Number,
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for faster queries
GeneratedContentSchema.index({ userId: 1, jobId: 1, type: 1 });

export const GeneratedContent =
  mongoose.models.GeneratedContent ||
  mongoose.model<GeneratedContentDoc>(
    'GeneratedContent',
    GeneratedContentSchema
  );
