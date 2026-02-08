import type { SupabaseClient } from "@supabase/supabase-js";

const TABLE = "planner_state";

export type PlannerStateRow = {
  data: Record<string, unknown>;
};

export async function fetchPlannerState(supabase: SupabaseClient): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase.from(TABLE).select("data").maybeSingle();
  if (error) throw error;
  return (data?.data as Record<string, unknown>) ?? null;
}

export async function upsertPlannerState(
  supabase: SupabaseClient,
  state: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from(TABLE).upsert({ data: state }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function clearPlannerState(supabase: SupabaseClient): Promise<void> {
  await upsertPlannerState(supabase, {});
}
