import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let body: { email: string; company?: string; role?: string; shareId: string; monthlySavings: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.email?.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createServerClient();
      if (supabase) {
        await supabase.from("leads").insert({
          email: body.email,
          company: body.company ?? null,
          role: body.role ?? null,
          share_id: body.shareId,
          monthly_savings: body.monthlySavings,
          created_at: new Date().toISOString(),
        });
      }
    }

    // Send confirmation email via Resend if configured
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "AI Spend Audit <hello@aispendaudit.com>",
        to: body.email,
        subject: "Your AI Spend Audit Report",
        html: `<p>Thanks for running your AI spend audit! Your report is ready at <a href="${process.env.NEXT_PUBLIC_APP_URL}/results/${body.shareId}">View Report</a>.</p>`,
      });
    }
  } catch (err) {
    console.error("Lead capture failed:", err);
    // Don't expose internal errors
  }

  return NextResponse.json({ ok: true });
}
