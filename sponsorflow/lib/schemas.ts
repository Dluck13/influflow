import { z } from "zod";

export const ContractSchema = z.object({
  brandName: z
    .string()
    .describe(
      "The legal or trading name of the company hiring the creator"
    ),
  dealValue: z
    .number()
    .describe("The total gross payout amount in USD"),
  currency: z.string().default("USD"),
  paymentTermsDays: z
    .number()
    .describe(
      "Number of days after posting until payment is due. Default to 30 if unstated."
    ),
  deliverables: z.array(
    z.object({
      platform: z.enum(["TikTok", "Instagram", "YouTube", "Other"]),
      contentType: z.enum([
        "Video",
        "Story",
        "Carousel",
        "Dedicated Video",
        "Short/Reel",
      ]),
      dueDate: z
        .string()
        .describe(
          "ISO 8601 date format (YYYY-MM-DD) for when the draft or live post is due"
        ),
      captionRequirements: z
        .string()
        .optional()
        .describe("Required hashtags, tags, or tracking links"),
    })
  ),
});

export type Contract = z.infer<typeof ContractSchema>;

export const RateCalculatorSchema = z.object({
  followerCount: z
    .number()
    .min(0)
    .describe("Total follower count across platform"),
  averageViews: z
    .number()
    .min(0)
    .describe("Average views per post"),
  platform: z.enum(["TikTok", "Instagram", "YouTube"]),
  niche: z.enum([
    "Beauty",
    "Tech",
    "Fashion",
    "Fitness",
    "Lifestyle",
    "Gaming",
    "Education",
    "Other",
  ]),
});

export type RateCalculatorInput = z.infer<typeof RateCalculatorSchema>;
