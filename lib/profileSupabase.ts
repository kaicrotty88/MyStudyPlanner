import type { SupabaseClient } from "@supabase/supabase-js";

const TABLE = "profiles";

export type Plan = "free" | "premium";

export type ProfileRow = {
  user_id: string;
  plan: Plan;
  subscription_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  has_completed_onboarding: boolean;
  onboarding_completed_at: string | null;
  created_at?: string;
  updated_at?: string;
};

const PROFILE_SELECT =
  "user_id, plan, subscription_status, stripe_customer_id, stripe_subscription_id, has_completed_onboarding, onboarding_completed_at, created_at, updated_at";

export async function fetchProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(PROFILE_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return (data as ProfileRow | null) ?? null;
}

export async function ensureProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileRow> {
  const existing = await fetchProfile(supabase, userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: userId,
        plan: "free",
        subscription_status: "inactive",
        has_completed_onboarding: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select(PROFILE_SELECT)
    .single();

  if (error) throw error;

  return data as ProfileRow;
}

export async function fetchUserPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<Plan> {
  const profile = await ensureProfile(supabase, userId);
  return profile.plan;
}


export async function updateUserPlan(
  supabase: SupabaseClient,
  userId: string,
  plan: Plan,
  subscriptionStatus = plan === "premium" ? "active" : "inactive"
): Promise<void> {
  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      plan,
      subscription_status: subscriptionStatus,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw error;
}