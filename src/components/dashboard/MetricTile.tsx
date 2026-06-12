import type { LucideIcon } from "lucide-react";

interface MetricTileProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accentClass?: string;
}

export function MetricTile({ icon: Icon, label, value, unit, sub, accentClass }: MetricTileProps) {
  return (
    <div className="ow-tile">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${accentClass ?? ""}`} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.09em]">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span
          className={`leading-none font-semibold ${accentClass ?? "text-foreground"}`}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: '1.25rem',
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[10px] text-muted-foreground font-medium">{unit}</span>
        )}
      </div>
      {sub && (
        <p className="mt-1 text-[10px] text-muted-foreground leading-tight">{sub}</p>
      )}
    </div>
  );
}

export default MetricTile;
