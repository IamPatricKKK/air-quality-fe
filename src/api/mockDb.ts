/**
 * Lớp mock đọc dữ liệu THẬT (trích từ bản dump PostgreSQL) ở dạng JSON tĩnh
 * trong /public/mock. Bật bằng env `VITE_USE_MOCK=true` để chạy FE offline,
 * KHÔNG cần air-quality-api (NestJS) hay air-quality-be (FastAPI).
 *
 * Sinh lại dữ liệu: `bash scripts/gen-mock-data.sh` (xem file đó).
 */

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const cache = new Map<string, Promise<unknown>>();

function loadJson<T>(name: string): Promise<T> {
  let p = cache.get(name);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}mock/${name}.json`).then((r) => {
      if (!r.ok) throw new Error(`Mock file not found: ${name}.json (${r.status})`);
      return r.json();
    });
    cache.set(name, p);
  }
  return p as Promise<T>;
}

/** Tách path "/a/b?x=1" -> { segments:["a","b"], query: URLSearchParams } */
function parse(path: string) {
  const [rawPath, rawQuery = ""] = path.split("?");
  const segments = rawPath.split("/").filter(Boolean);
  return { segments, query: new URLSearchParams(rawQuery) };
}

/** Lọc mảng điểm lịch sử theo số giờ, tính tương đối so với điểm mới nhất. */
function sliceByHours<T extends { recorded_at?: string; detectedAt?: string }>(
  points: T[],
  hours: number,
  field: "recorded_at" | "detectedAt" = "recorded_at",
): T[] {
  if (!points.length) return points;
  const times = points.map((p) => new Date(p[field] as string).getTime());
  const latest = Math.max(...times);
  const cutoff = latest - hours * 3600_000;
  return points.filter((p) => new Date(p[field] as string).getTime() >= cutoff);
}

/** Lọc theo số ngày (dùng cho daily-summaries / anomalies). */
function sliceByDays<T extends Record<string, unknown>>(
  rows: T[],
  days: number,
  field: string,
): T[] {
  if (!rows.length) return rows;
  const times = rows.map((r) => new Date(String(r[field])).getTime());
  const latest = Math.max(...times);
  const cutoff = latest - days * 86_400_000;
  return rows.filter((r) => new Date(String(r[field])).getTime() >= cutoff);
}

// ---------------------------------------------------------------------------
// Giả lập đăng nhập/đăng ký: không có backend nên chấp nhận MỌI tài khoản và
// tạo phiên giả để FE hoạt động (alerts, ghim trạm, hồ sơ...) ở chế độ mock.
// ---------------------------------------------------------------------------
function parseBody<T>(init?: RequestInit): T {
  try {
    return (init?.body ? JSON.parse(init.body as string) : {}) as T;
  } catch {
    return {} as T;
  }
}

// Tùy chọn người dùng ở chế độ mock — lưu localStorage để ghim trạm / khu vực
// yêu thích vẫn hoạt động qua các lần tải lại (không có backend).
const PREFS_KEY = "air-quality-fe:mock-preferences";
const DEFAULT_PREFS = {
  notificationMode: "all",
  favoriteRegions: [],
  pushEnabled: false,
  emailEnabled: false,
  pinnedStationIds: [],
};

function loadPrefs<T>(): T {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return { ...DEFAULT_PREFS, ...(raw ? JSON.parse(raw) : {}) } as T;
  } catch {
    return { ...DEFAULT_PREFS } as T;
  }
}

function savePrefs<T>(init?: RequestInit): T {
  const patch = parseBody<Record<string, unknown>>(init);
  delete (patch as { userId?: unknown }).userId;
  const next = { ...loadPrefs<Record<string, unknown>>(), ...patch };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    /* localStorage không khả dụng */
  }
  return next as T;
}

function mockAuth<T>(action: string | undefined, init?: RequestInit): T {
  let body: { email?: string; displayName?: string } = {};
  try {
    body = init?.body ? JSON.parse(init.body as string) : {};
  } catch {
    /* body không phải JSON */
  }

  // verify-email / resend-verification / forgot-password / reset-password / logout
  if (action && ["verify-email", "resend-verification", "forgot-password", "reset-password", "logout"].includes(action)) {
    return { success: true, message: "OK (mock)" } as T;
  }

  // login / register / google → trả phiên giả { user, session }
  const email = body.email || "demo@local.mock";
  const name = body.displayName || email.split("@")[0] || "Người dùng";
  const session = {
    user: {
      id: `mock-${email}`,
      email,
      roles: ["user"],
      user_metadata: { display_name: name },
    },
    session: {
      access_token: `mock-token-${Date.now()}`,
      expires_at: "2099-01-01T00:00:00Z",
    },
  };
  return session as T;
}

// ---------------------------------------------------------------------------
// Router cho air-quality-api (NestJS, VITE_AIR_QUALITY_API_URL)
// ---------------------------------------------------------------------------
export async function mockApiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const { segments, query } = parse(path);
  const [head, b, c] = segments;

  // Ghi (POST/PUT/PATCH/DELETE) — không có backend, trả mặc định ổn định.
  if (method !== "GET") {
    if (head === "auth") return mockAuth<T>(b, init);
    if (head === "users" && b === "preferences") return savePrefs<T>(init);
    if (head === "users" && b === "profile") return parseBody<{ displayName?: string }>(init) as T;
    if (head === "users" && b === "password") return { message: "Đã đổi mật khẩu (mock)" } as T;
    if (head === "alerts" || head === "alert-rules") return { success: true } as T;
    return {} as T;
  }

  if (head === "users" && b === "preferences") return loadPrefs<T>();

  if (head === "stations") {
    if (!b) return loadJson<T>("stations");
    if (c === "history") {
      const map = await loadJson<Record<string, unknown[]>>("history");
      const hours = Number(query.get("hours") ?? 24);
      return sliceByHours((map[b] as never[]) ?? [], hours) as T;
    }
    if (c === "analytics") {
      const map = await loadJson<Record<string, unknown>>("analytics");
      const found = map[b];
      if (!found) throw new MockNotFound(`analytics for station ${b}`);
      return found as T;
    }
  }

  if (head === "wards") {
    const all = await loadJson<Array<{ provinceCode?: string; provinceName?: string }>>("wards");
    const province = query.get("province");
    const data = province
      ? all.filter((w) => w.provinceCode === province || w.provinceName === province)
      : all;
    return data as T;
  }

  // Endpoint cần đăng nhập — không có user trong chế độ mock → trả rỗng.
  if (head === "alerts" && b === "unread-count") return { count: 0 } as T;
  if (head === "alerts") return [] as T;
  if (head === "alert-rules") return [] as T;
  if (head === "notifications") return [] as T;

  throw new MockNotFound(path);
}

// ---------------------------------------------------------------------------
// Router cho air-quality-be (FastAPI, VITE_AIR_QUALITY_BE_URL)
// ---------------------------------------------------------------------------
export async function mockBeRequest<T>(path: string): Promise<T> {
  const { segments, query } = parse(path);
  // segments: ["analytics", ...]
  const sub = segments.slice(1); // bỏ "analytics"

  if (sub[0] === "forecast" && sub[1] === "latest") {
    const map = await loadJson<Record<string, unknown>>("forecast");
    const id = query.get("stationId") ?? "";
    const found = map[id];
    if (!found) throw new MockNotFound(`forecast for station ${id}`);
    return found as T;
  }

  if (sub[0] === "daily-summaries") {
    const map = await loadJson<Record<string, Array<Record<string, unknown>>>>("daily-summaries");
    const id = query.get("stationId");
    const days = Number(query.get("days") ?? 30);
    const rows = id ? map[id] ?? [] : Object.values(map).flat();
    return sliceByDays(rows, days, "summaryDate") as T;
  }

  if (sub[0] === "anomalies") {
    const map = await loadJson<Record<string, Array<Record<string, unknown>>>>("anomalies");
    const id = query.get("stationId");
    const days = Number(query.get("days") ?? 7);
    const rows = id ? map[id] ?? [] : Object.values(map).flat();
    return sliceByDays(rows, days, "detectedAt") as T;
  }

  if (sub[0] === "grid" && sub[1] === "latest") return loadJson<T>("grid");
  if (sub[0] === "grid" && sub[1] === "stats") {
    return { total_grid_points: 0, fresh_within_6h: 0, by_source: [] } as T;
  }

  throw new MockNotFound(path);
}

export class MockNotFound extends Error {
  constructor(what: string) {
    super(`[mock] Không có dữ liệu mock cho: ${what}`);
    this.name = "MockNotFound";
  }
}
