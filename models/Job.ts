import mongoose, { Schema, Document } from 'mongoose';

interface JobDoc extends Document {
  externalId: string; // Job ID from external source (Indeed, LinkedIn, etc.)
  source: string; // 'indeed', 'linkedin', 'glassdoor'
  title: string;
  company: string;
  location: string;
  description: string;
  requiredSkills: string[]; // Extracted by Claude
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  url: string;
  postedDate?: Date;
  scrapedAt: Date;
  active: boolean; // Whether job is still active
}

const JobSchema = new Schema<JobDoc>({
  externalId: {
    type: String,
    required: true,
    unique: true,
  },
  source: {
    type: String,
    enum: ['indeed', 'linkedin', 'glassdoor', 'manual', 'mock', 'other'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requiredSkills: {
    type: [String],
    default: [],
  },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
  },
  url: {
    type: String,
    required: true,
  },
  postedDate: Date,
  scrapedAt: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

// Index for faster queries
JobSchema.index({ source: 1, active: 1 });
JobSchema.index({ title: 'text', description: 'text' });

export const Job =
  mongoose.models.Job || mongoose.model<JobDoc>('Job', JobSchema);
