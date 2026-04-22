/**
 * Chuẩn hoá thang AQI theo US EPA.
 * Dùng xuyên suốt FE (map marker, chart reference line, badge, card).
 */

export type AqiCategoryCode =
  | "good"
  | "moderate"
  | "unhealthy_sensitive"
  | "unhealthy"
  | "very_unhealthy"
  | "hazardous"
  | "unknown";

export interface AqiCategoryInfo {
  code: AqiCategoryCode;
  label: string; // tiếng Việt
  labelShort: string;
  color: string; // hex theo EPA
  textColor: string;
  min: number | null;
  max: number | null;
  healthAdvice: string;
}

const EPA_TABLE: AqiCategoryInfo[] = [
  {
    code: "good",
    label: "Tốt",
    labelShort: "Tốt",
    color: "#00E400",
    textColor: "#0a3a0a",
    min: 0,
    max: 50,
    healthAdvice: "Chất lượng không khí tốt, an toàn cho mọi người.",
  },
  {
    code: "moderate",
    label: "Trung bình",
    labelShort: "TB",
    color: "#FFFF00",
    textColor: "#5a4d00",
    min: 51,
    max: 100,
    healthAdvice: "Chấp nhận được; người rất nhạy cảm nên hạn chế hoạt động ngoài trời kéo dài.",
  },
  {
    code: "unhealthy_sensitive",
    label: "Không tốt cho nhóm nhạy cảm",
    labelShort: "Nhạy cảm",
    color: "#FF7E00",
    textColor: "#ffffff",
    min: 101,
    max: 150,
    healthAdvice: "Người nhạy cảm (già, trẻ em, bệnh hô hấp) nên giảm hoạt động ngoài trời.",
  },
  {
    code: "unhealthy",
    label: "Không tốt",
    labelShort: "Không tốt",
    color: "#FF0000",
    textColor: "#ffffff",
    min: 151,
    max: 200,
    healthAdvice: "Mọi người có thể bị ảnh hưởng; nhóm nhạy cảm có thể gặp triệu chứng nghiêm trọng.",
  },
  {
    code: "very_unhealthy",
    label: "Rất không tốt",
    labelShort: "Rất xấu",
    color: "#8F3F97",
    textColor: "#ffffff",
    min: 201,
    max: 300,
    healthAdvice: "Cảnh báo sức khoẻ: mọi người nên hạn chế ra ngoài, đeo khẩu trang N95.",
  },
  {
    code: "hazardous",
    label: "Nguy hại",
    labelShort: "Nguy hại",
    color: "#7E0023",
    textColor: "#ffffff",
    min: 301,
    max: null,
    healthAdvice: "Khẩn cấp: tránh mọi hoạt động ngoài trời; ở trong nhà, đóng cửa, dùng máy lọc không khí.",
  },
];

const UNKNOWN: AqiCategoryInfo = {
  code: "unknown",
  label: "Chưa có dữ liệu",
  labelShort: "—",
  color: "#9ca3af",
  textColor: "#ffffff",
  min: null,
  max: null,
  healthAdvice: "",
};

/** Lấy category info từ giá trị AQI (hoặc null). */
export function getAqiCategory(aqi: number | null | undefined): AqiCategoryInfo {
  if (aqi === null || aqi === undefined || Number.isNaN(aqi)) return UNKNOWN;
  for (const c of EPA_TABLE) {
    if (aqi >= (c.min ?? 0) && (c.max === null || aqi <= c.max)) return c;
  }
  return UNKNOWN;
}

/** Map mã category (từ backend) về info. */
export function getAqiCategoryByCode(code: string | null | undefined): AqiCategoryInfo {
  if (!code) return UNKNOWN;
  return EPA_TABLE.find((c) => c.code === code) ?? UNKNOWN;
}

export function getAqiColor(aqi: number | null | undefined) {
  return getAqiCategory(aqi).color;
}

export function getAqiLabel(aqi: number | null | undefined) {
  return getAqiCategory(aqi).label;
}

export function aqiReferenceLines() {
  return [
    { y: 50, label: "Tốt", color: "#00E400" },
    { y: 100, label: "Trung bình", color: "#FFFF00" },
    { y: 150, label: "Nhạy cảm", color: "#FF7E00" },
    { y: 200, label: "Không tốt", color: "#FF0000" },
    { y: 300, label: "Rất xấu", color: "#8F3F97" },
  ];
}

export const AQI_CATEGORIES: AqiCategoryInfo[] = EPA_TABLE;
