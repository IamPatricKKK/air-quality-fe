import { airQualityApiRequest } from "@/api/client";

// ---------- Types ----------

export interface AlertRule {
  id: string;
  user_id: string;
  station_id: string | null;
  station_name?: string | null;
  metric: string;
  operator: string;
  threshold: number;
  channels: string[];
  cooldown_min: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRulePayload {
  station_id?: string | null;
  metric?: string;
  operator?: string;
  threshold: number;
  channels?: string[];
  cooldown_min?: number;
}

export interface UpdateRulePayload {
  station_id?: string | null;
  metric?: string;
  operator?: string;
  threshold?: number;
  channels?: string[];
  cooldown_min?: number;
  is_active?: boolean;
}

export interface Alert {
  id: string;
  rule_id: string;
  station_id: string | null;
  station_name: string | null;
  metric: string;
  threshold: number;
  actual_value: number;
  aqi_category: string | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ---------- Alert Rules ----------

export function listAlertRules() {
  return airQualityApiRequest<AlertRule[]>("/alert-rules");
}

export function createAlertRule(payload: CreateRulePayload) {
  return airQualityApiRequest<AlertRule>("/alert-rules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAlertRule(id: string, payload: UpdateRulePayload) {
  return airQualityApiRequest<AlertRule>(`/alert-rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAlertRule(id: string) {
  return airQualityApiRequest<{ success: boolean }>(`/alert-rules/${id}`, {
    method: "DELETE",
  });
}

// ---------- Alerts ----------

export function listAlerts(limit = 50) {
  return airQualityApiRequest<Alert[]>(`/alerts?limit=${limit}`);
}

export function getUnreadCount() {
  return airQualityApiRequest<{ count: number }>("/alerts/unread-count");
}

export function markAlertRead(id: string) {
  return airQualityApiRequest<{ success: boolean }>(`/alerts/${id}/read`, {
    method: "PATCH",
  });
}

export function markAllAlertsRead() {
  return airQualityApiRequest<{ success: boolean }>("/alerts/read-all", {
    method: "PATCH",
  });
}
