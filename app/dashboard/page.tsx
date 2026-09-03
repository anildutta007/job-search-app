'use client';

export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CVData {
  id: string;
  fileName: string;
  uploadedAt: string;
  parsedData: {
    fullName: string;
    email: string;
    phone: string;
    skillsCount: number;
    experienceCount: number;
    educationCount: number;
  };
}

interface ExtractedSkills {
  skillsId: string;
  extractedSkills: {
    technical: string[];
    frameworks: string[];
    tools: string[];
    softSkills: string[];
    languages: string[];
    seniority?: string;
    yearsOfExperience?: number;
  };
  analyzedAt: string;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const cvId = searchParams.get('cvId');
  const userId = 'demo-user-001';

  const [cvData, setCVData] = useState<CVData | null>(null);
  const [skills, setSkills] = useState<ExtractedSkills | null>(null);
  const [loadingCV, setLoadingCV] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [error, setError] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [extractingSkills, setExtractingSkills] = useState(false);

  // Fetch CV data
  useEffect(() => {
    const fetchCV = async () => {
      if (!cvId) {
        setError('No CV ID provided');
        setLoadingCV(false);
        return;
      }

      try {
        const response = await fetch(`/api/cv?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch CV');

        const data = await response.json();
        const foundCV = data.cvs.find((cv: CVData) => cv.id === cvId);
        if (foundCV) {
          setCVData(foundCV);
          // Try to fetch skills
          fetchSkills(cvId);
        } else {
          setError('CV not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch CV');
      } finally {
        setLoadingCV(false);
      }
    };

    fetchCV();
  }, [cvId]);

  // Fetch extracted skills
  const fetchSkills = async (id: string) => {
    setLoadingSkills(true);
    try {
      const response = await fetch(`/api/skills/extract?cvId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (err) {
      console.log('Skills not yet extracted');
    } finally {
      setLoadingSkills(false);
    }
  };

  // Extract skills
  const handleExtractSkills = async () => {
    if (!cvId) return;

    setExtractingSkills(true);
    setError('');

    try {
      const response = await fetch('/api/skills/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvId,
          userId,
          linkedinUrl: linkedinUrl || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const data = await response.json();
      setSkills(data);
      setLinkedinUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract skills');
    } finally {
      setExtractingSkills(false);
    }
  };

  if (loadingCV) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading CV data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
              Job Search Dashboard
            </h1>
          </div>
          <Link
            href="/upload"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Upload New CV
          </Link>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-900 dark:text-red-100">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* CV Summary Card */}
        {cvData && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📄 CV Summary
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Full Name</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {cvData.parsedData.fullName}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Email</p>
                <p className="text-xl text-gray-900 dark:text-white break-all">
                  {cvData.parsedData.email}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Phone</p>
                <p className="text-xl text-gray-900 dark:text-white">
                  {cvData.parsedData.phone}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">File</p>
                <p className="text-xl text-gray-900 dark:text-white">{cvData.fileName}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {cvData.parsedData.skillsCount}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Skills Found</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {cvData.parsedData.experienceCount}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Experience Entries</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {cvData.parsedData.educationCount}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Education Entries</p>
              </div>
            </div>
          </div>
        )}

        {/* Skills Extraction Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🧠 Extract Skills with AI
          </h2>

          {skills ? (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-900 dark:text-green-100">
                  ✓ Skills extracted successfully!
                </p>
              </div>

              {/* Skills by Category */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Technical Skills */}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    💻 Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.extractedSkills.technical.length > 0 ? (
                      skills.extractedSkills.technical.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">None found</p>
                    )}
                  </div>
                </div>

                {/* Frameworks */}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    🏗️ Frameworks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.extractedSkills.frameworks.length > 0 ? (
                      skills.extractedSkills.frameworks.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">None found</p>
                    )}
                  </div>
                </div>

                {/* Tools */}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    🛠️ Tools & Services
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.extractedSkills.tools.length > 0 ? (
                      skills.extractedSkills.tools.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">None found</p>
                    )}
                  </div>
                </div>

                {/* Soft Skills */}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    💼 Soft Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.extractedSkills.softSkills.length > 0 ? (
                      skills.extractedSkills.softSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">None found</p>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                    🌐 Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.extractedSkills.languages.length > 0 ? (
                      skills.extractedSkills.languages.map((lang, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 rounded-full text-sm"
                        >
                          {lang}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">None found</p>
                    )}
                  </div>
                </div>

                {/* Seniority */}
                {skills.extractedSkills.seniority && (
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                      📊 Seniority Level
                    </h3>
                    <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 rounded-full text-sm inline-block">
                      {skills.extractedSkills.seniority}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 text-right">
                Extracted: {new Date(skills.analyzedAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Skills haven't been extracted yet. Click below to analyze your CV with AI and extract
                categorized skills.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    LinkedIn Profile URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={extractingSkills}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    We'll use your LinkedIn profile to enhance skill extraction
                  </p>
                </div>

                <button
                  onClick={handleExtractSkills}
                  disabled={extractingSkills || loadingSkills}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-semibold"
                >
                  {extractingSkills || loadingSkills ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Extracting Skills...
                    </span>
                  ) : (
                    'Extract Skills with AI'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🚀 What's Next?
          </h2>
          <ol className="space-y-4 text-gray-700 dark:text-gray-300">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </span>
              <div>
                <strong>Extract Skills:</strong> Use AI to analyze and categorize your skills
                {skills && <span className="text-green-600 dark:text-green-400 ml-2">✓ Done</span>}
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </span>
              <div>
                <strong>Search Jobs:</strong> Find job opportunities matching your skills (Coming Soon)
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </span>
              <div>
                <strong>View Match Scores:</strong> See 0-10 compatibility scores for each job (Coming Soon)
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                4
              </span>
              <div>
                <strong>Optimize Application:</strong> Generate tailored CVs and cover letters (Coming Soon)
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
