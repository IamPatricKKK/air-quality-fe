import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Trophy } from 'lucide-react';
import { useStations } from '@/hooks/useStations';
import { RankingStats } from '@/components/rankings/RankingStats';
import { RankingPodium } from '@/components/rankings/RankingPodium';
import { RankingBoard } from '@/components/rankings/RankingBoard';
import { RankingSkeleton } from '@/components/rankings/RankingSkeleton';

/** Trang "Xếp hạng khu vực" — dashboard phân tích AQI tách khỏi /home. */
export default function Rankings() {
  const { data: stations = [], isLoading } = useStations();

  const lastUpdated = useMemo(() => {
    if (stations.length === 0) return null;
    const latest = stations.reduce(
      (max, s) => (s.recorded_at > max ? s.recorded_at : max),
      stations[0].recorded_at,
    );
    const d = new Date(latest);
    return Number.isNaN(d.getTime()) ? null : format(d, 'HH:mm · dd/MM/yyyy');
  }, [stations]);

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="px-4 md:px-5 lg:px-7 pt-6 space-y-6">
        {/* ── Page header ── */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <span
              className="flex w-11 h-11 items-center justify-center rounded-2xl"
              style={{ background: 'hsl(201 100% 14% / 0.08)', color: 'hsl(201 100% 22%)' }}
            >
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-tight">
                Xếp hạng chất lượng không khí
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Bảng xếp hạng AQI theo trạm quan trắc trên toàn quốc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden sm:inline text-xs text-muted-foreground font-medium">
                Cập nhật {lastUpdated}
              </span>
            )}
            <span
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold"
              style={{ background: 'hsl(16 100% 60% / 0.10)', color: 'hsl(16 100% 50%)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(16 100% 52%)' }} />
              Trực tiếp
            </span>
          </div>
        </motion.header>

        {isLoading && stations.length === 0 ? (
          <RankingSkeleton />
        ) : stations.length === 0 ? (
          <div className="ow-card p-10 text-center">
            <p className="section-label">Chưa có dữ liệu</p>
            <h2 className="mt-3 text-lg font-semibold text-foreground">Chưa có dữ liệu trạm quan trắc</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Bảng xếp hạng sẽ hiển thị khi có dữ liệu AQI từ các trạm.
            </p>
          </div>
        ) : (
          <>
            <RankingStats stations={stations} />
            <RankingPodium stations={stations} />
            <RankingBoard stations={stations} />
          </>
        )}
      </div>
    </div>
  );
}
