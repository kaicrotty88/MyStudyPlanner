import type { SupabaseClient } from "@supabase/supabase-js";

const TABLE = "profiles";

export type Plan = "free" | "premium";

export type ProfileRow = {
  user_id: string;
  plan: Plan;
  subscription_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function fetchProfile(supabase: SupabaseClient): Promise<ProfileRow | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select("user_id, plan, subscription_status, stripe_customer_id, stripe_subscription_id, created_at, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  return (data as ProfileRow | null) ?? null;
}

export async function ensureProfile(supabase: SupabaseClient): Promise<ProfileRow> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No signed-in user found.");

  const existing = await fetchProfile(supabase);
  if (existing) return existing;

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: user.id,
        plan: "free",
        subscription_status: "inactive",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select("user_id, plan, subscription_status, stripe_customer_id, stripe_subscription_id, created_at, updated_at")
    .single();

  if (error) throw error;

  return data as ProfileRow;
}

export async function fetchUserPlan(supabase: SupabaseClient): Promise<Plan> {
  const profile = await ensureProfile(supabase);
  return profile.plan;
}

export async function updateUserPlan(
  supabase: SupabaseClient,
  plan: Plan,
  subscriptionStatus = plan === "premium" ? "active" : "inactive"
): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No signed-in user found.");

  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: user.id,
      plan,
      subscription_status: subscriptionStatus,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw error;
}