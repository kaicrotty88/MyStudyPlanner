import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { refreshGoogleAccessToken } from "@/lib/googleCalendar";

const TABLE = "calendar_integrations";
function key() { return crypto.createHash("sha256").update(process.env.GOOGLE_CALENDAR_CLIENT_SECRET || "").digest(); }
function encrypt(value: string) { const iv=crypto.randomBytes(12); const cipher=crypto.createCipheriv("aes-256-gcm", key(), iv); const encrypted=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]); const tag=cipher.getAuthTag(); return [iv,tag,encrypted].map(x=>x.toString("base64url")).join("."); }
function decrypt(value: string) { const [a,b,c]=value.split(".").map(x=>Buffer.from(x,"base64url")); const decipher=crypto.createDecipheriv("aes-256-gcm",key(),a); decipher.setAuthTag(b); return Buffer.concat([decipher.update(c),decipher.final()]).toString("utf8"); }

export type GoogleIntegrationRow = { user_id:string; access_token:string|null; refresh_token:string; expires_at:string|null; selected_calendar_ids:string[]|null; last_imported_at:string|null; };

export async function saveGoogleIntegration(userId:string, tokens:{access_token:string;refresh_token?:string;expires_in?:number}) {
  const supabase=getSupabaseAdmin();
  const existing=await getGoogleIntegration(userId).catch(()=>null);
  const refresh=tokens.refresh_token ? encrypt(tokens.refresh_token) : existing?.refresh_token;
  if (!refresh) throw new Error("Google did not return a refresh token. Reconnect and approve access again.");
  const {error}=await supabase.from(TABLE).upsert({user_id:userId,provider:"google",access_token:encrypt(tokens.access_token),refresh_token:refresh,expires_at:tokens.expires_in?new Date(Date.now()+tokens.expires_in*1000).toISOString():null,updated_at:new Date().toISOString()},{onConflict:"user_id,provider"});
  if(error) throw error;
}
export async function getGoogleIntegration(userId:string):Promise<GoogleIntegrationRow|null>{ const {data,error}=await getSupabaseAdmin().from(TABLE).select("user_id,access_token,refresh_token,expires_at,selected_calendar_ids,last_imported_at").eq("user_id",userId).eq("provider","google").maybeSingle(); if(error) throw error; return data as GoogleIntegrationRow|null; }
export async function getValidGoogleAccessToken(userId:string){ const row=await getGoogleIntegration(userId); if(!row) throw new Error("Google Calendar is not connected."); const expires=row.expires_at?new Date(row.expires_at).getTime():0; if(row.access_token && expires>Date.now()+60000) return decrypt(row.access_token); const refreshed=await refreshGoogleAccessToken(decrypt(row.refresh_token)); await saveGoogleIntegration(userId,{...refreshed,refresh_token:decrypt(row.refresh_token)}); return refreshed.access_token; }
export async function updateGoogleImportSettings(userId:string, selected:string[]){ const {error}=await getSupabaseAdmin().from(TABLE).update({selected_calendar_ids:selected,last_imported_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("user_id",userId).eq("provider","google"); if(error) throw error; }
export async function disconnectGoogle(userId:string){ const {error}=await getSupabaseAdmin().from(TABLE).delete().eq("user_id",userId).eq("provider","google"); if(error) throw error; }