import { Bell, LineChart, MapPin } from 'lucide-react';
import { Reveal } from '@/components/landing/Reveal';

const STEPS = [
  {
    icon: MapPin,
    step: '01',
    title: 'Chọn khu vực của bạn',
    desc: 'Tìm trạm gần nhất hoặc chọn tỉnh/thành trên bản đồ tương tác với 3 chế độ hiển thị.',
  },
  {
    icon: LineChart,
    step: '02',
    title: 'Xem chỉ số & dự báo',
    desc: 'Theo dõi AQI, PM2.5, biểu đồ 24h và dự báo AI cho 24 giờ tới — không cần refresh.',
  },
  {
    icon: Bell,
    step: '03',
    title: 'Nhận cảnh báo & lời khuyên',
    desc: 'Đăng ký để nhận cảnh báo qua app, email, push và khuyến nghị sức khoẻ phù hợp với bạn.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-secondary/30 border-y border-border/40">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Cách hoạt động
          </span>
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground">
            Bắt đầu chỉ với 3 bước
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            Từ dữ liệu thô đến quyết định hằng ngày cho sức khoẻ của bạn.
          </p>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-3 gap-5 md:gap-6">
          {STEPS.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.1}>
              <div className="ow-card relative h-full p-6 md:p-7">
                <span className="absolute top-5 right-6 font-display font-bold text-4xl text-primary/10">
                  {s.step}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-primary/12 flex items-center justify-center">
                  <s.icon className="w-[22px] h-[22px] text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
