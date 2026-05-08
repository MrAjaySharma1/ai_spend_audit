/**
 * PRICING_DATA.ts
 * Authoritative pricing constants for all supported AI tools.
 * Last verified: May 2025. Update whenever vendors change pricing.
 */

export type PlanTier = "free" | "pro" | "team" | "enterprise" | "api";

export interface ToolPlan {
  id: string;
  name: string;
  pricePerSeat: number; // USD / month / seat (0 for API usage-based)
  isApiPlan: boolean;
  maxSeats?: number; // if plan has seat limits
  minSeats?: number; // enterprise minimums
  notes: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: "ide" | "chat" | "api" | "agent";
  plans: ToolPlan[];
  defaultAlternatives: string[]; // IDs of cheaper alternatives
}

export const TOOL_CATALOG: Record<string, ToolDefinition> = {
  cursor: {
    id: "cursor",
    name: "Cursor",
    category: "ide",
    plans: [
      { id: "cursor_hobby", name: "Hobby (Free)", pricePerSeat: 0, isApiPlan: false, notes: "Limited requests/month" },
      { id: "cursor_pro", name: "Pro", pricePerSeat: 20, isApiPlan: false, notes: "Unlimited fast requests, $20/seat/month" },
      { id: "cursor_business", name: "Business", pricePerSeat: 40, isApiPlan: false, minSeats: 1, notes: "Team features, SSO, $40/seat/month" },
    ],
    defaultAlternatives: ["github_copilot", "windsurf"],
  },
  github_copilot: {
    id: "github_copilot",
    name: "GitHub Copilot",
    category: "ide",
    plans: [
      { id: "copilot_free", name: "Free", pricePerSeat: 0, isApiPlan: false, notes: "2,000 completions/month" },
      { id: "copilot_pro", name: "Pro", pricePerSeat: 10, isApiPlan: false, notes: "$10/seat/month" },
      { id: "copilot_pro_plus", name: "Pro+", pricePerSeat: 39, isApiPlan: false, notes: "$39/seat/month, premium models" },
      { id: "copilot_business", name: "Business", pricePerSeat: 19, isApiPlan: false, minSeats: 1, notes: "$19/seat/month, team management" },
      { id: "copilot_enterprise", name: "Enterprise", pricePerSeat: 39, isApiPlan: false, minSeats: 300, notes: "$39/seat/month, enterprise features" },
    ],
    defaultAlternatives: ["cursor", "windsurf"],
  },
  claude: {
    id: "claude",
    name: "Claude (Anthropic)",
    category: "chat",
    plans: [
      { id: "claude_free", name: "Free", pricePerSeat: 0, isApiPlan: false, notes: "Limited usage" },
      { id: "claude_pro", name: "Pro", pricePerSeat: 20, isApiPlan: false, notes: "$20/seat/month" },
      { id: "claude_team", name: "Team", pricePerSeat: 30, isApiPlan: false, minSeats: 5, notes: "$30/seat/month, min 5 seats" },
      { id: "claude_enterprise", name: "Enterprise", pricePerSeat: 0, isApiPlan: false, notes: "Custom pricing" },
    ],
    defaultAlternatives: ["anthropic_api", "chatgpt"],
  },
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT (OpenAI)",
    category: "chat",
    plans: [
      { id: "chatgpt_free", name: "Free", pricePerSeat: 0, isApiPlan: false, notes: "GPT-4o mini, limited GPT-4o" },
      { id: "chatgpt_plus", name: "Plus", pricePerSeat: 20, isApiPlan: false, notes: "$20/seat/month" },
      { id: "chatgpt_pro", name: "Pro", pricePerSeat: 200, isApiPlan: false, notes: "$200/seat/month, o1 pro unlimited" },
      { id: "chatgpt_team", name: "Team", pricePerSeat: 30, isApiPlan: false, minSeats: 2, notes: "$30/seat/month, min 2 seats" },
      { id: "chatgpt_enterprise", name: "Enterprise", pricePerSeat: 0, isApiPlan: false, notes: "Custom pricing" },
    ],
    defaultAlternatives: ["openai_api", "claude"],
  },
  anthropic_api: {
    id: "anthropic_api",
    name: "Anthropic API",
    category: "api",
    plans: [
      { id: "anthropic_api_payg", name: "Pay-as-you-go", pricePerSeat: 0, isApiPlan: true, notes: "Claude 3.5 Sonnet: $3/MTok input, $15/MTok output" },
    ],
    defaultAlternatives: ["openai_api"],
  },
  openai_api: {
    id: "openai_api",
    name: "OpenAI API",
    category: "api",
    plans: [
      { id: "openai_api_payg", name: "Pay-as-you-go", pricePerSeat: 0, isApiPlan: true, notes: "GPT-4o: $2.50/MTok input, $10/MTok output" },
    ],
    defaultAlternatives: ["anthropic_api"],
  },
  gemini: {
    id: "gemini",
    name: "Gemini (Google)",
    category: "chat",
    plans: [
      { id: "gemini_free", name: "Free", pricePerSeat: 0, isApiPlan: false, notes: "Gemini 1.5 Flash, limited" },
      { id: "gemini_advanced", name: "Advanced (Google One AI Premium)", pricePerSeat: 20, isApiPlan: false, notes: "$19.99/month, Gemini 1.5 Pro" },
      { id: "gemini_business", name: "Business (Workspace)", pricePerSeat: 24, isApiPlan: false, notes: "$24/seat/month billed annually" },
      { id: "gemini_enterprise", name: "Enterprise (Workspace)", pricePerSeat: 36, isApiPlan: false, notes: "$36/seat/month billed annually" },
    ],
    defaultAlternatives: ["claude", "chatgpt"],
  },
  windsurf: {
    id: "windsurf",
    name: "Windsurf (Codeium)",
    category: "ide",
    plans: [
      { id: "windsurf_free", name: "Free", pricePerSeat: 0, isApiPlan: false, notes: "Limited AI flows" },
      { id: "windsurf_pro", name: "Pro", pricePerSeat: 15, isApiPlan: false, notes: "$15/seat/month" },
      { id: "windsurf_teams", name: "Teams", pricePerSeat: 15, isApiPlan: false, minSeats: 2, notes: "$15/seat/month" },
    ],
    defaultAlternatives: ["cursor", "github_copilot"],
  },
  v0: {
    id: "v0",
    name: "v0 (Vercel)",
    category: "agent",
    plans: [
      { id: "v0_free", name: "Free", pricePerSeat: 0, isApiPlan: false, notes: "200 credits/month" },
      { id: "v0_premium", name: "Premium", pricePerSeat: 20, isApiPlan: false, notes: "$20/month, 5000 credits" },
      { id: "v0_team", name: "Team", pricePerSeat: 0, isApiPlan: false, notes: "Custom team pricing" },
    ],
    defaultAlternatives: ["cursor", "windsurf"],
  },
};

/** Lookup a plan by its composite ID */
export function findPlan(toolId: string, planId: string): ToolPlan | undefined {
  return TOOL_CATALOG[toolId]?.plans.find((p) => p.id === planId);
}

/** Return tool name from ID */
export function getToolName(toolId: string): string {
  return TOOL_CATALOG[toolId]?.name ?? toolId;
}
