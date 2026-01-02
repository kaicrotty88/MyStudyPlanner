export const LEGACY_SHARED_KEY = "mystudylife-data"; // change this ONLY if your old key was different

export function userDataKey(userId: string) {
  return `mystudyplanner:${userId}:data`;
}
