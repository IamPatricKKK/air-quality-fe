import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AQISummary } from '@/components/dashboard/AQISummary';
import { AQICard } from '@/components/dashboard/AQICard';
import { AQIMap, type RegionFocus } from '@/components/dashboard/AQIMap';
import { SelectedStationPanel } from '@/components/dashboard/SelectedStationPanel';
import { RegionTable } from '@/components/dashboard/RegionTable';
import { WardAqiPanel } from '@/components/dashboard/WardAqiPanel';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { SearchStation } from '@/components/dashboard/SearchStation';
import { LocationPrompt } from '@/components/dashboard/LocationPrompt';
import { MobileNav, MobileTab } from '@/components/dashboard/MobileNav';
import { MobileSearchView } from '@/components/dashboard/MobileSearchView';
import { MobileProfileView } from '@/components/dashboard/MobileProfileView';
import {
  AQISummarySkeleton,
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
import type { WardAqi } from '@/api/wards';
import { locateWard } from '@/lib/wardLocator';
import { Search, X, GitCompare, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Link, useLocation } from 'react-router-dom';
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

  // Sort: pinned first, then by AQI desc
  const sortedStations = useMemo(() => {
    let list = [...stations];
    if (cardSearch.trim()) {
      const q = cardSearch.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.region.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      // Region match priority
      if (selectedRegion) {
        const aMatch = a.region.includes(selectedRegion) ? 1 : 0;
        const bMatch = b.region.includes(selectedRegion) ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
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
      setSelectedStation((current) => current ? null : current);
      return;
    }

    setSelectedStation((current) => {
      if (!current) {
        return stations[0];
      }

      const liveSelected = stations.find((station) => station.id === current.id);
      if (!liveSelected) {
        return stations[0];
      }

      if (
        liveSelected.recorded_at !== current.recorded_at ||
        liveSelected.aqi !== current.aqi ||
        liveSelected.pm25 !== current.pm25 ||
        liveSelected.pm10 !== current.pm10
      ) {
        return liveSelected;
      }

      return current;
    });
  }, [stations]);

  // Handle navigation state (viewOnMap, tab)
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

    if (state.tab) {
      setMobileTab(state.tab as MobileTab);
    }

    // Clear state so it doesn't re-trigger
    window.history.replaceState({}, '');
  }, [location.state, stations]);

  const handleMobileCardClick = useCallback((station: StationWithReading) => {
    setSelectedStation(station);
    setTimeout(() => {
      stationPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const [forceFly, setForceFly] = useState(false);
  const [regionFocus, setRegionFocus] = useState<RegionFocus | null>(null);

  /** Bấm xã/phường ở panel địa phương → bay tới khu vực đó trên bản đồ. */
  const handleWardSelect = useCallback(async (ward: WardAqi) => {
    const pos = await locateWard(ward);
    if (!pos) {
      toast.warning('Chưa định vị được địa phương này trên bản đồ.');
      return;
    }
    setRegionFocus({ ...pos, zoom: 11, nonce: Date.now() });
    if (isMobile) {
      setMobileTab('map');
    } else {
      setTimeout(() => {
        mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isMobile]);

  const handleViewOnMap = useCallback((station: StationWithReading) => {
    setSelectedStation(station);
    setForceFly(true);
    setMobileTab('map');
    // Reset after map has time to fly
    setTimeout(() => setForceFly(false), 2000);
  }, []);

  const handleMobileTabChange = useCallback((tab: MobileTab) => {
    setMobileTab(tab);
  }, []);

  const scrollCards = useCallback((ref: React.RefObject<HTMLDivElement>, dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  }, []);

  const handleDesktopCardClick = useCallback((station: StationWithReading) => {
    setSelectedStation(station);
    setForceFly(true);
    setTimeout(() => setForceFly(false), 2000);
    setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleSearchSelect = useCallback((station: StationWithReading) => {
    setSelectedStation(station);
    if (isMobile) {
      setMobileTab('home');
      setTimeout(() => {
        stationPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isMobile]);

  if (!selectedStation && stations.length) {
    return null;
  }

  if (isLoading && stations.length === 0) {
    return (
      <div className="min-h-screen p-3 md:p-4 lg:p-6 space-y-4">
        <AQISummarySkeleton />
        <StationCardSkeleton count={5} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[75vh] min-h-[520px]">
            <MapSkeleton />
          </div>
          <div className="lg:col-span-1">
            <SelectedStationSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && stations.length === 0) {
    return (
      <div className="min-h-screen px-4 py-12 md:px-6">
        <div className="mx-auto max-w-2xl glass-card p-8 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-primary/70">Live Data Only</p>
          <h1 className="mt-3 text-3xl font-display font-bold text-foreground">Chưa có dữ liệu quan trắc trong DB</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Giao diện chỉ hiển thị khi pipeline ingest hoàn tất và đã ghi observation thật xuống PostgreSQL.
          </p>
        </div>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen pb-16">
        {/* Header: global SiteHeader (navy glass island) renders above this page */}
        <div className="px-3 py-3 space-y-3">
          {mobileTab === 'home' && (
            <>
              {/* Intro section — glass card floating on the sky backdrop */}
              <div className="relative overflow-hidden ow-card-glass p-4">
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                      </svg>
                    </div>
                    <h2 className="text-sm font-semibold font-display text-foreground">Khám phá chất lượng không khí</h2>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-8">
                    Xem AQI, PM2.5 thời gian thực từ 50+ trạm. Nhận dự báo 24h, cảnh báo ô nhiễm và lời khuyên sức khoẻ.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between px-0.5">
                <h2 className="text-sm font-semibold font-display text-foreground">Trạm quan trắc</h2>
                <span className="text-[10px] text-muted-foreground">Vuốt để xem tất cả →</span>
              </div>
              <div
                ref={mobileCardScrollRef}
                className="grid grid-rows-2 grid-flow-col auto-cols-[200px] gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-3 px-3 py-1"
              >
                {sortedStations.map((station, i) => (
                  <div key={station.id} className="snap-start">
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
                  <SelectedStationPanel
                    station={selectedStation}
                    onViewOnMap={() => handleViewOnMap(selectedStation)}
                  />
                </div>
              )}
              <AQISummary stations={stations} />
              <RegionTable stations={stations} />
              <WardAqiPanel onSelectWard={handleWardSelect} />
            </>
          )}

          {mobileTab === 'map' && (
            /* Fixed giữa header (≈68px) và bottom nav (64px): vừa khít mọi
               màn hình, không phụ thuộc 100vh (lệch trên iOS) hay scroll. */
            <div className="fixed inset-x-0 top-[68px] bottom-16">
              <AQIMap
                stations={stations}
                selectedStation={selectedStation}
                onSelectStation={setSelectedStation}
                forceFly={forceFly}
                regionFocus={regionFocus}
              />
            </div>
          )}

          {mobileTab === 'search' && (
            <MobileSearchView stations={stations} onSelectStation={handleSearchSelect} />
          )}

        </div>

        {/* Footer chỉ ở tab Tổng quan (các tab bản đồ/tra cứu không cần) */}
        {mobileTab === 'home' && <Footer />}

        <LocationPrompt />
        <MobileNav
          activeTab={mobileTab}
          onTabChange={handleMobileTabChange}
          alertCount={unreadCount}
        />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen pb-6">

      <div className="px-3 md:px-4 lg:px-6 pt-6 space-y-4">

      {/* Dashboard header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
            Bảng tổng quan
          </h1>
          <p className="text-sm text-foreground/70 mt-1.5">
            Theo dõi AQI &amp; PM2.5 thời gian thực từ 50+ trạm quan trắc trên toàn quốc.
          </p>
        </div>
        <div className="w-full md:w-80 lg:w-96 md:flex-shrink-0">
          <SearchStation stations={stations} onSelect={setSelectedStation} />
        </div>
      </div>

      <AQISummary stations={stations} />

      {/* Station cards — swipeable carousel (all stations) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg md:text-xl font-bold font-display text-foreground">Trạm quan trắc</h2>
          <div className="flex items-center gap-2 sm:gap-3">
            {pinnedIds.length > 0 && (
              <span className="hidden lg:inline text-[10px] text-muted-foreground">{pinnedIds.length} trạm đã ghim</span>
            )}
            <div className="relative w-36 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm trạm..."
                value={cardSearch}
                onChange={e => setCardSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              {cardSearch && (
                <button onClick={() => setCardSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollCards(cardScrollRef, -1)}
                aria-label="Xem trạm trước"
                className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/70 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollCards(cardScrollRef, 1)}
                aria-label="Xem trạm tiếp theo"
                className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/70 active:scale-95 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {sortedStations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Không tìm thấy trạm phù hợp.</p>
        ) : (
          <div
            ref={cardScrollRef}
            className="grid grid-rows-2 grid-flow-col auto-cols-[250px] sm:auto-cols-[270px] gap-3 md:gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-2"
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
      </div>

      <div ref={mapSectionRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-start scroll-mt-20">
        <div className="lg:col-span-2 lg:sticky lg:top-24 h-[60vh] lg:h-[calc(100vh-7rem)] min-h-[520px]">
          <AQIMap
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
            forceFly={forceFly}
            regionFocus={regionFocus}
          />
        </div>
        <div className="lg:col-span-1 space-y-4">
          {selectedStation && <SelectedStationPanel station={selectedStation} />}
        </div>
      </div>

      <RegionTable stations={stations} />

      <WardAqiPanel onSelectWard={handleWardSelect} />

      {compare.ids.length >= 2 && (
        <Link
          to="/compare"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-orange-500 text-white shadow-2xl shadow-orange-500/30 hover:bg-orange-600 transition-all"
        >
          <GitCompare className="w-4 h-4" />
          <span className="text-sm font-medium">So sánh {compare.ids.length} trạm</span>
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
