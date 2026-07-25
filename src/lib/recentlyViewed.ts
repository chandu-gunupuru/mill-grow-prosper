const KEY = "gmr_recently_viewed_v1";
const MAX = 8;

export const recentlyViewed = {
  list(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  },
  push(id: string) {
    if (typeof window === "undefined") return;
    try {
      const cur = recentlyViewed.list().filter((x) => x !== id);
      const next = [id, ...cur].slice(0, MAX);
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  },
};
