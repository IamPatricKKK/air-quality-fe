import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, XCircle, X, CheckCheck, Settings, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAlerts, useUnreadCount, useMarkAlertRead, useMarkAllRead } from "@/hooks/useAlerts";
import { getAqiCategoryByCode } from "@/lib/aqi";

interface AlertPanelProps {
  open: boolean;
  onClose: () => void;
  /** Legacy prop — ignored now; panel fetches its own data. */
  notifications?: unknown[];
  /** Render inline (mobile) instead of fixed slide-out (desktop). */
  inline?: boolean;
}

function getAlertLevel(category: string | null) {
  if (!category) return "warning";
  if (category === "hazardous" || category === "very_unhealthy") return "critical";
  if (category === "unhealthy" || category === "unhealthy_sensitive") return "danger";
  return "warning";
}

const iconMap = {
  warning: AlertTriangle,
  danger: AlertCircle,
  critical: XCircle,
};

const styleMap = {
  warning: "border-aqi-moderate/30 bg-aqi-moderate/5",
  danger: "border-aqi-unhealthy/30 bg-aqi-unhealthy/5",
  critical: "border-destructive/30 bg-destructive/5",
};

const iconStyleMap = {
  warning: "text-aqi-moderate",
  danger: "text-aqi-unhealthy",
  critical: "text-destructive",
};

export function AlertPanel({ open, onClose, inline }: AlertPanelProps) {
  const navigate = useNavigate();
  const { data: alerts = [] } = useAlerts();
  const { data: unread } = useUnreadCount();
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllRead();

  const unreadCount = unread?.count ?? alerts.filter((a) => !a.is_read).length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={inline ? { opacity: 0 } : { x: 320, opacity: 0 }}
          animate={inline ? { opacity: 1 } : { x: 0, opacity: 1 }}
          exit={inline ? { opacity: 0 } : { x: 320, opacity: 0 }}
          transition={inline ? { duration: 0.2 } : { type: "spring", damping: 25, stiffness: 300 }}
          className={inline
            ? "flex flex-col min-h-[50vh]"
            : "fixed right-0 top-0 h-full w-80 bg-card border-l border-border z-50 flex flex-col shadow-2xl"
          }
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
            <div>
              <h2 className="text-sm font-semibold font-display text-foreground flex items-center gap-1.5">
                <Bell className="w-4 h-4" /> Cảnh báo
              </h2>
              <p className="text-xs text-muted-foreground">{unreadCount} chưa đọc</p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  title="Đánh dấu tất cả đã đọc"
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <CheckCheck className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <button
                onClick={() => { onClose(); navigate('/notifications/alerts', { state: { returnTab: 'alerts' } }); }}
                title="Cài đặt cảnh báo"
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
              </button>
              {!inline && (
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* View all link */}
          <div className="px-4 py-2 border-b border-border/30 bg-secondary/30">
            <button
              onClick={() => { onClose(); navigate('/notifications', { state: { returnTab: 'alerts' } }); }}
              className="text-xs text-primary hover:underline flex items-center justify-center gap-1 w-full"
            >
              Xem toàn bộ lịch sử →
            </button>
          </div>

          {/* Alerts list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {alerts.length === 0 && (
              <div className="rounded-lg border border-border/50 bg-secondary/30 p-4 text-xs text-muted-foreground text-center">
                Chưa có cảnh báo nào.
                <br />
                <button onClick={() => { onClose(); navigate('/notifications/alerts', { state: { returnTab: 'alerts' } }); }} className="text-primary hover:underline mt-1 inline-block">
                  Tạo rule cảnh báo
                </button>
              </div>
            )}

            {alerts.map((alert, i) => {
              const level = getAlertLevel(alert.aqi_category);
              const Icon = iconMap[level];
              const epa = getAqiCategoryByCode(alert.aqi_category);

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-lg border p-3 cursor-pointer ${styleMap[level]} ${
                    !alert.is_read ? "ring-1 ring-primary/20" : "opacity-60"
                  }`}
                  onClick={() => {
                    if (!alert.is_read) markRead.mutate(alert.id);
                  }}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconStyleMap[level]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString("vi-VN")}
                        </span>
                        {alert.aqi_category && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{ backgroundColor: epa.color, color: epa.textColor }}
                          >
                            {epa.labelShort}
                          </span>
                        )}
                        {!alert.is_read && (
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
