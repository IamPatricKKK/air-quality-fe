import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  CheckCheck,
  Filter,
  Loader2,
  Settings,
} from "lucide-react";
import { useAlerts, useMarkAlertRead, useMarkAllRead, useUnreadCount } from "@/hooks/useAlerts";
import { getAqiCategoryByCode } from "@/lib/aqi";

type FilterValue = "all" | "unread" | "read";

function getLevel(category: string | null) {
  if (!category) return "warning" as const;
  if (category === "hazardous" || category === "very_unhealthy") return "critical" as const;
  if (category === "unhealthy" || category === "unhealthy_sensitive") return "danger" as const;
  return "warning" as const;
}

const ICONS = {
  warning: AlertTriangle,
  danger: AlertCircle,
  critical: XCircle,
};

const COLORS = {
  warning: "text-aqi-moderate",
  danger: "text-aqi-unhealthy",
  critical: "text-destructive",
};

export default function AlertHistory() {
  const { data: alerts = [], isLoading } = useAlerts(200);
  const { data: unread } = useUnreadCount();
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllRead();
  const [filter, setFilter] = useState<FilterValue>("all");

  const unreadCount = unread?.count ?? alerts.filter((a) => !a.is_read).length;

  const filtered = useMemo(() => {
    if (filter === "unread") return alerts.filter((a) => !a.is_read);
    if (filter === "read") return alerts.filter((a) => a.is_read);
    return alerts;
  }, [alerts, filter]);

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại dashboard
        </Link>
        <Link
          to="/settings/alerts"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-3.5 h-3.5" /> Cài đặt rule
        </Link>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Lịch sử cảnh báo</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Tất cả thông báo từ các rule cảnh báo của bạn — {alerts.length} tổng cộng,{" "}
            {unreadCount} chưa đọc.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Đánh dấu đã đọc
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        {([
          { value: "all", label: `Tất cả (${alerts.length})` },
          { value: "unread", label: `Chưa đọc (${unreadCount})` },
          { value: "read", label: `Đã đọc (${alerts.length - unreadCount})` },
        ] satisfies Array<{ value: FilterValue; label: string }>).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Đang tải cảnh báo...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center space-y-2">
          <p className="text-sm text-foreground">
            {filter === "all"
              ? "Chưa có cảnh báo nào"
              : filter === "unread"
                ? "Không có cảnh báo chưa đọc"
                : "Chưa có cảnh báo nào đã đọc"}
          </p>
          {filter === "all" && (
            <Link
              to="/settings/alerts"
              className="inline-block text-xs text-primary hover:underline"
            >
              Tạo rule cảnh báo →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((alert, i) => {
            const level = getLevel(alert.aqi_category);
            const Icon = ICONS[level];
            const epa = getAqiCategoryByCode(alert.aqi_category);

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className={`glass-card p-4 cursor-pointer ${!alert.is_read ? "ring-1 ring-primary/30" : "opacity-70"}`}
                onClick={() => {
                  if (!alert.is_read) markRead.mutate(alert.id);
                }}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${COLORS[level]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                      {!alert.is_read && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded bg-primary/10 flex-shrink-0">
                          Mới
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11px] text-muted-foreground">
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
                      <span className="text-[10px] text-muted-foreground">
                        {alert.metric.toUpperCase()} = {alert.actual_value} (ngưỡng {alert.threshold})
                      </span>
                      {alert.station_name && (
                        <Link
                          to={`/stations/${alert.station_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-primary hover:underline"
                        >
                          {alert.station_name} →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
