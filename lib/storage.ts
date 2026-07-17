export const LEGACY_SHARED_KEY = "mystudyplanner-data";

export function userDataKey(userId: string) {
  return `mystudyplanner-data:${userId}`;
}

export function guestDataKey() {
  return "mystudyplanner-data:guest";
}