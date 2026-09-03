'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [userId] = useState('demo-user-001'); // Demo user ID

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="flex justify-between items-center py-6">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            🎯 JobMatch
          </div>
          <div className="flex gap-4">
            <Link
              href="/upload"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Find Your Perfect Job <span className="text-indigo-600">Match</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Upload your CV, we'll extract your skills, and match you with job opportunities
            that align with your experience. Get AI-powered match scores for every position.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/upload"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-semibold"
            >
              Upload CV Now
            </Link>
            <Link
              href="#features"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors text-lg font-semibold"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: 'Upload CV',
                description: 'Submit your PDF resume and LinkedIn profile URL',
                icon: '📄',
              },
              {
                step: 2,
                title: 'Extract Skills',
                description: 'AI analyzes your CV and extracts categorized skills',
                icon: '🧠',
              },
              {
                step: 3,
                title: 'Search Jobs',
                description: 'We search major job sites for matching opportunities',
                icon: '🔍',
              },
              {
                step: 4,
                title: 'Get Scores',
                description: 'See 0-10 match scores for each job opportunity',
                icon: '⭐',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                  STEP {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: '🎯 Smart Skill Matching',
                description: 'AI-powered analysis matches your skills against job requirements',
              },
              {
                title: '📊 Match Scoring',
                description: 'Get a clear 0-10 score showing how well you fit each role',
              },
              {
                title: '🔗 LinkedIn Integration',
                description: 'Include LinkedIn profile data for more comprehensive analysis',
              },
              {
                title: '🚀 Fast Processing',
                description: 'Upload your CV and get results in seconds',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 shadow-lg">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Find Your Dream Job?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Start by uploading your CV and let our AI find the perfect matches for you.
            </p>
            <Link
              href="/upload"
              className="inline-block px-10 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-semibold"
            >
              Get Started Now →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>Built with ❤️ using Claude AI and Next.js</p>
            <p className="text-sm mt-2">Demo User: {userId}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
