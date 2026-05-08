import { NextRequest, NextResponse } from "next/server";
import { runAudit, generateFallbackSummary } from "@/lib/audit-engine";
import { createServerClient } from "@/lib/supabase";
import { generateShareId } from "@/lib/utils";
import type { AuditInput } from "@/lib/audit-engine";

// Rate limiting — simple in-memory store (use Redis/Upstash in production)
const requestMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per 10 minutes
const RATE_WINDOW = 10 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestMap.get(ip);
  if (!entry || now > entry.resetAt) {
    requestMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

async function generateAiSummary(input: AuditInput, result: ReturnType<typeof runAudit>): Promise<string> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("No API key");

    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are an expert AI tooling consultant writing a concise, professional audit summary.

AUDIT DATA:
- Team size: ${input.teamSize}
- Primary use case: ${input.useCase}
- Current monthly AI spend: $${result.currentMonthlyTotal.toFixed(0)}
- Recommended monthly spend: $${result.recommendedMonthlyTotal.toFixed(0)}
- Monthly savings opportunity: $${result.monthlySavings.toFixed(0)}
- Annual savings opportunity: $${result.annualSavings.toFixed(0)}
- Optimization score: ${result.overallScore}/100
- Issues found: ${result.findings.filter(f => f.severity !== 'ok').map(f => f.issue).join('; ')}

Write a ~100-word personalized audit summary. Be specific about the numbers. Use professional, finance-conscious language. Do NOT use bullet points. Write in paragraph form. Do not include a headline.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock: any = message.content.find((b) => b.type === "text");
    return textBlock?.text ?? generateFallbackSummary(result, input.useCase);
  } catch {
    return generateFallbackSummary(result, input.useCase);
  }
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: AuditInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate
  if (!body.tools || !Array.isArray(body.tools) || body.tools.length === 0) {
    return NextResponse.json({ error: "tools array required" }, { status: 400 });
  }
  if (!body.teamSize || body.teamSize < 1) {
    return NextResponse.json({ error: "teamSize must be >= 1" }, { status: 400 });
  }

  // Run deterministic audit
  const result = runAudit(body);
  const shareId = generateShareId();
  const aiSummary = await generateAiSummary(body, result);

  // Persist to Supabase only when credentials are configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createServerClient();
      if (supabase) {
        await supabase.from("audits").insert({
          share_id: shareId,
          input_data: body,
          result_data: result,
          ai_summary: aiSummary,
          created_at: new Date().toISOString(),
          ip_hash: ip.split(".").slice(0, 2).join(".") + ".x.x",
        });
      }
    } catch (dbErr) {
      console.error("DB write failed:", dbErr);
    }
  }

  return NextResponse.json({ ...result, aiSummary, shareId }, { status: 200 });
}
