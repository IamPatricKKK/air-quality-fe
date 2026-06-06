import type { LucideIcon } from "lucide-react";

interface MetricTileProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  /** Optional accent color for the value/icon (e.g. AQI color). */
  accentClass?: string;
}

/** OpenWeather-style compact metric tile: icon + label on top, big value below. */
export function MetricTile({ icon: Icon, label, value, unit, sub, accentClass }: MetricTileProps) {
  return (
    <div className="ow-tile">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className={`w-3.5 h-3.5 ${accentClass ?? ""}`} />
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className={`text-lg font-bold font-display leading-none ${accentClass ?? "text-foreground"}`}>
          {value}
        </span>
        {unit && <span className="text-[11px] text-muted-foreground">{unit}</span>}
      </div>
      {sub && <p className="mt-1 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default MetricTile;
