import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/dashboard/Header';
import { AQISummary } from '@/components/dashboard/AQISummary';
import { AQICard } from '@/components/dashboard/AQICard';
import { AQIMap } from '@/components/dashboard/AQIMap';
import { AQIChart } from '@/components/dashboard/AQIChart';
import { StationDetail } from '@/components/dashboard/StationDetail';
import { RegionTable } from '@/components/dashboard/RegionTable';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { SearchStation } from '@/components/dashboard/SearchStation';
import { LocationPrompt } from '@/components/dashboard/LocationPrompt';
import { MobileNav, MobileTab } from '@/components/dashboard/MobileNav';
import { MobileSearchView } from '@/components/dashboard/MobileSearchView';
import { MobileProfileView } from '@/components/dashboard/MobileProfileView';
import { useStations, StationWithReading } from '@/hooks/useStations';
import { useNotifications } from '@/hooks/useNotifications';
import { usePinnedStations } from '@/hooks/usePinnedStations';
import { useIsMobile } from '@/hooks/use-mobile';
import { stations as mockStations, Station as MockStation } from '@/data/mockData';
import { Search, X } from 'lucide-react';

function toStation(s: StationWithReading): MockStation {
  return {
    id: s.id,
    name: s.name,
    region: s.region,
    lat: s.lat,
    lng: s.lng,
    aqi: s.aqi,
    pm25: s.pm25,
    pm10: s.pm10,
    o3: s.o3,
    no2: s.no2,
    so2: s.so2,
    co: s.co,
    temperature: s.temperature,
    humidity: s.humidity,
    lastUpdated: s.recorded_at,
  };
}

const Index = () => {
  const { data: dbStations, isLoading } = useStations();
  const { data: notifications } = useNotifications();
  const { pinnedIds, togglePin, isPinned } = usePinnedStations();
  const isMobile = useIsMobile();
  const [selectedStation, setSelectedStation] = useState<MockStation | null>(null);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');
  const [cardSearch, setCardSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  const stations: MockStation[] = dbStations?.length
    ? dbStations.map(toStation)
    : mockStations;

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
    if (stations.length && !selectedStation) {
      setSelectedStation(stations[0]);
    }
  }, [stations, selectedStation]);

  if (!selectedStation && stations.length) {
    return null;
  }

  const handleMobileTabChange = (tab: MobileTab) => {
    if (tab === 'alerts') {
      setAlertsOpen(true);
    }
    setMobileTab(tab);
  };

  const handleSearchSelect = (station: MockStation) => {
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
              <AQISummary />
              <div className="grid grid-cols-2 gap-2">
                {sortedStations.slice(0, 4).map((station, i) => (
                  <AQICard
                    key={station.id}
                    station={station}
                    onClick={handleSearchSelect}
                    index={i}
                    isPinned={isPinned(station.id)}
                    onTogglePin={togglePin}
                  />
                ))}
              </div>
              {selectedStation && (
                <>
                  <AQIChart station={selectedStation} />
                  <StationDetail station={selectedStation} />
                </>
              )}
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

      <AQISummary />

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
          {selectedStation && (
            <>
              <AQIChart station={selectedStation} />
              <StationDetail station={selectedStation} />
            </>
          )}
        </div>
      </div>

      <RegionTable stations={stations} />

      <LocationPrompt />
      <AlertPanel open={alertsOpen} onClose={() => setAlertsOpen(false)} />
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
