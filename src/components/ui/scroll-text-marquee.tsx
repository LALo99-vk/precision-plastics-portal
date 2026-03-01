import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollTextMarqueeProps {
  children: string;
  baseVelocity?: number;
  className?: string;
  separator?: string;
}

export default function ScrollTextMarquee({
  children,
  baseVelocity = -3,
  className,
  separator = ' — ',
}: ScrollTextMarqueeProps) {
  const direction = baseVelocity > 0 ? 'right' : 'left';
  const from = direction === 'left' ? '0%' : '-50%';
  const to = direction === 'left' ? '-50%' : '0%';
  const speed = Math.abs(baseVelocity);
  const duration = 40 / speed;

  // Repeat text enough times for seamless loop
  const repeatCount = 8;
  const repeatedText = Array.from({ length: repeatCount })
    .map(() => children)
    .join(separator);

  return (
    <div className="w-full overflow-hidden">
      <motion.div
        className={cn('whitespace-nowrap w-max', className)}
        animate={{ x: [from, to] }}
        transition={{
          ease: 'linear',
          duration,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        <span>{repeatedText}{separator}</span>
        <span>{repeatedText}{separator}</span>
      </motion.div>
    </div>
  );
}
