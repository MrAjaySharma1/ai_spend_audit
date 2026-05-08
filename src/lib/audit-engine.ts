/**
 * Audit Engine — deterministic business logic for spend analysis.
 * NO AI calls in this module. Pure functions, fully testable.
 */

import { TOOL_CATALOG, findPlan, getToolName } from "./pricing-data";

// ─── Input types ────────────────────────────────────────────────────────────

export type UseCase = "coding" | "writing" | "research" | "data" | "mixed";

export interface ToolEntry {
  toolId: string;
  planId: string;
  seats: number;
  monthlySpend: number; // user-reported actual spend
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

// ─── Output types ────────────────────────────────────────────────────────────

export type FindingSeverity = "critical" | "warning" | "info" | "ok";

export interface ToolFinding {
  toolId: string;
  toolName: string;
  planId: string;
  currentMonthlyCost: number;
  issue: string | null;
  severity: FindingSeverity;
  recommendedPlanId: string | null;
  recommendedPlanName: string | null;
  recommendedMonthlyCost: number;
  savingsPerMonth: number;
  reasoning: string;
}

export interface AuditResult {
  currentMonthlyTotal: number;
  recommendedMonthlyTotal: number;
  monthlySavings: number;
  annualSavings: number;
  findings: ToolFinding[];
  overallScore: number; // 0-100, higher = better optimized
  summaryLine: string;
  consultationRecommended: boolean;
  duplicates: string[][]; // groups of overlapping tool IDs
}

// ─── Rules ───────────────────────────────────────────────────────────────────

/** Rule 1: Small team on enterprise / high-tier plan */
function ruleSmallTeamOverpaying(entry: ToolEntry, teamSize: number): Partial<ToolFinding> | null {
  const tool = TOOL_CATALOG[entry.toolId];
  if (!tool) return null;
  const plan = tool.plans.find((p) => p.id === entry.planId);
  if (!plan) return null;

  // Enterprise tiers are typically 2x or more expensive
  const isEnterpriseTier =
    plan.id.includes("enterprise") || plan.id.includes("business") || plan.id.includes("pro_plus");

  if (isEnterpriseTier && teamSize <= 5) {
    // Find cheapest non-free non-enterprise plan
    const cheaper = tool.plans.find(
      (p) => p.pricePerSeat > 0 && !p.id.includes("enterprise") && !p.id.includes("business") && p.pricePerSeat < plan.pricePerSeat
    );
    if (cheaper) {
      const saving = (plan.pricePerSeat - cheaper.pricePerSeat) * entry.seats;
      return {
        issue: `Small team (${teamSize} seats) on enterprise-tier plan`,
        severity: saving > 100 ? "critical" : "warning",
        recommendedPlanId: cheaper.id,
        recommendedPlanName: cheaper.name,
        recommendedMonthlyCost: cheaper.pricePerSeat * entry.seats,
        savingsPerMonth: saving,
        reasoning: `With only ${teamSize} team members, the ${plan.name} plan at $${plan.pricePerSeat}/seat is over-provisioned. Downgrading to ${cheaper.name} at $${cheaper.pricePerSeat}/seat saves $${saving.toFixed(0)}/month with no functional loss for small teams.`,
      };
    }
  }
  return null;
}

/** Rule 2: API usage would be cheaper than seat licensing */
function ruleApiCheaperThanSeats(entry: ToolEntry, teamSize: number): Partial<ToolFinding> | null {
  const tool = TOOL_CATALOG[entry.toolId];
  if (!tool || tool.category !== "chat") return null;
  const plan = tool.plans.find((p) => p.id === entry.planId);
  if (!plan || plan.isApiPlan) return null;

  // If team size is ≤ 3 and use case involves API-amenable work, API can be cheaper
  // Estimate: avg developer uses ~1M tokens/month at moderate usage
  // Claude 3.5 Sonnet: $3 input + $15 output ≈ $9 blended per MTok
  // Typical dev: 0.5M tokens = ~$4.50 vs $20 seat
  const estimatedApiCostPerSeat = 8; // conservative monthly estimate
  const currentCostPerSeat = plan.pricePerSeat;

  if (currentCostPerSeat > 0 && estimatedApiCostPerSeat < currentCostPerSeat * 0.6 && teamSize <= 3) {
    const saving = (currentCostPerSeat - estimatedApiCostPerSeat) * entry.seats;
    // Only recommend for coding/data use cases where API integration is practical
    if (saving > 10) {
      const apiToolId = entry.toolId === "claude" ? "anthropic_api" : "openai_api";
      return {
        issue: "Seat license more expensive than direct API access for small team",
        severity: "warning",
        recommendedPlanId: `${apiToolId}_payg`,
        recommendedPlanName: `${getToolName(apiToolId)} (Pay-as-you-go)`,
        recommendedMonthlyCost: estimatedApiCostPerSeat * entry.seats,
        savingsPerMonth: saving,
        reasoning: `For a ${teamSize}-person team with light-to-moderate usage, the API pay-as-you-go model (~$${estimatedApiCostPerSeat}/seat equivalent) beats the $${currentCostPerSeat}/seat license. Requires minor integration work but pays back quickly.`,
      };
    }
  }
  return null;
}

/** Rule 3: Duplicate IDE tools (Cursor + Copilot + Windsurf) */
function ruleDuplicateIdeTools(tools: ToolEntry[]): string[][] {
  const ideTools = tools.filter((t) => {
    const tool = TOOL_CATALOG[t.toolId];
    return tool?.category === "ide";
  });
  if (ideTools.length >= 2) {
    return [ideTools.map((t) => t.toolId)];
  }
  return [];
}

/** Rule 4: Duplicate chat tools */
function ruleDuplicateChatTools(tools: ToolEntry[]): string[][] {
  const chatTools = tools.filter((t) => {
    const tool = TOOL_CATALOG[t.toolId];
    return tool?.category === "chat" && !tool.plans.find((p) => p.id === t.planId)?.isApiPlan;
  });
  if (chatTools.length >= 2) {
    return [chatTools.map((t) => t.toolId)];
  }
  return [];
}

/** Rule 5: Unnecessary premium tier */
function ruleUnnecessaryPremium(entry: ToolEntry, useCase: UseCase): Partial<ToolFinding> | null {
  const tool = TOOL_CATALOG[entry.toolId];
  if (!tool) return null;
  const plan = tool.plans.find((p) => p.id === entry.planId);
  if (!plan) return null;

  // ChatGPT Pro at $200/month is rarely justified unless heavy o1 usage
  if (entry.toolId === "chatgpt" && plan.id === "chatgpt_pro") {
    const cheaper = tool.plans.find((p) => p.id === "chatgpt_plus");
    if (cheaper) {
      const saving = (plan.pricePerSeat - cheaper.pricePerSeat) * entry.seats;
      return {
        issue: "ChatGPT Pro ($200/seat) is rarely cost-effective vs Plus ($20/seat)",
        severity: "critical",
        recommendedPlanId: cheaper.id,
        recommendedPlanName: cheaper.name,
        recommendedMonthlyCost: cheaper.pricePerSeat * entry.seats,
        savingsPerMonth: saving,
        reasoning: `ChatGPT Pro at $200/seat is only justified for intensive o1 Pro usage. For ${useCase} workflows, ChatGPT Plus ($20/seat) provides 90%+ of the value at 1/10th the cost.`,
      };
    }
  }

  // Copilot Enterprise with small teams
  if (entry.toolId === "github_copilot" && plan.id === "copilot_enterprise" && entry.seats < 20) {
    const cheaper = tool.plans.find((p) => p.id === "copilot_business");
    if (cheaper) {
      const saving = (plan.pricePerSeat - cheaper.pricePerSeat) * entry.seats;
      return {
        issue: "Copilot Enterprise plan overkill for teams under 20",
        severity: "warning",
        recommendedPlanId: cheaper.id,
        recommendedPlanName: cheaper.name,
        recommendedMonthlyCost: cheaper.pricePerSeat * entry.seats,
        savingsPerMonth: saving,
        reasoning: `Copilot Enterprise ($39/seat) adds knowledge base indexing and PR summaries — features with diminishing value under 20 devs. Business tier ($19/seat) covers all core AI features and saves $${saving.toFixed(0)}/month.`,
      };
    }
  }

  return null;
}

/** Rule 6: Windsurf/v0 duplicate with Cursor */
function ruleBetterFitAlternative(entry: ToolEntry, allTools: ToolEntry[], useCase: UseCase): Partial<ToolFinding> | null {
  // If they have Cursor Pro AND Copilot Pro — recommend dropping Copilot
  const hasCursorPro = allTools.some((t) => t.toolId === "cursor" && t.planId === "cursor_pro");
  const hasCopilotPro = allTools.some((t) => t.toolId === "github_copilot" && !t.planId.includes("free"));

  if (entry.toolId === "github_copilot" && hasCursorPro && hasCopilotPro) {
    const plan = TOOL_CATALOG[entry.toolId]?.plans.find((p) => p.id === entry.planId);
    if (!plan) return null;
    const saving = plan.pricePerSeat * entry.seats;
    return {
      issue: "Cursor Pro already includes Claude/GPT access — Copilot is redundant",
      severity: "warning",
      recommendedPlanId: "copilot_free",
      recommendedPlanName: "GitHub Copilot Free (or cancel)",
      recommendedMonthlyCost: 0,
      savingsPerMonth: saving,
      reasoning: `Cursor Pro bundles frontier model access (Claude, GPT-4o) natively. Maintaining a separate GitHub Copilot subscription creates duplicate AI spend for code completion. Downgrade to Copilot Free or cancel to save $${saving.toFixed(0)}/month.`,
    };
  }
  return null;
}

// ─── Main audit function ──────────────────────────────────────────────────────

export function runAudit(input: AuditInput): AuditResult {
  const findings: ToolFinding[] = [];
  let currentMonthlyTotal = 0;
  let recommendedMonthlyTotal = 0;

  // Detect duplicate groups
  const duplicates: string[][] = [
    ...ruleDuplicateIdeTools(input.tools),
    ...ruleDuplicateChatTools(input.tools),
  ];

  for (const entry of input.tools) {
    const tool = TOOL_CATALOG[entry.toolId];
    const plan = tool?.plans.find((p) => p.id === entry.planId);

    // Compute current cost — prefer user-reported spend, fall back to catalog price
    const catalogMonthlyCost = plan ? plan.pricePerSeat * entry.seats : 0;
    const currentCost = entry.monthlySpend > 0 ? entry.monthlySpend : catalogMonthlyCost;
    currentMonthlyTotal += currentCost;

    // Run all rules; first matching rule wins
    const ruleResult =
      ruleUnnecessaryPremium(entry, input.useCase) ||
      ruleSmallTeamOverpaying(entry, input.teamSize) ||
      ruleBetterFitAlternative(entry, input.tools, input.useCase) ||
      ruleApiCheaperThanSeats(entry, input.teamSize) ||
      null;

    if (ruleResult && ruleResult.savingsPerMonth && ruleResult.savingsPerMonth > 0) {
      findings.push({
        toolId: entry.toolId,
        toolName: tool?.name ?? entry.toolId,
        planId: entry.planId,
        currentMonthlyCost: currentCost,
        issue: ruleResult.issue ?? null,
        severity: ruleResult.severity ?? "warning",
        recommendedPlanId: ruleResult.recommendedPlanId ?? null,
        recommendedPlanName: ruleResult.recommendedPlanName ?? null,
        recommendedMonthlyCost: ruleResult.recommendedMonthlyCost ?? currentCost,
        savingsPerMonth: ruleResult.savingsPerMonth ?? 0,
        reasoning: ruleResult.reasoning ?? "",
      });
      recommendedMonthlyTotal += ruleResult.recommendedMonthlyCost ?? currentCost;
    } else {
      // No issue found — spend this amount as-is
      findings.push({
        toolId: entry.toolId,
        toolName: tool?.name ?? entry.toolId,
        planId: entry.planId,
        currentMonthlyCost: currentCost,
        issue: null,
        severity: "ok",
        recommendedPlanId: entry.planId,
        recommendedPlanName: plan?.name ?? null,
        recommendedMonthlyCost: currentCost,
        savingsPerMonth: 0,
        reasoning: "This plan appears well-matched to your team size and use case.",
      });
      recommendedMonthlyTotal += currentCost;
    }
  }

  const monthlySavings = Math.max(0, currentMonthlyTotal - recommendedMonthlyTotal);
  const annualSavings = monthlySavings * 12;

  // Scoring: 100 = perfectly optimized, deduct for each issue
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const overallScore = Math.max(0, 100 - criticalCount * 30 - warningCount * 15 - duplicates.length * 20);

  const summaryLine =
    monthlySavings > 500
      ? `🚨 High overspend detected — you could save $${monthlySavings.toFixed(0)}/month ($${annualSavings.toFixed(0)}/year)`
      : monthlySavings > 100
      ? `⚠️ Some inefficiencies found — $${monthlySavings.toFixed(0)}/month savings available`
      : monthlySavings > 0
      ? `✅ Minor optimizations possible — $${monthlySavings.toFixed(0)}/month savings`
      : "✅ Your AI spend looks well-optimized for your team size";

  return {
    currentMonthlyTotal,
    recommendedMonthlyTotal,
    monthlySavings,
    annualSavings,
    findings,
    overallScore,
    summaryLine,
    consultationRecommended: monthlySavings > 500,
    duplicates,
  };
}

/** Generate a fallback templated summary when AI API is unavailable */
export function generateFallbackSummary(result: AuditResult, useCase: UseCase): string {
  const { monthlySavings, annualSavings, findings, overallScore, currentMonthlyTotal } = result;
  const issues = findings.filter((f) => f.severity !== "ok");

  if (monthlySavings === 0) {
    return `Your AI tooling stack is well-optimized for your team's ${useCase} workflows. Current spend of $${currentMonthlyTotal.toFixed(0)}/month aligns with your plan tiers and seat counts. Continue monitoring usage as your team scales — enterprise thresholds and API-vs-seat economics shift at higher usage volumes.`;
  }

  const topIssue = issues[0];
  return `Audit identified $${monthlySavings.toFixed(0)}/month ($${annualSavings.toFixed(0)}/year) in recoverable AI spend across your ${useCase} tooling stack. The primary opportunity: ${topIssue?.issue ?? "plan optimization"}. ${issues.length > 1 ? `${issues.length - 1} additional inefficiencies were flagged. ` : ""}Optimization score: ${overallScore}/100. Recommended changes require no workflow disruption and can be implemented within one billing cycle.`;
}
