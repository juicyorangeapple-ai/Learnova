import type { PropsWithChildren, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
}>;

export function Reveal({ children, className, delay = 0, direction = 'up' }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const offsets = {
    up: { x: 0, y: 22 },
    left: { x: -24, y: 0 },
    right: { x: 24, y: 0 },
    none: { x: 0, y: 0 },
  };
  const offset = reduceMotion ? offsets.none : offsets[direction];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, copy, align = 'left' }: { eyebrow: string; title: ReactNode; copy: string; align?: 'left' | 'center' }) {
  return (
    <Reveal className={`section-heading ${align === 'center' ? 'section-heading-center' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
    </Reveal>
  );
}
