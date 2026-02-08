"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { fetchPlannerState, upsertPlannerState } from "@/lib/plannerStateSupabase";

export default function SupabaseTestPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { session } = useSession();

  const [remote, setRemote] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => {
    if (!session) return null;
    return getSupabaseClient(() => session.getToken() ?? Promise.resolve(null));
  }, [session]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !supabase) return;

    (async () => {
      await upsertPlannerState(supabase, { hello: "world", ts: Date.now() });
      const data = await fetchPlannerState(supabase);
      setRemote(data);
    })().catch((e) => setError(String(e?.message ?? e)));
  }, [isLoaded, isSignedIn, supabase]);

  if (!isLoaded) return <div className="p-6">Loading…</div>;
  if (!isSignedIn) return <div className="p-6">Sign in first.</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Supabase + Clerk test</h1>
      {error && <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>}
      <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(remote, null, 2)}</pre>
    </div>
  );
}
