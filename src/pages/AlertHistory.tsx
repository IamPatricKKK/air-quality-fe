import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  Bell,
  CheckCheck,
  Filter,
  Loader2,
  Settings,
  Megaphone,
} from "lucide-react";
import { useAlerts, useMarkAlertRead, useMarkAllRead, useUnreadCount } from "@/hooks/useAlerts";
import { useNotifications } from "@/hooks/useNotifications";
import { getAqiCategoryByCode } from "@/lib/aqi";
import type { Alert } from "@/api/alerts";
import type { UserNotification } from "@/types";

type FilterValue = "all" | "unread" | "read";
type CategoryValue = "all" | "alerts";

type FeedItem =
  | { kind: "notification"; data: UserNotification }
  | { kind: "alert"; data: Alert };

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

export default function AlertHistory({ inline }: { inline?: boolean } = {}) {
  const { data: alerts = [], isLoading: alertsLoading } = useAlerts(200);
  const { data: notifications = [], isLoading: notifsLoading } = useNotifications();
  const { data: unread } = useUnreadCount();
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllRead();
  const [category, setCategory] = useState<CategoryValue>("all");
  const [filter, setFilter] = useState<FilterValue>("all");

  const isLoading = alertsLoading || notifsLoading;

  const unreadAlerts = unread?.count ?? alerts.filter((a) => !a.is_read).length;
  const unreadNotifs = notifications.filter((n) => !n.is_read).length;
  const totalCount = alerts.length + notifications.length;
  const totalUnread = unreadAlerts + unreadNotifs;

  // Combined feed for the selected category, sorted newest first.
  const base = useMemo<FeedItem[]>(() => {
    const merged: FeedItem[] =
      category === "alerts"
        ? alerts.map((a) => ({ kind: "alert", data: a }))
        : [
            ...notifications.map((n) => ({ kind: "notification" as const, data: n })),
            ...alerts.map((a) => ({ kind: "alert" as const, data: a })),
          ];
    return merged.sort(
      (a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime()
    );
  }, [alerts, notifications, category]);

  const baseUnread = base.filter((i) => !i.data.is_read).length;

  const filtered = useMemo(() => {
    if (filter === "unread") return base.filter((i) => !i.data.is_read);
    if (filter === "read") return base.filter((i) => i.data.is_read);
    return base;
  }, [base, filter]);

  return (
    <div className={`${inline ? '' : 'min-h-screen pb-20 md:pb-6'} p-3 md:p-6 space-y-4 max-w-4xl mx-auto`}>
      {!inline && (
        <div className="flex items-center justify-between">
          <BackButton />
          <Link
            to="/notifications/alerts"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-3.5 h-3.5" /> Cài đặt rule
          </Link>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-display font-bold text-foreground">Thông báo</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {totalCount > 0
              ? `${totalCount} thông báo · ${totalUnread} chưa đọc`
              : 'Chưa có thông báo nào'}
          </p>
        </div>
        {totalUnread > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Đã đọc tất cả
          </button>
        )}
      </div>

      {/* Category tabs: tất cả vs cảnh báo AQI */}
      <div className="flex items-center gap-2">
        {([
          { value: "all", label: `Tất cả (${totalCount})`, icon: Bell },
          { value: "alerts", label: `Cảnh báo (${alerts.length})`, icon: AlertTriangle },
        ] satisfies Array<{ value: CategoryValue; label: string; icon: typeof Bell }>).map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => setCategory(opt.value)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                category === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Read-status filter pills */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        {([
          { value: "all", label: `Tất cả (${base.length})` },
          { value: "unread", label: `Chưa đọc (${baseUnread})` },
          { value: "read", label: `Đã đọc (${base.length - baseUnread})` },
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
          Đang tải thông báo...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center space-y-2">
          <p className="text-sm text-foreground">
            {filter === "unread"
              ? "Không có thông báo chưa đọc"
              : filter === "read"
                ? "Chưa có thông báo nào đã đọc"
                : category === "alerts"
                  ? "Chưa có cảnh báo nào"
                  : "Chưa có thông báo nào"}
          </p>
          {filter === "all" && category === "alerts" && (
            <Link
              to="/notifications/alerts"
              className="inline-block text-xs text-primary hover:underline"
            >
              Tạo rule cảnh báo →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => {
            const delay = Math.min(i * 0.02, 0.3);

            if (item.kind === "notification") {
              const notif = item.data;
              return (
                <motion.div
                  key={`notif-${notif.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay }}
                  className={`glass-card p-4 border border-primary/20 ${!notif.is_read ? "ring-1 ring-primary/30" : "opacity-70"}`}
                >
                  <div className="flex items-start gap-3">
                    <Megaphone className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                        {!notif.is_read && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded bg-primary/10 flex-shrink-0">
                            Mới
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(notif.created_at).toLocaleString("vi-VN")}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-primary/10 text-primary">
                          Thông báo
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }

            const alert = item.data;
            const level = getLevel(alert.aqi_category);
            const Icon = ICONS[level];
            const epa = getAqiCategoryByCode(alert.aqi_category);

            return (
              <motion.div
                key={`alert-${alert.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
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
