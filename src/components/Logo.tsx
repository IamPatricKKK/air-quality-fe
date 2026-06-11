import { Link, useLocation } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  vertical?: boolean;
}

export function Logo({ size = 'md', showText = true, vertical = false }: LogoProps) {
  const iconSize = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-20 h-20',
  }[size];

  const titleSize = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl',
  }[size];

  const subSize = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  }[size];

  const location = useLocation();
  const scrollsToTop = location.pathname === '/home' || location.pathname === '/';

  const handleClick = (e: React.MouseEvent) => {
    if (scrollsToTop) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link
      to="/home"
      onClick={handleClick}
      className={`${vertical ? 'flex flex-col items-center gap-2' : 'flex items-center gap-2.5'} no-underline group`}
    >
      <img
        src="/logo-icon.png"
        alt="AirQualityVN"
        className={`${iconSize} rounded-xl object-contain border border-border/50 shadow-sm transition-transform duration-200 group-hover:scale-[1.03]`}
      />
      {showText && (
        <div className={vertical ? 'text-center' : ''}>
          <h1
            className={`${titleSize} leading-tight font-normal tracking-tight`}
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              color: 'hsl(201 100% 14%)',
            }}
          >
            Air Quality VN
          </h1>
          <p
            className={`${subSize} leading-tight font-medium tracking-wide mt-px`}
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              color: 'hsl(201 35% 52%)',
              letterSpacing: '0.04em',
            }}
          >
            Theo dõi chất lượng không khí
          </p>
        </div>
      )}
    </Link>
  );
}
