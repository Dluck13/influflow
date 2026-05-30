"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calculateEngagementRate,
  calculateRate,
  formatPrice,
} from "@/lib/calculator";

const platforms = ["TikTok", "Instagram", "YouTube"];
const niches = [
  "Beauty",
  "Tech",
  "Fashion",
  "Fitness",
  "Lifestyle",
  "Gaming",
  "Education",
  "Other",
];

const pipelineItems = [
  {
    label: "Contract scanned",
    value: "12 min",
    detail: "Average extraction time from upload to due-date list",
  },
  {
    label: "Draft due",
    value: "Jun 12",
    detail: "TikTok short draft for Northstar Skincare",
  },
  {
    label: "Payment terms",
    value: "Net 30",
    detail: "Invoice can be generated after live post approval",
  },
];

export default function Home() {
  const [followers, setFollowers] = useState(25000);
  const [views, setViews] = useState(64000);
  const [platform, setPlatform] = useState("TikTok");
  const [niche, setNiche] = useState("Beauty");

  const rate = useMemo(() => calculateRate(views, niche), [views, niche]);
  const engagementRate = useMemo(
    () => calculateEngagementRate(views, followers),
    [followers, views]
  );

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#181614]">
      <section className="border-b border-[#ded7c8] bg-[#fffaf0]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
          <nav className="flex items-center justify-between gap-4">
            <Link href="/" className="text-xl font-bold text-[#181614]">
              SponsorFlow
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md border border-[#cfc5b3] px-4 py-2 text-sm font-semibold text-[#3a342a] transition hover:bg-white"
              >
                Sign in
              </Link>
              <Link
                href="/dashboard/calculator"
                className="rounded-md bg-[#1f6f5b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#185847]"
              >
                Dashboard
              </Link>
            </div>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="max-w-2xl py-8 lg:py-14">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9a4d35]">
                Creator deal operations
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-[#181614] sm:text-5xl">
                Price, track, and invoice brand deals from one working desk.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#5f584d]">
                SponsorFlow gives creators a rate calculator, contract deadline
                extraction plan, and Stripe-ready invoicing workflow without
                forcing the whole business into a generic CRM.
              </p>
            </div>

            <div className="grid gap-3 pb-8 sm:grid-cols-3 lg:pb-14">
              {pipelineItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-[#ded7c8] bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b6255]">
                    {item.label}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-[#181614]">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-[#6b6255]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_380px] lg:px-10">
        <div className="rounded-lg border border-[#ded7c8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 border-b border-[#ebe5d8] pb-5">
            <h2 className="text-2xl font-bold text-[#181614]">
              Rate Calculator
            </h2>
            <p className="text-sm leading-6 text-[#6b6255]">
              Adjust creator metrics and get a defensible sponsored-post range
              using market CPM tiers from the roadmap.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[#3a342a]">
                Followers
              </span>
              <input
                type="number"
                min="0"
                value={followers}
                onChange={(event) =>
                  setFollowers(Math.max(0, Number(event.target.value) || 0))
                }
                className="mt-2 h-11 w-full rounded-md border border-[#cfc5b3] bg-[#fffdf8] px-3 text-sm outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#1f6f5b]/20"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#3a342a]">
                Average views
              </span>
              <input
                type="number"
                min="0"
                value={views}
                onChange={(event) =>
                  setViews(Math.max(0, Number(event.target.value) || 0))
                }
                className="mt-2 h-11 w-full rounded-md border border-[#cfc5b3] bg-[#fffdf8] px-3 text-sm outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#1f6f5b]/20"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#3a342a]">
                Platform
              </span>
              <select
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-[#cfc5b3] bg-[#fffdf8] px-3 text-sm outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#1f6f5b]/20"
              >
                {platforms.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#3a342a]">
                Niche
              </span>
              <select
                value={niche}
                onChange={(event) => setNiche(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-[#cfc5b3] bg-[#fffdf8] px-3 text-sm outline-none transition focus:border-[#1f6f5b] focus:ring-2 focus:ring-[#1f6f5b]/20"
              >
                {niches.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-[#ded7c8] bg-[#fffdf8] p-4">
              <p className="text-sm font-semibold text-[#6b6255]">
                Engagement
              </p>
              <p className="mt-2 text-2xl font-bold text-[#181614]">
                {engagementRate.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg border border-[#ded7c8] bg-[#fffdf8] p-4">
              <p className="text-sm font-semibold text-[#6b6255]">
                Adjusted CPM
              </p>
              <p className="mt-2 text-2xl font-bold text-[#181614]">
                ${rate.adjustedCPM.toFixed(0)}
              </p>
            </div>
            <div className="rounded-lg border border-[#ded7c8] bg-[#fffdf8] p-4">
              <p className="text-sm font-semibold text-[#6b6255]">
                Niche premium
              </p>
              <p className="mt-2 text-2xl font-bold text-[#181614]">
                {rate.nicheMultiplier.toFixed(1)}x
              </p>
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-[#1f6f5b]/25 bg-[#e7f0eb] p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1f6f5b]">
            Suggested quote
          </p>
          <div className="mt-5 rounded-lg bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#6b6255]">
              Per sponsored post on {platform}
            </p>
            <p className="mt-3 text-3xl font-bold text-[#181614]">
              {formatPrice(rate.minPrice)} - {formatPrice(rate.maxPrice)}
            </p>
            <p className="mt-4 text-sm leading-6 text-[#6b6255]">
              Built from {views.toLocaleString()} average views, a base CPM of
              ${rate.baseCPM}, and the selected {niche.toLowerCase()} market
              multiplier.
            </p>
          </div>

          <div className="mt-5 space-y-3 text-sm leading-6 text-[#40524a]">
            <p>
              Use the low end for simple usage rights and the high end when the
              brief includes revisions, exclusivity, or whitelisting.
            </p>
            <p>
              The next build step is connecting this page to saved deal drafts
              and the contract upload workflow.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
