import { useEffect, useState, type ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  /** Delay in ms before the fade starts. */
  delay?: number;
  /** Transition duration in ms. */
  duration?: number;
  className?: string;
}

/** Fades children in (opacity 0 → 1) after a configurable delay. */
export function FadeIn({ children, delay = 0, duration = 1000, className = '' }: FadeInProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${visible ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
