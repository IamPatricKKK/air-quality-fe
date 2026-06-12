import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

interface LandingFooterProps {
  onRegister: () => void;
  /** Logged-in: show account links instead of the login/register button. */
  loggedIn?: boolean;
}

export function LandingFooter({ onRegister, loggedIn = false }: LandingFooterProps) {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Hệ thống theo dõi chất lượng không khí thời gian thực trên toàn quốc — AQI, dự báo 24h
              và cảnh báo sức khoẻ cho khu vực của bạn.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-foreground">Khám phá</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/home" className="text-muted-foreground hover:text-foreground transition-colors">
                  Bản đồ chất lượng không khí
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-muted-foreground hover:text-foreground transition-colors">
                  So sánh trạm
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  Giới thiệu
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-sm font-semibold text-foreground">Tài khoản</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {loggedIn ? (
                <>
                  <li>
                    <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                      Trang cá nhân
                    </Link>
                  </li>
                  <li>
                    <Link to="/notifications" className="text-muted-foreground hover:text-foreground transition-colors">
                      Thông báo & cảnh báo
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      onClick={onRegister}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Đăng nhập / Đăng ký
                    </button>
                  </li>
                  <li>
                    <Link to="/home" className="text-muted-foreground hover:text-foreground transition-colors">
                      Xem thử không cần tài khoản
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Air Quality VN — Theo dõi chất lượng không khí Việt Nam
          </p>
          <p className="text-[11px] text-muted-foreground/80 text-center sm:text-right max-w-md">
            Dữ liệu lấy từ API công cộng; thông tin chỉ mang tính tham khảo, không thay thế khuyến
            nghị chính thức từ cơ quan y tế.
          </p>
        </div>
      </div>
    </footer>
  );
}
