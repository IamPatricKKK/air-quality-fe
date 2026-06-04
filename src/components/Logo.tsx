import { Link, useLocation } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  vertical?: boolean;
}

export function Logo({ size = 'md', showText = true, vertical = false }: LogoProps) {
  const iconSize = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-20 h-20',
  }[size];

  const titleSize = {
    sm: 'text-[13px]',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size];

  const subSize = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  }[size];

  const letterSpacing = {
    sm: '0.02em',
    md: '0.03em',
    lg: '0.04em',
  }[size];

  const location = useLocation();
  const isHome = location.pathname === '/home';

  const handleClick = (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link to="/home" onClick={handleClick} className={`${vertical ? 'flex flex-col items-center gap-2' : 'flex items-center gap-2.5'} no-underline`}>
      <img
        src="/logo-icon.png"
        alt="AirQualityVN"
        className={`${iconSize} rounded-xl object-contain border border-border/40 shadow-md`}
      />
      {showText && (
        <div className={vertical ? 'text-center' : ''}>
          <h1
            className={`${titleSize} leading-tight dark:text-[#3B82F6]`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 1000, color: '#1E56FD' }}
          >
            Air Quality VN
          </h1>
          <p
            className={`${subSize} leading-tight inline-block`}
            style={{
              fontFamily: "'PT Serif Caption', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing,
              background: 'linear-gradient(90deg, #06B6D4 0%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Theo dõi chất lượng không khí Việt Nam
          </p>
        </div>
      )}
    </Link>
  );
}
