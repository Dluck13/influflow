/**
 * Rate calculation utility for the SponsorFlow rate calculator.
 * Uses market CPM tiers from $20-$40 per 1,000 average views.
 */

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

const PLATFORM_MULTIPLIERS: Record<string, number> = {
  TikTok: 1.0,
  Instagram: 1.1,
  YouTube: 1.25,
};

const CPM_TIERS = [
  {
    label: "Emerging",
    maxViews: 25000,
    cpm: 20,
  },
  {
    label: "Growth",
    maxViews: 100000,
    cpm: 25,
  },
  {
    label: "Established",
    maxViews: 500000,
    cpm: 32,
  },
  {
    label: "Premium",
    maxViews: Number.POSITIVE_INFINITY,
    cpm: 40,
  },
];

export interface RateCalculationResult {
  minPrice: number;
  maxPrice: number;
  baseCPM: number;
  nicheMultiplier: number;
  platformMultiplier: number;
  adjustedCPM: number;
  engagementRate: number;
  tierLabel: string;
}

/**
 * Calculate recommended pricing for a creator based on their metrics
 */
export function calculateRate(
  averageViews: number,
  niche: string,
  platform = "TikTok"
): RateCalculationResult {
  const nicheMultiplier = NICHE_MULTIPLIERS[niche] || 1.0;
  const platformMultiplier = PLATFORM_MULTIPLIERS[platform] || 1.0;
  const tier = CPM_TIERS.find((item) => averageViews <= item.maxViews) || CPM_TIERS[0];

  const adjustedCPM = tier.cpm * nicheMultiplier * platformMultiplier;
  const minPrice = (averageViews / 1000) * adjustedCPM;
  const maxPrice = minPrice * 1.4;

  return {
    minPrice,
    maxPrice,
    baseCPM: tier.cpm,
    nicheMultiplier,
    platformMultiplier,
    adjustedCPM,
    engagementRate: 0,
    tierLabel: tier.label,
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
