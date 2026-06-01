# air-quality-fe — Chất Lượng Không Khí Việt Nam

Dashboard người dùng cuối của hệ thống Chất Lượng Không Khí Việt Nam. Là một Progressive Web App (PWA) viết bằng React 18 + Vite + TypeScript, giao tiếp với `air-quality-api` (NestJS) và `air-quality-be` (FastAPI).

## Tính năng chính

### Realtime + Offline
- **WebSocket realtime** (socket.io) — quan trắc mới được đẩy ngay tới client, không phải đợi polling
- **PWA installable** — cài lên home screen iOS/Android như app native
- **Offline mode** — service worker cache map tiles, GeoJSON, API response gần nhất
- **Web Push notifications** — nhận cảnh báo ngay cả khi đóng trình duyệt (cần VAPID + bật quyền)

### Giao diện
- **Bản đồ tương tác** 3 chế độ: Trạm (AQI pin có số), Khu vực (ranh giới tỉnh/huyện/xã), Nhiệt (heatmap)
- **Biểu đồ AQI 24 giờ** với reference lines theo thang US EPA
- **Lịch AQI 30 ngày** dạng heatmap (giống GitHub contribution graph)
- **So sánh trạm** — overlay biểu đồ AQI 24h cho tối đa 3 trạm
- **Dự báo Prophet** — biểu đồ dự báo AQI 24h với confidence interval (từ air-quality-be)
- **Khuyến nghị sức khoẻ** chi tiết cho 2 nhóm (người khoẻ mạnh + nhạy cảm)
- **Mobile-first** — 5 tab bottom nav, dark/light mode

### Cảnh báo
- Tự tạo rule theo trạm/chỉ số/ngưỡng, hỗ trợ AQI + 6 pollutant
- 3 kênh gửi: in-app · email · **push notification (PWA)**
- **Giờ yên tĩnh** — không gửi push trong khung giờ định trước (ví dụ 22:00 → 07:00)
- Trang lịch sử cảnh báo với filter (Tất cả / Chưa đọc / Đã đọc)

### Auth
- Đăng ký, đăng nhập, đăng xuất
- **Quên mật khẩu / đặt lại mật khẩu** qua email link (token hết hạn sau 60 phút)
- JWT RS256 lưu trong localStorage
- Rate limiting: login 5/phút, register 3/giờ, forgot 3/giờ

### Khác
- **Export CSV** lịch sử quan trắc (tối đa 30 ngày) — Excel-compatible BOM UTF-8
- **Ghim trạm** quan tâm (đồng bộ DB)
- **Định vị tự động** (xin quyền geolocation)
- Lazy load route components để giảm initial bundle

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 + TypeScript |
| Routing | React Router v6 (lazy chunks) |
| State | TanStack Query v5 |
| UI | Tailwind CSS + shadcn/ui (Radix UI) |
| Map | Leaflet + react-leaflet + leaflet.heat |
| Charts | Recharts |
| Animation | Framer Motion |
| Realtime | socket.io-client |
| PWA | vite-plugin-pwa + Workbox |
| Forms | react-hook-form + zod |

## Prerequisites

- Node.js >= 20
- Yarn 1.22.x

## Quick start

### 1. Cài dependencies

```bash
yarn install
```

### 2. Cấu hình môi trường

```bash
cp .env.example .env
```

Mở `.env` và sửa các giá trị:

```env
VITE_AIR_QUALITY_API_URL=http://localhost:3002/api/v1
VITE_AIR_QUALITY_BE_URL=http://localhost:8000/api/v1

# Web Push — copy public key từ air-quality-api/.env (xem hướng dẫn bên dưới)
VITE_VAPID_PUBLIC_KEY=
```

### 3. Generate VAPID keys (1 lần ở backend)

Ở repo `air-quality-api`, chạy:

```bash
npx web-push generate-vapid-keys
```

Copy `Public Key` vào `VITE_VAPID_PUBLIC_KEY` của FE và `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` của BE.

### 4. Chạy dev server

```bash
yarn dev
```

App chạy tại `http://localhost:8080` (port mặc định của Vite trong project này).

### 5. Build production

```bash
yarn build
```

Output trong `dist/`, gồm:
- `index.html` + các chunk JS lazy-loaded
- `manifest.webmanifest` (PWA)
- `sw.js` + `workbox-*.js` (service worker)
- `icons/*.png` (PWA icons 192/512/maskable)

### 6. Preview production build

```bash
yarn preview
```

## Cấu trúc thư mục

