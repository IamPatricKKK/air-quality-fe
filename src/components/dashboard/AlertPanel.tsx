import { motion, AnimatePresence } from 'framer-motion';
import { alerts as mockAlerts } from '@/data/mockData';
import { AlertTriangle, AlertCircle, XCircle, X } from 'lucide-react';

interface AlertPanelProps {
  open: boolean;
  onClose: () => void;
}

const iconMap = {
  warning: AlertTriangle,
  danger: AlertCircle,
  critical: XCircle,
};

const styleMap = {
  warning: 'border-aqi-moderate/30 bg-aqi-moderate/5',
  danger: 'border-aqi-unhealthy/30 bg-aqi-unhealthy/5',
  critical: 'border-destructive/30 bg-destructive/5',
};

const iconStyleMap = {
  warning: 'text-aqi-moderate',
  danger: 'text-aqi-unhealthy',
  critical: 'text-destructive',
};

export function AlertPanel({ open, onClose }: AlertPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border z-50 flex flex-col shadow-2xl"
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
            <div>
              <h2 className="text-sm font-semibold font-display text-foreground">Cảnh báo</h2>
              <p className="text-xs text-muted-foreground">{mockAlerts.filter(a => !a.read).length} chưa đọc</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mockAlerts.map((alert, i) => {
              const Icon = iconMap[alert.type];
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-lg border p-3 ${styleMap[alert.type]} ${!alert.read ? 'ring-1 ring-primary/20' : 'opacity-70'}`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconStyleMap[alert.type]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{alert.stationName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString('vi-VN')}
                        </span>
                        {!alert.read && (
                          <span className="text-[10px] font-medium text-primary">Mới</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
