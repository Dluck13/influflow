/**
 * Rate calculation utility for the SponsorFlow rate calculator
 */

const BASE_CPM = 25; // $25 per 1,000 views

const NICHE_MULTIPLIERS: Record<string, number> = {
  Beauty: 1.4,
  Tech: 1.3,
  Fashion: 1.3,
  Fitness: 1.2,
  Lifestyle: 1.1,
  Gaming: 1.2,
  Education: 1.0,
  Other: 1.0,
};

export interface RateCalculationResult {
  minPrice: number;
  maxPrice: number;
  baseCPM: number;
  nicheMultiplier: number;
  adjustedCPM: number;
  engagementRate: number;
}

/**
 * Calculate recommended pricing for a creator based on their metrics
 */
export function calculateRate(
  averageViews: number,
  niche: string
): RateCalculationResult {
  // Get niche multiplier (default to 1.0 if not found)
  const nicheMultiplier = NICHE_MULTIPLIERS[niche] || 1.0;

  // Calculate adjusted CPM
  const adjustedCPM = BASE_CPM * nicheMultiplier;

  // Calculate minimum price: (views / 1000) * adjustedCPM
  const minPrice = (averageViews / 1000) * adjustedCPM;

  // Calculate maximum price: min * 1.4 (40% premium)
  const maxPrice = minPrice * 1.4;

  return {
    minPrice,
    maxPrice,
    baseCPM: BASE_CPM,
    nicheMultiplier,
    adjustedCPM,
    engagementRate: 0, // Can be calculated if follower data is provided
  };
}

/**
 * Calculate engagement rate (views / followers * 100)
 */
export function calculateEngagementRate(
  views: number,
  followers: number
): number {
  if (followers === 0) return 0;
  return (views / followers) * 100;
}

/**
 * Format price as USD currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}
