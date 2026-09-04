'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

interface MatchResult {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  matchScore: number;
  details: {
    technicalMatch: number;
    toolsMatch: number;
    frameworksMatch: number;
  };
}

interface Job {
  externalId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requiredSkills: string[];
  url: string;
  postedDate: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  matchResult?: MatchResult;
}

function JobsContent() {
  const searchParams = useSearchParams();
  const cvId = searchParams.get('cvId');
  const userId = 'demo-user-001';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'excellent' | 'good' | 'fair' | 'poor'>(
    'all'
  );
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Fetch jobs
  useEffect(() => {
    if (!cvId) return;

    const searchJobs = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/jobs/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cvId, userId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Failed to search jobs'
          );
        }

        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search jobs');
      } finally {
        setLoading(false);
      }
    };

    searchJobs();
  }, [cvId]);

  // Filter jobs based on match score
  const filteredJobs = jobs.filter((job) => {
    const score = job.matchResult?.matchScore || 0;
    if (filter === 'all') return true;
    if (filter === 'excellent') return score >= 8;
    if (filter === 'good') return score >= 6 && score < 8;
    if (filter === 'fair') return score >= 4 && score < 6;
    if (filter === 'poor') return score < 4;
    return false;
  });

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 6) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent Match';
    if (score >= 6) return 'Good Match';
    if (score >= 4) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
            Job Matches
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Find jobs that match your skills
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-3 flex-wrap">
          {(['all', 'excellent', 'good', 'fair', 'poor'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} (
              {jobs.filter((j) => {
                const score = j.matchResult?.matchScore || 0;
                if (tab === 'all') return true;
                if (tab === 'excellent') return score >= 8;
                if (tab === 'good') return score >= 6 && score < 8;
                if (tab === 'fair') return score >= 4 && score < 6;
                if (tab === 'poor') return score < 4;
                return false;
              }).length}
              )
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600 dark:text-gray-400">
              Searching for matching jobs...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-900 dark:text-red-100">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Jobs List */}
        {!loading && filteredJobs.length > 0 && (
          <div className="grid gap-4">
            {filteredJobs.map((job, index) => (
              <div
                key={index}
                onClick={() => setSelectedJob(job)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6 border-l-4 border-indigo-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {job.company} • {job.location}
                    </p>
                  </div>

                  {/* Match Score Badge */}
                  <div
                    className={`px-4 py-2 rounded-lg font-bold text-center border-2 ${getScoreColor(
                      job.matchResult?.matchScore || 0
                    )}`}
                  >
                    <div className="text-2xl">
                      {job.matchResult?.matchScore || 0}/10
                    </div>
                    <div className="text-sm">
                      {getScoreLabel(job.matchResult?.matchScore || 0)}
                    </div>
                  </div>
                </div>

                {/* Match Percentage */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Skill Match
                    </span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {job.matchResult?.matchPercentage || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          job.matchResult?.matchPercentage || 0
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Salary */}
                {job.salary && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    💰 ${job.salary.min.toLocaleString()} - $
                    {job.salary.max.toLocaleString()} {job.salary.currency}
                  </p>
                )}

                {/* Skills Preview */}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Matched Skills ({job.matchResult?.matchedSkills.length || 0}
                    /{job.requiredSkills.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.matchResult?.matchedSkills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs rounded-full"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                    {job.matchResult?.missingSkills.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 text-xs rounded-full"
                      >
                        ✗ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
                >
                  View Job →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* No Jobs */}
        {!loading && filteredJobs.length === 0 && !error && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No jobs found in this category
            </p>
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedJob.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedJob.company}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Match Details */}
              <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                  Your Match Score: {selectedJob.matchResult?.matchScore || 0}/10
                </h3>

                {selectedJob.matchResult && (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Technical
                        </div>
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {selectedJob.matchResult.details.technicalMatch}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Tools
                        </div>
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {selectedJob.matchResult.details.toolsMatch}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Frameworks
                        </div>
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {selectedJob.matchResult.details.frameworksMatch}%
                        </div>
                      </div>
                    </div>

                    {/* Matched Skills */}
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ✓ Your Matching Skills (
                        {selectedJob.matchResult.matchedSkills.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.matchResult.matchedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div>
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        ✗ Missing Skills (
                        {selectedJob.matchResult.missingSkills.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.matchResult.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Job Description */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                  Job Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                  {selectedJob.description}
                </p>
              </div>

              {/* All Required Skills */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <a
                href={selectedJob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
              >
                Apply Now →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsContent />
    </Suspense>
  );
}
