"use server";

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { PDFParse } from "pdf-parse";
import { ContractSchema, type Contract } from "@/lib/schemas";
import { ensureUserProfile } from "@/lib/profiles";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_CONTRACT_TEXT_CHARS = 45000;

export type ParseContractState = {
  status: "idle" | "success" | "error";
  message?: string;
  contract?: Contract;
  dealId?: string;
};

export async function parseContract(
  _previousState: ParseContractState,
  formData: FormData
): Promise<ParseContractState> {
  const file = formData.get("contract");

  if (!(file instanceof File)) {
    return {
      status: "error",
      message: "Choose a PDF contract before parsing.",
    };
  }

  if (file.type !== "application/pdf") {
    return {
      status: "error",
      message: "Only PDF contracts are supported right now.",
    };
  }

  if (file.size > MAX_PDF_BYTES) {
    return {
      status: "error",
      message: "PDF is too large. Use a contract under 10 MB.",
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.includes("placeholder")) {
    return {
      status: "error",
      message: "Add a real OPENAI_API_KEY to .env.local before parsing contracts.",
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        status: "error",
        message: "Sign in before uploading a contract.",
      };
    }

    await ensureUserProfile(supabase, user);

    const rawText = await extractPdfText(file);

    if (!rawText.trim()) {
      return {
        status: "error",
        message: "No readable text was found in that PDF.",
      };
    }

    const contract = await extractContract(rawText);

    const { data: deal, error: dealError } = await supabase
      .from("brand_deals")
      .insert({
        user_id: user.id,
        brand_name: contract.brandName,
        deal_value: contract.dealValue,
        currency: contract.currency,
        payment_terms_days: contract.paymentTermsDays,
        status: "active",
      })
      .select("id")
      .single();

    if (dealError || !deal) {
      return {
        status: "error",
        message: dealError?.message || "Could not save the parsed brand deal.",
      };
    }

    if (contract.deliverables.length > 0) {
      const { error: deliverablesError } = await supabase
        .from("deliverables")
        .insert(
          contract.deliverables.map((deliverable) => ({
            deal_id: deal.id,
            platform: deliverable.platform,
            content_type: deliverable.contentType,
            due_date: deliverable.dueDate,
            caption_requirements: deliverable.captionRequirements || null,
          }))
        );

      if (deliverablesError) {
        return {
          status: "error",
          message:
            deliverablesError.message ||
            "Deal was saved, but deliverables could not be saved.",
        };
      }
    }

    return {
      status: "success",
      message: "Contract parsed and saved.",
      contract,
      dealId: deal.id,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Contract parsing failed unexpectedly.",
    };
  }
}

async function extractPdfText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text.slice(0, MAX_CONTRACT_TEXT_CHARS);
  } finally {
    await parser.destroy();
  }
}

async function extractContract(rawText: string) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await client.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a highly accurate legal-tech extraction parser. Your sole job is to review influencer marketing agreements and extract key metrics. Do not assume or extrapolate data. If a specific due date year is missing, assume the current year (2026). Return data matching the requested JSON schema exactly.",
      },
      {
        role: "user",
        content: `Extract the sponsorship contract fields from this PDF text:\n\n${rawText}`,
      },
    ],
    response_format: zodResponseFormat(ContractSchema, "contract"),
  });

  const parsed = completion.choices[0]?.message.parsed;

  if (!parsed) {
    throw new Error("OpenAI returned no structured contract data.");
  }

  return ContractSchema.parse(parsed);
}
