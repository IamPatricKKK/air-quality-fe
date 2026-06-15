import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Quay lại"
      className="md:hidden group inline-flex items-center gap-2 -ml-0.5 active:scale-95 transition-transform"
    >
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-card/80 backdrop-blur-md border border-border/40 shadow-sm text-foreground/80 group-hover:text-foreground group-active:bg-card transition-colors">
        <ArrowLeft className="w-[18px] h-[18px]" />
      </span>
      <span className="text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">
        Quay lại
      </span>
    </button>
  );
}
