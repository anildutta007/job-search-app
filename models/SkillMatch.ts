import mongoose, { Schema, Document } from 'mongoose';
import { SkillMatch } from '@/types/job';

interface SkillMatchDoc extends Document, SkillMatch {}

const SkillMatchSchema = new Schema<SkillMatchDoc>({
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
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  matchPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  matchedSkills: [String],
  missingSkills: [String],
  matchedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for faster queries
SkillMatchSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const SkillMatch =
  mongoose.models.SkillMatch ||
  mongoose.model<SkillMatchDoc>('SkillMatch', SkillMatchSchema);
