import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="md:hidden inline-flex items-center gap-2 rounded-full bg-card/70 backdrop-blur-md border border-border/40 px-3.5 py-2 text-sm text-foreground/80 shadow-sm hover:text-foreground active:scale-95 transition-all"
    >
      <ArrowLeft className="w-4 h-4" /> Quay lại
    </button>
  );
}
