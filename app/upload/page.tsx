'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CVInfo {
  fullName: string;
  email: string;
  phone: string;
  skillsCount: number;
  experienceCount: number;
  educationCount: number;
}

interface UploadResponse {
  success: boolean;
  cvId: string;
  fileName: string;
  uploadedAt: string;
  parsedData: CVInfo;
}

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadedData, setUploadedData] = useState<UploadResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = 'demo-user-001'; // Demo user ID

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const isValidFile = (file: File): boolean => {
    const isPdf = file.type === 'application/pdf';
    const isDocx =
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx');
    return isPdf || isDocx;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidFile(droppedFile)) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please upload a PDF or Word (.docx) file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (isValidFile(selectedFile)) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF or Word (.docx) file');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data: UploadResponse = await response.json();
      setUploadedData(data);
      setSuccess(true);
      setFile(null);

      // Auto-redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard?cvId=${data.cvId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
            Upload Your CV
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload your resume in PDF format to get started with job matching
          </p>
        </div>

        {/* Success Message */}
        {success && uploadedData && (
          <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
              ✓ CV Uploaded Successfully!
            </h3>
            <div className="space-y-2 text-green-800 dark:text-green-200">
              <p>
                <strong>Name:</strong> {uploadedData.parsedData.fullName}
              </p>
              <p>
                <strong>Email:</strong> {uploadedData.parsedData.email}
              </p>
              <p>
                <strong>Phone:</strong> {uploadedData.parsedData.phone}
              </p>
              <p>
                <strong>Skills Found:</strong> {uploadedData.parsedData.skillsCount}
              </p>
              <p>
                <strong>Experience Entries:</strong> {uploadedData.parsedData.experienceCount}
              </p>
              <p>
                <strong>Education Entries:</strong> {uploadedData.parsedData.educationCount}
              </p>
            </div>
            <p className="text-green-700 dark:text-green-300 mt-4 text-sm">
              Redirecting to dashboard in a moment...
            </p>
          </div>
        )}

        {/* Upload Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />

              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Drop your CV here or click to browse
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                PDF or Word (.docx) files supported (max 10MB)
              </p>

              {file && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-blue-900 dark:text-blue-100 font-semibold">
                    Selected: {file.name}
                  </p>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* LinkedIn URL Input */}
            <div>
              <label htmlFor="linkedin" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                LinkedIn Profile URL (Optional)
              </label>
              <input
                type="url"
                id="linkedin"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/your-profile"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                We'll use this to enhance skill extraction from your public profile
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-900 dark:text-red-100">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || loading}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Processing CV...
                </span>
              ) : (
                'Upload & Analyze CV'
              )}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Your CV will be securely processed using AI to extract skills and experience
            </p>
          </form>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            What Happens Next?
          </h2>
          <ol className="space-y-4 text-gray-700 dark:text-gray-300">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </span>
              <div>
                <strong>PDF Processing:</strong> We extract text from your resume
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </span>
              <div>
                <strong>Skill Extraction:</strong> AI analyzes your CV and categorizes skills
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </span>
              <div>
                <strong>Job Search:</strong> We search for matching opportunities
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                4
              </span>
              <div>
                <strong>Match Scoring:</strong> Each job gets a 0-10 compatibility score
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
