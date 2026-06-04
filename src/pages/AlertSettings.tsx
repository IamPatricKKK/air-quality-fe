import { useState } from "react";
import { Link } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { ArrowLeft, Plus, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import {
  useAlertRules,
  useCreateRule,
  useUpdateRule,
  useDeleteRule,
  type CreateRulePayload,
} from "@/hooks/useAlerts";
import { useStations } from "@/hooks/useStations";
import { getAqiCategory } from "@/lib/aqi";

const METRICS = [
  { value: "aqi", label: "AQI" },
  { value: "pm25", label: "PM2.5" },
  { value: "pm10", label: "PM10" },
  { value: "o3", label: "O₃" },
  { value: "no2", label: "NO₂" },
  { value: "so2", label: "SO₂" },
  { value: "co", label: "CO" },
];

const OPERATORS = [
  { value: "gte", label: "≥" },
  { value: "gt", label: ">" },
  { value: "lte", label: "≤" },
  { value: "lt", label: "<" },
];

export default function AlertSettings() {
  const { data: rules, isLoading } = useAlertRules();
  const { data: stations } = useStations();
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateRulePayload>({
    station_id: null,
    metric: "aqi",
    operator: "gte",
    threshold: 100,
    channels: ["in_app"],
    cooldown_min: 360,
  });

  const handleCreate = async () => {
    await createRule.mutateAsync(form);
    setShowForm(false);
    setForm({ station_id: null, metric: "aqi", operator: "gte", threshold: 100, channels: ["in_app"], cooldown_min: 360 });
  };

  const toggleChannel = (ch: string) => {
    setForm((f) => {
      const channels = f.channels ?? ["in_app"];
      return {
        ...f,
        channels: channels.includes(ch)
          ? channels.filter((c) => c !== ch)
          : [...channels, ch],
      };
    });
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 space-y-4 max-w-3xl mx-auto">
      <BackButton />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Cài đặt cảnh báo</h1>
          <p className="text-xs text-muted-foreground mt-1">Tạo rule để nhận cảnh báo khi chỉ số vượt ngưỡng.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm rule
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass-card p-4 space-y-3">
          <h2 className="text-sm font-semibold">Rule mới</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Trạm</label>
              <select
                className="w-full mt-1 px-3 py-2 bg-secondary rounded-lg text-xs text-foreground"
                value={form.station_id ?? ""}
                onChange={(e) => setForm({ ...form, station_id: e.target.value || null })}
              >
                <option value="">Tất cả trạm</option>
                {(stations ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Chỉ số</label>
              <select
                className="w-full mt-1 px-3 py-2 bg-secondary rounded-lg text-xs text-foreground"
                value={form.metric}
                onChange={(e) => setForm({ ...form, metric: e.target.value })}
              >
                {METRICS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Toán tử</label>
              <select
                className="w-full mt-1 px-3 py-2 bg-secondary rounded-lg text-xs text-foreground"
                value={form.operator}
                onChange={(e) => setForm({ ...form, operator: e.target.value })}
              >
                {OPERATORS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Ngưỡng</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 bg-secondary rounded-lg text-xs text-foreground"
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Cooldown (phút)</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 bg-secondary rounded-lg text-xs text-foreground"
                value={form.cooldown_min}
                onChange={(e) => setForm({ ...form, cooldown_min: Number(e.target.value) })}
              />
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="text-xs text-muted-foreground">Kênh gửi</label>
              <div className="flex flex-wrap gap-3 mt-2">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.channels?.includes("in_app")}
                    onChange={() => toggleChannel("in_app")}
                  />
                  In-app
                </label>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.channels?.includes("email")}
                    onChange={() => toggleChannel("email")}
                  />
                  Email
                </label>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.channels?.includes("push")}
                    onChange={() => toggleChannel("push")}
                  />
                  Push (PWA)
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Push yêu cầu đã bật thông báo đẩy trong Cài đặt thông báo.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={createRule.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {createRule.isPending ? "Đang tạo..." : "Tạo rule"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-secondary rounded-lg text-xs text-muted-foreground hover:text-foreground"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Đang tải rules...
        </div>
      ) : !rules?.length ? (
        <div className="glass-card p-8 text-center text-sm text-muted-foreground">
          Chưa có rule cảnh báo nào. Nhấn "Thêm rule" để bắt đầu.
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => {
            const metric = METRICS.find((m) => m.value === rule.metric);
            const op = OPERATORS.find((o) => o.value === rule.operator);
            const epa = rule.metric === "aqi" ? getAqiCategory(rule.threshold) : null;

            return (
              <div
                key={rule.id}
                className={`glass-card p-4 flex items-center justify-between gap-4 ${!rule.is_active ? "opacity-50" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {rule.station_name ?? "Tất cả trạm"} — {metric?.label ?? rule.metric} {op?.label ?? rule.operator} {rule.threshold}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Kênh: {rule.channels.join(", ")} · Cooldown: {rule.cooldown_min} phút
                    {epa && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: epa.color, color: epa.textColor }}>
                        {epa.labelShort}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    title={rule.is_active ? "Tắt rule" : "Bật rule"}
                    onClick={() =>
                      updateRule.mutate({ id: rule.id, payload: { is_active: !rule.is_active } })
                    }
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {rule.is_active ? (
                      <ToggleRight className="w-5 h-5 text-primary" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    title="Xoá rule"
                    onClick={() => {
                      if (confirm("Xoá rule này?")) deleteRule.mutate(rule.id);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
