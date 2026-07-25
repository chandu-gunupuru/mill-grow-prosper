const KEY = "gmr_wishlist_v1";
const EVT = "gmr:wishlist-changed";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(EVT));
  } catch {
    /* ignore */
  }
}

export const wishlist = {
  list: read,
  has: (id: string) => read().includes(id),
  add: (id: string) => {
    const cur = read();
    if (!cur.includes(id)) write([id, ...cur]);
  },
  remove: (id: string) => write(read().filter((x) => x !== id)),
  toggle: (id: string) => {
    const cur = read();
    if (cur.includes(id)) {
      write(cur.filter((x) => x !== id));
      return false;
    }
    write([id, ...cur]);
    return true;
  },
  subscribe(cb: () => void) {
    if (typeof window === "undefined") return () => {};
    const h = () => cb();
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  },
};
