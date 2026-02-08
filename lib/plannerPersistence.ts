// lib/plannerPersistence.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchPlannerState, upsertPlannerState } from "@/lib/plannerStateSupabase";

export const LOCAL_KEY_REAL = "mystudyplanner-data";
export const LOCAL_KEY_PERIODS = "mystudyplanner-periods";

export type PlannerState = Record<string, unknown>;

export function readLocalState(): PlannerState | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY_REAL);
    return raw ? (JSON.parse(raw) as PlannerState) : null;
  } catch {
    return null;
  }
}

export function writeLocalState(state: PlannerState) {
  localStorage.setItem(LOCAL_KEY_REAL, JSON.stringify(state));
}

export async function loadState(supabase: SupabaseClient): Promise<PlannerState | null> {
  return await fetchPlannerState(supabase);
}

export async function saveState(supabase: SupabaseClient, state: PlannerState): Promise<void> {
  await upsertPlannerState(supabase, state);
}
