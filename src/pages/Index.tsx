import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AQISummary } from '@/components/dashboard/AQISummary';
import { AQICard } from '@/components/dashboard/AQICard';
import { AQIMap } from '@/components/dashboard/AQIMap';
import { SelectedStationPanel } from '@/components/dashboard/SelectedStationPanel';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { LocationPrompt } from '@/components/dashboard/LocationPrompt';
import { MobileNav, MobileTab } from '@/components/dashboard/MobileNav';
import { MobileSearchView } from '@/components/dashboard/MobileSearchView';
import { MobileProfileView } from '@/components/dashboard/MobileProfileView';
import {
  StationCardSkeleton,
  MapSkeleton,
  SelectedStationSkeleton,
} from '@/components/dashboard/skeletons';
import { useStations } from '@/hooks/useStations';
import { useNotifications } from '@/hooks/useNotifications';
import { useUnreadCount } from '@/hooks/useAlerts';
import { usePinnedStations } from '@/hooks/usePinnedStations';
import { useCompareStations } from '@/hooks/useCompareStations';
import { useIsMobile } from '@/hooks/use-mobile';
import type { StationWithReading } from '@/types';
import { Search, X, GitCompare, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';

const Index = () => {
  const { data: dbStations, isLoading } = useStations();
  const { data: notifications } = useNotifications();
  const { data: alertUnread } = useUnreadCount();
  const { pinnedIds, togglePin, isPinned } = usePinnedStations();
  const compare = useCompareStations();
  const isMobile = useIsMobile();
  const location = useLocation();

  const handleToggleCompare = (stationId: string) => {
    const result = compare.toggle(stationId);
    if (!result.ok && result.reason === 'limit') {
      toast.warning(`Chỉ so sánh được tối đa ${compare.max} trạm`, {
        description: 'Bỏ một trạm trước khi thêm trạm mới.',
      });
    }
  };

  const [selectedStation, setSelectedStation] = useState<StationWithReading | null>(null);
  const stationPanelRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const cardScrollRef = useRef<HTMLDivElement>(null);
  const mobileCardScrollRef = useRef<HTMLDivElement>(null);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');
  const [cardSearch, setCardSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const stations: StationWithReading[] = dbStations ?? [];
  const unreadCount = alertUnread?.count ?? 0;

  const sortedStations = useMemo(() => {
    let list = [...stations];
    if (cardSearch.trim()) {
      const q = cardSearch.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.region.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (selectedRegion) {
        const aM = a.region.includes(selectedRegion) ? 1 : 0;
        const bM = b.region.includes(selectedRegion) ? 1 : 0;
        if (aM !== bM) return bM - aM;
      }
      const aP = isPinned(a.id) ? 1 : 0;
      const bP = isPinned(b.id) ? 1 : 0;
      if (aP !== bP) return bP - aP;
      return b.aqi - a.aqi;
    });
    return list;
  }, [stations, pinnedIds, cardSearch, isPinned, selectedRegion]);

  useEffect(() => {
    if (!stations.length) {
      setSelectedStation(current => current ? null : current);
      return;
    }
    setSelectedStation(current => {
      if (!current) return stations[0];
      const live = stations.find(s => s.id === current.id);
      if (!live) return stations[0];
      if (live.recorded_at !== current.recorded_at || live.aqi !== current.aqi || live.pm25 !== current.pm25 || live.pm10 !== current.pm10) {
        return live;
      }
      return current;
    });
  }, [stations]);

  useEffect(() => {
    const state = location.state as { viewOnMap?: string; tab?: string } | null;
    if (!state) return;
    if (state.viewOnMap && stations.length) {
      const target = stations.find(s => s.id === state.viewOnMap);
      if (target) {
        setSelectedStation(target);
        setForceFly(true);
        setMobileTab('map');
        setTimeout(() => setForceFly(false), 2000);
      }
    }
    if (state.tab) setMobileTab(state.tab as MobileTab);
    window.history.replaceState({}, '');
  }, [location.state, stations]);

  const handleMobileCardClick = useCallback((station: StationWithReading) => {
    setSelectedStation(station);
    setTimeout(() => stationPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, []);

  const [forceFly, setForceFly] = useState(false);

  const handleViewOnMap = useCallback((station: StationWithReading) => {
    setSelectedStation(station);
    setForceFly(true);
    setMobileTab('map');
    setTimeout(() => setForceFly(false), 2000);
  }, []);

  const handleMobileTabChange = useCallback((tab: MobileTab) => setMobileTab(tab), []);

  const scrollCards = useCallback((ref: React.RefObject<HTMLDivElement>, dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  }, []);

  const handleDesktopCardClick = useCallback((station: StationWithReading) => {
    setSelectedStation(station);
    setForceFly(true);
    setTimeout(() => setForceFly(false), 2000);
    setTimeout(() => mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }, []);

  const handleSearchSelect = useCallback((station: StationWithReading) => {
    setSelectedStation(station);
    if (isMobile) {
      setMobileTab('home');
      setTimeout(() => stationPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [isMobile]);

  /* ── Loading / empty states ── */
  if (!selectedStation && stations.length) return null;

  if (isLoading && stations.length === 0) {
    return (
      <div className="min-h-screen bg-background p-3 md:p-4 lg:p-6 space-y-4">
        <StationCardSkeleton count={5} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[75vh] min-h-[520px]"><MapSkeleton /></div>
          <div className="lg:col-span-1"><SelectedStationSkeleton /></div>
        </div>
      </div>
    );
  }

  if (!isLoading && stations.length === 0) {
    return (
      <div className="min-h-screen bg-background px-4 py-12 md:px-6">
        <div className="mx-auto max-w-2xl glass-card p-8 text-center">
          <p className="section-label">Chưa có dữ liệu</p>
          <h1 className="mt-3 text-2xl font-display font-normal text-foreground">
            Chưa có dữ liệu quan trắc trong DB
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Giao diện chỉ hiển thị khi pipeline ingest hoàn tất và đã ghi observation thật xuống PostgreSQL.
          </p>
        </div>
      </div>
    );
  }

  /* ── MOBILE LAYOUT ── */
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-16">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-border/40 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex-1 min-w-0">
              <Logo size="sm" />
            </div>
            <div className="flex items-center gap-1.5">
              <Link
                to="/"
                className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground active:scale-95 transition-all"
                title="Giới thiệu"
              >
                <Info className="w-4 h-4" />
              </Link>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide"
                style={{
                  background: 'hsl(16 100% 60% / 0.10)',
                  color: 'hsl(16 100% 48%)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: 'hsl(16 100% 52%)' }}
                />
                LIVE
              </div>
            </div>
          </div>
        </div>

        <div className="px-3 py-3 space-y-3">
          {mobileTab === 'home' && (
            <>
              {/* Tổng quan: thẻ chỉ số (gộp từ trang Tổng quan) */}
              <AQISummary stations={stations} />

              <div className="flex items-center justify-between px-0.5">
                <h2 className="text-sm font-semibold text-foreground">Trạm quan trắc</h2>
                <span className="text-[10px] text-muted-foreground">Vuốt để xem tất cả →</span>
              </div>

              <div
                ref={mobileCardScrollRef}
                className="grid grid-rows-1 grid-flow-col auto-cols-[200px] gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-3 px-3 py-1"
              >
                {sortedStations.map((station, i) => (
                  <div key={station.id} className="snap-start h-full">
                    <AQICard
                      station={station}
                      onClick={handleMobileCardClick}
                      index={Math.min(i, 8)}
                      isPinned={isPinned(station.id)}
                      onTogglePin={togglePin}
                      isCompared={compare.isCompared(station.id)}
                      onToggleCompare={handleToggleCompare}
                    />
                  </div>
                ))}
              </div>

              {selectedStation && (
                <div ref={stationPanelRef} className="scroll-mt-16">
                  <SelectedStationPanel station={selectedStation} onViewOnMap={() => handleViewOnMap(selectedStation)} />
                </div>
              )}
            </>
          )}

          {mobileTab === 'map' && (
            <div className="h-[calc(100vh-140px)] -mx-3 -mt-3">
              <AQIMap
                stations={stations}
                selectedStation={selectedStation}
                onSelectStation={setSelectedStation}
                forceFly={forceFly}
              />
            </div>
          )}

          {mobileTab === 'search' && (
            <MobileSearchView stations={stations} onSelectStation={handleSearchSelect} />
          )}
        </div>

        <LocationPrompt />
        <MobileNav activeTab={mobileTab} onTabChange={handleMobileTabChange} alertCount={unreadCount} />
      </div>
    );
  }

  /* ── DESKTOP LAYOUT ── */
  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="px-4 md:px-5 lg:px-7 pt-6 space-y-6">

        {/* ── Tổng quan: thẻ chỉ số (gộp từ trang Tổng quan) ── */}
        <AQISummary stations={stations} />

        {/* ── Station cards carousel ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-foreground">Trạm quan trắc</h2>
              {pinnedIds.length > 0 && (
                <span
                  className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    background: 'hsl(201 100% 14% / 0.08)',
                    color: 'hsl(201 100% 22%)',
                  }}
                >
                  {pinnedIds.length} đã ghim
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Search filter */}
              <div className="relative w-36 sm:w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm trạm..."
                  value={cardSearch}
                  onChange={e => setCardSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                />
                {cardSearch && (
                  <button
                    onClick={() => setCardSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {/* Scroll arrows */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => scrollCards(cardScrollRef, -1)}
                  aria-label="Xem trạm trước"
                  className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/70 active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCards(cardScrollRef, 1)}
                  aria-label="Xem trạm tiếp theo"
                  className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/70 active:scale-95 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {sortedStations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Không tìm thấy trạm phù hợp.
            </p>
          ) : (
            <div
              ref={cardScrollRef}
              className="grid grid-rows-1 grid-flow-col auto-cols-[220px] sm:auto-cols-[240px] gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-1"
            >
              {sortedStations.map((station, i) => (
                <div key={station.id} className="snap-start">
                  <AQICard
                    station={station}
                    onClick={handleDesktopCardClick}
                    index={Math.min(i, 8)}
                    isPinned={isPinned(station.id)}
                    onTogglePin={togglePin}
                    isCompared={compare.isCompared(station.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Map + Station detail (hero interactive area) ── */}
        <section
          ref={mapSectionRef}
          className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:items-start scroll-mt-20"
        >
          {/* Map — sticky on desktop, 3/5 width */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 h-[60vh] lg:h-[calc(100vh-7rem)] min-h-[520px] rounded-2xl overflow-hidden border border-border/60"
            style={{
              boxShadow: '0 4px 16px -8px hsl(201 100% 14% / 0.08), 0 20px 48px -24px hsl(201 100% 14% / 0.10)'
            }}
          >
            <AQIMap
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
              forceFly={forceFly}
            />
          </div>

          {/* Station detail — 2/5 width, scrolls alongside the sticky map */}
          <div className="lg:col-span-2">
            {selectedStation && <SelectedStationPanel station={selectedStation} />}
          </div>
        </section>

        {/* ── Compare FAB ── */}
        {compare.ids.length >= 2 && (
          <Link
            to="/compare"
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full text-white font-medium text-sm shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'hsl(16 100% 52%)',
              boxShadow: '0 8px 24px -8px hsl(16 100% 52% / 0.55)',
            }}
          >
            <GitCompare className="w-4 h-4" />
            So sánh {compare.ids.length} trạm
          </Link>
        )}

        <LocationPrompt />
        <AlertPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} notifications={notifications} />
        {alertsOpen && (
          <div
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
            onClick={() => setAlertsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
