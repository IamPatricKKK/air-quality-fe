import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  className?: string;
}

/** Pill segmented switcher with an animated active indicator (Apple-style). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl border border-border/60 bg-secondary/60 p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-primary shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
