const USER_ID_KEY = "netsentinel_user_id";

export function generateUserKey(): string {
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timePart = Date.now().toString(36);
  return `usr_${randomPart}${timePart}`;
}

export function getUserId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    let stored = localStorage.getItem(USER_ID_KEY);
    if (!stored || stored.trim() === "") {
      stored = generateUserKey();
      localStorage.setItem(USER_ID_KEY, stored);
      document.cookie = `${USER_ID_KEY}=${stored}; path=/; max-age=31536000; SameSite=Lax`;
    }
    return stored;
  } catch (e) {
    return "";
  }
}

export function setUserId(newId: string): void {
  if (typeof window === "undefined") return;

  const cleaned = newId.trim();
  if (!cleaned) return;

  try {
    localStorage.setItem(USER_ID_KEY, cleaned);
    document.cookie = `${USER_ID_KEY}=${cleaned}; path=/; max-age=31536000; SameSite=Lax`;
    window.dispatchEvent(new Event("netsentinel_user_changed"));
  } catch (e) {
    console.error("Failed to persist user ID:", e);
  }
}

export function resetUserKey(): string {
  const newKey = generateUserKey();
  setUserId(newKey);
  return newKey;
}
