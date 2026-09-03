import mongoose, { Schema, Document } from 'mongoose';
import { JobListing } from '@/types/job';

interface JobListingDoc extends Document, JobListing {}

const JobListingSchema = new Schema<JobListingDoc>({
  externalId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  source: {
    type: String,
    enum: ['indeed', 'linkedin', 'glassdoor', 'other'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
    index: true,
  },
  location: String,
  description: {
    type: String,
    required: true,
  },
  requiredSkills: [String],
  salaryRange: {
    min: Number,
    max: Number,
    currency: String,
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
  jobType: String,
  experienceLevel: String,
});

export const JobListing =
  mongoose.models.JobListing ||
  mongoose.model<JobListingDoc>('JobListing', JobListingSchema);
