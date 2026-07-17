// lib/plannerPersistence.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchPlannerState, upsertPlannerState } from "@/lib/plannerStateSupabase";
import { guestDataKey, userDataKey } from "@/lib/storage";

export const LOCAL_KEY_PERIODS = "mystudyplanner-periods";

export type PlannerState = Record<string, unknown>;

export function readLocalState(userId?: string): PlannerState | null {
  try {
    const key = userId ? userDataKey(userId) : guestDataKey();
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as PlannerState) : null;
  } catch {
    return null;
  }
}

export function writeLocalState(state: PlannerState, userId?: string) {
  const key = userId ? userDataKey(userId) : guestDataKey();
  localStorage.setItem(key, JSON.stringify(state));
}

export async function loadState(
  supabase: SupabaseClient
): Promise<PlannerState | null> {
  return await fetchPlannerState(supabase);
}

export async function saveState(
  supabase: SupabaseClient,
  state: PlannerState
): Promise<void> {
  await upsertPlannerState(supabase, state);
}