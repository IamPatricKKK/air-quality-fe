/**
 * Re-exports from proper module locations.
 * Components should migrate imports to @/types and @/utils/aqi directly.
 */
export type { StationWithReading as Station } from "@/types";
export { getAQILevel, getAQILabel, getAQIColorClass, getAQIBgClass } from "@/utils/aqi";
export type { AQILevel } from "@/utils/aqi";
