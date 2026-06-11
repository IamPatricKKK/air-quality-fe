import { useEffect, useState } from 'react';

interface AnimatedHeadingProps {
  /** Heading text; use \n for hard line breaks. */
  text: string;
  className?: string;
  /** Per-character stagger in ms. */
  charDelay?: number;
  /** Delay in ms before the whole animation starts. */
  initialDelay?: number;
}

/**
 * Character-by-character heading reveal: each char slides in from the left
 * (translateX(-18px) → 0) while fading in, staggered by charDelay across the
 * full text so line 2 continues where line 1 left off.
 */
export function AnimatedHeading({
  text,
  className = '',
  charDelay = 30,
  initialDelay = 200,
}: AnimatedHeadingProps) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), initialDelay);
    return () => clearTimeout(timer);
  }, [initialDelay]);

  const lines = text.split('\n');
  let charsBefore = 0;

  return (
    <h1 className={className} style={{ letterSpacing: '-0.04em' }}>
      {lines.map((line, lineIndex) => {
        const lineOffset = charsBefore;
        charsBefore += line.length;
        return (
          <span key={lineIndex} className="block">
            {Array.from(line).map((char, charIndex) => (
              <span
                key={charIndex}
                className="inline-block"
                style={{
                  opacity: started ? 1 : 0,
                  transform: started ? 'translateX(0)' : 'translateX(-18px)',
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '500ms',
                  transitionDelay: `${(lineOffset + charIndex) * charDelay}ms`,
                }}
              >
                {char === ' ' ? ' ' : char}
              </span>
            ))}
          </span>
        );
      })}
    </h1>
  );
}
