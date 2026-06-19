'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

function cx(...parts: Array<string | undefined | false | null>): string {
  return parts.filter(Boolean).join(' ');
}

export interface FlowSectionProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  'aria-label'?: string;
  fullBleed?: boolean;
  id?: string;
  'data-section-id'?: string;
}

export const FlowSection = React.forwardRef<HTMLElement, FlowSectionProps>(
  (
    {
      className,
      style = {},
      children,
      'aria-label': ariaLabel,
      fullBleed = false,
      id,
      'data-section-id': dataSectionId,
    },
    ref,
  ) => (
    <section
      ref={ref}
      id={id}
      data-section-id={dataSectionId}
      data-flow-section
      aria-label={ariaLabel}
      className={cx('relative min-h-screen w-full overflow-hidden will-change-transform', className)}
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translate3d(0, 0, 0)',
        ...style
      }}
    >
      <div
        data-flow-inner
        className={cx(
          'flow-art-container relative flex min-h-screen w-full flex-col will-change-transform',
          fullBleed ? 'justify-start p-0 gap-0' : 'justify-between gap-6 px-[4vw] pt-[clamp(2rem,8vw,4vw)] pb-[4vw]',
          className,
        )}
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transformOrigin: 'bottom left',
          ...style
        }}
      >
        {children}
      </div>
    </section>
  ),
);
FlowSection.displayName = 'FlowSection';

export interface FlowArtProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

const childCount = (children: React.ReactNode) => React.Children.count(children);

export const FlowArt: React.FC<FlowArtProps> = ({
  children,
  className,
  'aria-label': ariaLabel = 'Story scroll',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || reducedMotion) return;

      const sections = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>('[data-flow-section]'),
      );
      if (sections.length === 0) return;

      const triggers: ScrollTrigger[] = [];

      sections.forEach((section, i) => {
        gsap.set(section, { zIndex: i + 1 });

        const inner = section.querySelector<HTMLElement>('.flow-art-container');
        if (!inner) return;

        if (i > 0) {
          gsap.set(inner, { rotation: 30, transformOrigin: 'bottom left' });
          const tween = gsap.to(inner, {
            rotation: 0,
            ease: 'power1.out',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: 1,
            },
          });
          if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
        }

        if (i < sections.length - 1) {
          const nextSection = sections[i + 1];
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: 'bottom bottom',
              end: () => `+=${nextSection.offsetHeight}`,
              pin: true,
              pinSpacing: false,
              pinType: 'transform',
              anticipatePin: 1,
            }),
          );
        }
      });

      ScrollTrigger.refresh();

      return () => {
        triggers.forEach((t) => t.kill());
      };
    },
    { scope: containerRef, dependencies: [childCount(children), reducedMotion] },
  );

  return (
    <main
      ref={containerRef}
      aria-label={ariaLabel}
      className={cx('w-full overflow-x-hidden', className)}
    >
      {children}
    </main>
  );
};

export default FlowArt;