```
src/
├── api/                    # API clients (REST)
│   ├── alerts.ts          # alert rules + alerts list
│   ├── analytics.ts       # forecast/analytics từ air-quality-be
│   ├── auth.ts            # login/register/forgot/reset
│   ├── client.ts          # base fetch + auth header
│   ├── notifications.ts
│   ├── profile.ts         # user preferences
│   ├── push.ts            # web push subscribe/unsubscribe
│   └── stations.ts
├── components/
│   ├── dashboard/         # các block của dashboard
│   │   ├── AQICalendar.tsx       # heatmap 30 ngày
│   │   ├── AQIChart.tsx          # biểu đồ 24h
│   │   ├── AQIMap.tsx            # bản đồ Leaflet 3 mode
│   │   ├── AQIPin.tsx            # custom marker icon
│   │   ├── AlertPanel.tsx        # sliding panel cảnh báo
│   │   ├── ForecastChart.tsx     # biểu đồ Prophet
│   │   ├── HealthAdvice.tsx      # khuyến nghị sức khoẻ
│   │   ├── NotificationSettings.tsx
│   │   ├── SearchStation.tsx
│   │   ├── SelectedStationPanel.tsx
│   │   ├── StationAnalyticsPanel.tsx
│   │   ├── StationDetail.tsx
│   │   ├── skeletons.tsx         # skeleton loaders
│   │   └── ...
│   ├── ui/                # shadcn/ui primitives
│   ├── CsvDownloadButton.tsx
│   └── InstallPrompt.tsx  # PWA install banner
├── hooks/
│   ├── useAlerts.ts
│   ├── useAuth.tsx
│   ├── useCompareStations.ts     # localStorage compare list
│   ├── useNotifications.tsx
│   ├── usePinnedStations.tsx
│   ├── usePushNotifications.ts   # Web Push subscription
│   ├── useRealtime.ts            # socket.io client
│   └── useStations.tsx
├── lib/aqi.ts             # AQI category mapping (US EPA)
├── pages/                 # tất cả route components (lazy-loaded)
│   ├── AlertHistory.tsx
│   ├── AlertSettings.tsx
│   ├── Auth.tsx
│   ├── Compare.tsx
│   ├── ForgotPassword.tsx
│   ├── Index.tsx
│   ├── NotFound.tsx
│   ├── ResetPassword.tsx
│   └── StationDetailPage.tsx
├── App.tsx
├── main.tsx
├── pwa.ts                 # service worker registration
└── sw.ts                  # custom service worker (caching + push handler)

public/
├── icons/                 # PWA icons (192/512/maskable)
├── vn-provinces.geojson
├── vn-districts.geojson
└── vn-wards.geojson

scripts/
└── generate-icons.mjs     # tạo PWA icons từ SVG source
```

## Routes

| Path | Page | Mô tả |
|---|---|---|
| `/` | Index | Dashboard chính (stats + cards + map + selected station) |
| `/stations/:id` | StationDetailPage | Chi tiết trạm: chart 24h, dự báo, lịch 30 ngày, khuyến nghị sức khoẻ, CSV download |
| `/compare` | Compare | So sánh AQI 24h giữa 2–3 trạm |
| `/alerts` | AlertHistory | Lịch sử cảnh báo có filter |
| `/settings/alerts` | AlertSettings | CRUD rule cảnh báo cá nhân |
| `/auth` | Auth | Đăng nhập / Đăng ký |
| `/auth/forgot` | ForgotPassword | Yêu cầu reset link qua email |
| `/auth/reset?token=xxx` | ResetPassword | Đặt mật khẩu mới |

## PWA & Push Notifications

### Cài ứng dụng như app native

1. Mở app trong Chrome/Edge/Safari trên mobile hoặc desktop
2. Khi banner "Cài ứng dụng lên màn hình chính" xuất hiện, bấm **Cài đặt**
3. App icon xuất hiện trên home screen, mở ra trong cửa sổ standalone (không có thanh URL)

**iOS Safari** yêu cầu: Safari 16.4+, người dùng phải tự **Share → Add to Home Screen** trước khi nhận được push.

### Bật Web Push

1. Vào **Tài khoản → Cài đặt thông báo → Thông báo đẩy** → bấm **Bật**
2. Trình duyệt sẽ hỏi quyền — bấm **Cho phép**
3. Subscription được lưu ở backend qua `POST /api/v1/push/subscribe`
4. Backend dùng `web-push` (VAPID) để gửi notification khi có alert mới

### Quiet hours

Trong cài đặt thông báo, có thể bật **Giờ yên tĩnh** (mặc định 22:00 → 07:00). Push không gửi trong khung giờ này; vẫn ghi alert vào DB và gửi email như bình thường.

### PWA Shortcuts

Khi nhấn giữ icon ứng dụng trên home screen (Android), hiện 3 shortcut:
- **So sánh** → `/compare`
- **Cảnh báo** → `/settings/alerts`
- **Lịch sử** → `/alerts`

## Realtime WebSocket

Frontend kết nối WebSocket tới namespace `/realtime` của `air-quality-api`. Xem [`src/hooks/useRealtime.ts`](src/hooks/useRealtime.ts).

Events client lắng nghe:
- `observations:updated` — quan trắc mới (sau ingest) → invalidate cache stations
- `alert:new` — cảnh báo mới cho user hiện tại → show toast + invalidate alerts cache

JWT được truyền qua `handshake.auth.token` và verify bằng cùng public key như REST.

## Docker

```bash
docker build -t airwatch-fe .
docker run -p 80:80 \
  -e VITE_AIR_QUALITY_API_URL=https://api.example.com/api/v1 \
  airwatch-fe
```

Production image dùng nginx serve static files (xem [Dockerfile](Dockerfile) + [nginx.conf](nginx.conf)).

## Liên kết các repo

- **air-quality-api** (NestJS) — port 3002, ingest + REST API + WebSocket
- **air-quality-be** (FastAPI) — port 8000, analytics + forecast
- **air-quality-admin** (React) — port 5174, dashboard quản trị
