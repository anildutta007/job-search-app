import mongoose, { Schema, Document } from 'mongoose';
import { CVParsedData } from '@/types/cv';

interface CVDOC extends Document {
  userId: string;
  originalText: string;
  fileName: string;
  uploadedAt: Date;
  parsedData: CVParsedData;
}

const CVSchema = new Schema<CVDOC>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  originalText: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  parsedData: {
    fullName: String,
    email: String,
    phone: String,
    summary: String,
    skills: [String],
    experience: [
      {
        company: String,
        position: String,
        duration: String,
        startDate: String,
        endDate: String,
        description: String,
        responsibilities: [String],
      },
    ],
    education: [
      {
        school: String,
        degree: String,
        field: String,
        graduationYear: String,
        gpa: String,
      },
    ],
    certifications: [String],
    languages: [String],
    projects: [String],
  },
});

export const CV = mongoose.models.CV || mongoose.model<CVDOC>('CV', CVSchema);
