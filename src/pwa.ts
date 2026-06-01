import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";

export function setupPwa() {
  if (!("serviceWorker" in navigator)) return;

  const updateSW = registerSW({
    onNeedRefresh() {
      toast("Phiên bản mới đã sẵn sàng", {
        description: "Bấm để tải lại và cập nhật ứng dụng.",
        action: {
          label: "Tải lại",
          onClick: () => updateSW(true),
        },
        duration: 10000,
      });
    },
    onOfflineReady() {
      toast.success("Ứng dụng sẵn sàng dùng offline", {
        description: "Dữ liệu gần nhất sẽ được lưu để xem khi mất mạng.",
      });
    },
  });
}
