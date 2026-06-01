import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_AIR_QUALITY_API_URL ?? "";
const SESSION_KEY = "air-quality-fe:user-session";

interface CsvDownloadButtonProps {
  stationId: string;
  stationCode?: string;
  hours?: number;
  label?: string;
}

function readToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as { access_token?: string };
    return s.access_token ?? null;
  } catch {
    return null;
  }
}

export function CsvDownloadButton({
  stationId,
  stationCode,
  hours = 24,
  label,
}: CsvDownloadButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (!API_URL) {
      toast.error("API URL chưa được cấu hình");
      return;
    }
    setBusy(true);
    try {
      const token = readToken();
      const res = await fetch(`${API_URL}/stations/${stationId}/history.csv?hours=${hours}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `air-quality-${stationCode ?? stationId}-${hours}h.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Đã tải xuống file CSV");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không tải được CSV";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      title="Tải dữ liệu lịch sử dưới dạng CSV"
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
    >
      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
      {label ?? "CSV"}
    </button>
  );
}
