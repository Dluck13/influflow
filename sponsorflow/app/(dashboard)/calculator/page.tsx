'use client';

import { useState, useMemo } from 'react';
import { calculateRate, calculateEngagementRate, formatPrice } from '@/lib/calculator';

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube'];
const NICHES = ['Beauty', 'Tech', 'Fashion', 'Fitness', 'Lifestyle', 'Gaming', 'Education', 'Other'];

export default function CalculatorPage() {
  const [followerCount, setFollowerCount] = useState<number>(10000);
  const [averageViews, setAverageViews] = useState<number>(50000);
  const [platform, setPlatform] = useState<string>('TikTok');
  const [niche, setNiche] = useState<string>('Tech');

  // Calculate rates in real-time
  const calculation = useMemo(() => {
    if (averageViews > 0) {
      return calculateRate(averageViews, niche);
    }
    return null;
  }, [averageViews, niche]);

  // Calculate engagement rate
  const engagementRate = useMemo(() => {
    if (followerCount > 0 && averageViews > 0) {
      return calculateEngagementRate(averageViews, followerCount);
    }
    return 0;
  }, [followerCount, averageViews]);

  // Sample calculations for reference
  const samples = [
    {
      title: 'Micro Influencer',
      followers: 10000,
      views: 20000,
      niche: 'Lifestyle',
      description: 'Great for niche audiences',
    },
    {
      title: 'Mid-Tier Creator',
      followers: 100000,
      views: 200000,
      niche: 'Beauty',
      description: 'Strong engagement potential',
    },
    {
      title: 'Macro Influencer',
      followers: 1000000,
      views: 2000000,
      niche: 'Fashion',
      description: 'Premium positioning',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rate Calculator</h1>
        <p className="mt-2 text-gray-600">
          Estimate your pricing based on your audience size and engagement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Metrics</h2>

            {/* Follower Count */}
            <div>
              <label htmlFor="followers" className="block text-sm font-medium text-gray-700 mb-2">
                Follower Count
                <span className="text-gray-500 text-xs ml-2">
                  Total followers on {platform}
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="followers"
                  value={followerCount}
                  onChange={(e) => setFollowerCount(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter follower count"
                />
                <span className="absolute right-4 top-2 text-gray-500 text-sm">
                  {followerCount.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Used to calculate engagement rate
              </p>
            </div>

            {/* Average Views Per Post */}
            <div>
              <label htmlFor="views" className="block text-sm font-medium text-gray-700 mb-2">
                Average Views Per Post
                <span className="text-gray-500 text-xs ml-2">
                  Typical performance metric
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="views"
                  value={averageViews}
                  onChange={(e) => setAverageViews(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter average views"
                />
                <span className="absolute right-4 top-2 text-gray-500 text-sm">
                  {averageViews.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This is your primary pricing driver
              </p>
            </div>

            {/* Platform Selector */}
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Platform affects audience reach and typical engagement
              </p>
            </div>

            {/* Niche Selector */}
            <div>
              <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-2">
                Niche / Industry
              </label>
              <select
                id="niche"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {NICHES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Different niches have different market premiums
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Tip:</span> Your engagement rate is{' '}
                <span className="font-semibold">{engagementRate.toFixed(2)}%</span>
                {engagementRate >= 3
                  ? ' - excellent engagement for brand deals!'
                  : engagementRate >= 1
                  ? ' - good engagement rate.'
                  : ' - work on increasing engagement for better rates.'}
              </p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommended Price Range</h2>

            {calculation && averageViews > 0 ? (
              <div className="space-y-6">
                {/* Price Range */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Estimated Rate</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-indigo-600">
                      {formatPrice(calculation.minPrice)}
                    </span>
                    <span className="text-gray-500">-</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {formatPrice(calculation.maxPrice)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Per sponsored post on {platform}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Calculation Breakdown</h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Views:</span>
                      <span className="font-medium text-gray-900">
                        {averageViews.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Base CPM:</span>
                      <span className="font-medium text-gray-900">
                        ${calculation.baseCPM.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Niche ({niche}):</span>
                      <span className="font-medium text-indigo-600">
                        ×{calculation.nicheMultiplier.toFixed(1)}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                      <span className="text-gray-600">Adjusted CPM:</span>
                      <span className="font-bold text-gray-900">
                        ${calculation.adjustedCPM.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Premium Buffer:</span>
                      <span>+40% for quality creators</span>
                    </div>
                  </div>
                </div>

                {/* Engagement Info */}
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Engagement Metrics</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Engagement Rate:</span>
                      <span className="font-medium">{engagementRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated CPM Value:</span>
                      <span className="font-medium">{calculation.adjustedCPM.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Enter your metrics to calculate rates</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sample Calculations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Sample Calculations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {samples.map((sample) => {
            const sampleCalc = calculateRate(sample.views, sample.niche);
            return (
              <div
                key={sample.title}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setFollowerCount(sample.followers);
                  setAverageViews(sample.views);
                  setNiche(sample.niche);
                }}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{sample.title}</h3>
                <p className="text-xs text-gray-600 mb-3">{sample.description}</p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Followers:</span>
                    <span className="font-medium">{sample.followers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Views:</span>
                    <span className="font-medium">{sample.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Niche:</span>
                    <span className="font-medium">{sample.niche}</span>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded p-2">
                  <p className="text-xs text-gray-600 mb-1">Estimated Rate:</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {formatPrice(sampleCalc.minPrice)} - {formatPrice(sampleCalc.maxPrice)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4">💡 Pricing Tips</h3>
        <ul className="space-y-2 text-sm text-green-800">
          <li>• <span className="font-medium">Engagement Rate:</span> Aim for 3%+ to command premium rates</li>
          <li>• <span className="font-medium">Niche Impact:</span> Beauty and Tech creators earn up to 40% more</li>
          <li>• <span className="font-medium">Quality Buffer:</span> The max range (+40%) applies to established creators with strong engagement</li>
          <li>• <span className="font-medium">Negotiation:</span> Use this calculator as your baseline, but always negotiate based on brand budget and scope</li>
          <li>• <span className="font-medium">Platform Matters:</span> YouTube typically pays more than TikTok due to different audience sizes</li>
        </ul>
      </div>
    </div>
  );
}
