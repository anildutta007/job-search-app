import mongoose, { Schema, Document } from 'mongoose';

interface ExtractedSkillsDoc extends Document {
  cvId: string;
  linkedinUrl?: string;
  linkedinData?: string;
  extractedSkills: {
    technical: string[];
    frameworks: string[];
    tools: string[];
    softSkills: string[];
    languages: string[];
  };
  analyzedAt: Date;
  claudePromptUsed?: string;
  tokensUsed?: number;
}

const ExtractedSkillsSchema = new Schema<ExtractedSkillsDoc>({
  cvId: {
    type: String,
    required: true,
    index: true,
  },
  linkedinUrl: String,
  linkedinData: String,
  extractedSkills: {
    technical: [String],
    frameworks: [String],
    tools: [String],
    softSkills: [String],
    languages: [String],
  },
  analyzedAt: {
    type: Date,
    default: Date.now,
  },
  claudePromptUsed: String,
  tokensUsed: Number,
});

export const ExtractedSkills =
  mongoose.models.ExtractedSkills ||
  mongoose.model<ExtractedSkillsDoc>('ExtractedSkills', ExtractedSkillsSchema);
