import { Map, BarChart3, Bell, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';

export type MobileTab = 'home' | 'map' | 'search' | 'alerts' | 'profile';

interface MobileNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  alertCount?: number;
}

const tabs = [
  { id: 'home' as const, icon: BarChart3, label: 'Tổng quan' },
  { id: 'map' as const, icon: Map, label: 'Bản đồ' },
  { id: 'search' as const, icon: Search, label: 'Tra cứu' },
  { id: 'alerts' as const, icon: Bell, label: 'Cảnh báo' },
  { id: 'profile' as const, icon: User, label: 'Tài khoản' },
];

export function MobileNav({ activeTab, onTabChange, alertCount = 0 }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative">
                <tab.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                {tab.id === 'alerts' && alertCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
