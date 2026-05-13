import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/dashboard/Header';
import { AQISummary } from '@/components/dashboard/AQISummary';
import { AQICard } from '@/components/dashboard/AQICard';
import { AQIMap } from '@/components/dashboard/AQIMap';
import { SelectedStationPanel } from '@/components/dashboard/SelectedStationPanel';
import { RegionTable } from '@/components/dashboard/RegionTable';
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
import { usePinnedStations } from '@/hooks/usePinnedStations';
import { useCompareStations } from '@/hooks/useCompareStations';
import { useIsMobile } from '@/hooks/use-mobile';
import type { StationWithReading } from '@/types';
import { Search, X, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Index = () => {
  const { data: dbStations, isLoading } = useStations();
  const { data: notifications } = useNotifications();
  const { pinnedIds, togglePin, isPinned } = usePinnedStations();
  const compare = useCompareStations();
  const isMobile = useIsMobile();

  const handleToggleCompare = (stationId: string) => {
    const result = compare.toggle(stationId);
    if (!result.ok && result.reason === 'limit') {
      toast.warning(`Chỉ so sánh được tối đa ${compare.max} trạm`, {
        description: 'Bỏ một trạm trước khi thêm trạm mới.',
      });
    }
  };
  const [selectedStation, setSelectedStation] = useState<StationWithReading | null>(null);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');
  const [cardSearch, setCardSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const stations: StationWithReading[] = dbStations ?? [];

  const unreadCount = notifications?.filter(n => !n.is_read).length ?? 0;

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

  if (!selectedStation && stations.length) {
    return null;
  }

  if (isLoading && stations.length === 0) {
    return (
      <div className="min-h-screen bg-background p-3 md:p-4 lg:p-6 space-y-4">
        <AQISummarySkeleton />
        <StationCardSkeleton count={5} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[520px]">
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
      <div className="min-h-screen bg-background px-4 py-12 md:px-6">
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

  const handleMobileTabChange = (tab: MobileTab) => {
    if (tab === 'alerts') {
      setAlertsOpen(true);
    }
    setMobileTab(tab);
  };

  const handleSearchSelect = (station: StationWithReading) => {
    setSelectedStation(station);
    if (isMobile) setMobileTab('map');
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-16">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-sm font-display font-bold text-foreground">AirWatch Vietnam</h1>
              <p className="text-[10px] text-muted-foreground">Chất lượng không khí thời gian thực</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live
            </div>
          </div>
        </div>

        <div className="px-3 py-3 space-y-3">
          {mobileTab === 'home' && (
            <>
              <AQISummary stations={stations} />
              <div className="grid grid-cols-2 gap-2">
                {sortedStations.slice(0, 4).map((station, i) => (
                  <AQICard
                    key={station.id}
                    station={station}
                    onClick={handleSearchSelect}
                    index={i}
                    isPinned={isPinned(station.id)}
                    onTogglePin={togglePin}
                    isCompared={compare.isCompared(station.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
              {selectedStation && <SelectedStationPanel station={selectedStation} />}
              <RegionTable stations={stations} />
            </>
          )}

          {mobileTab === 'map' && (
            <div className="h-[calc(100vh-140px)] -mx-3 -mt-3">
              <AQIMap
                stations={stations}
                selectedStation={selectedStation}
                onSelectStation={setSelectedStation}
              />
            </div>
          )}

          {mobileTab === 'search' && (
            <MobileSearchView stations={stations} onSelectStation={handleSearchSelect} />
          )}

          {mobileTab === 'profile' && <MobileProfileView />}
        </div>

        <LocationPrompt />
        <MobileNav
          activeTab={mobileTab}
          onTabChange={handleMobileTabChange}
          alertCount={unreadCount}
        />
        <AlertPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />
        {alertsOpen && (
          <div
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
            onClick={() => setAlertsOpen(false)}
          />
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background p-3 md:p-4 lg:p-6 space-y-4">
      <Header onToggleAlerts={() => setAlertsOpen(!alertsOpen)} alertsOpen={alertsOpen} selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />

      {/* Search bar */}
      <div className="max-w-lg">
        <SearchStation stations={stations} onSelect={setSelectedStation} />
      </div>

      <AQISummary stations={stations} />

      {/* Station cards with search & pin */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Lọc trạm..."
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
          {pinnedIds.length > 0 && (
            <span className="text-[10px] text-muted-foreground">{pinnedIds.length} trạm đã ghim</span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {sortedStations.slice(0, 10).map((station, i) => (
            <AQICard
              key={station.id}
              station={station}
              onClick={setSelectedStation}
              index={i}
              isPinned={isPinned(station.id)}
              onTogglePin={togglePin}
              isCompared={compare.isCompared(station.id)}
              onToggleCompare={handleToggleCompare}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-[520px]">
          <AQIMap
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
          />
        </div>
        <div className="lg:col-span-1 space-y-4">
          {selectedStation && <SelectedStationPanel station={selectedStation} />}
        </div>
      </div>

      <RegionTable stations={stations} />

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
  );
};

export default Index;
