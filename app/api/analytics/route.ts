import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_EVENTS = new Set([
  "app_opened",
  "feature_opened",
  "subject_created",
  "task_created",
  "timetable_class_created",
  "study_session_created",
  "study_session_completed",
  "study_recommendation_started",
  "marks_paywall_viewed",
  "premium_viewed",
  "premium_checkout_started",
  "premium_portal_opened",
]);

type AnalyticsBody = {
  eventName?: string;
  properties?: Record<string, unknown>;
};

const sanitiseProperties = (properties: Record<string, unknown> | undefined) => {
  if (!properties) return {};

  const entries = Object.entries(properties)
    .slice(0, 20)
    .filter(([, value]) =>
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    )
    .map(([key, value]) => [key.slice(0, 80), typeof value === "string" ? value.slice(0, 200) : value]);

  return Object.fromEntries(entries);
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as AnalyticsBody | null;
    const eventName = body?.eventName?.trim();

    if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
      return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("analytics_events").insert({
      user_id: userId,
      event_name: eventName,
      properties: sanitiseProperties(body?.properties),
    });

    if (error) throw error;

    return NextResponse.json({ recorded: true });
  } catch (error) {
    console.error("Analytics event error:", error);
    return NextResponse.json({ error: "Could not record analytics event." }, { status: 500 });
  }
}