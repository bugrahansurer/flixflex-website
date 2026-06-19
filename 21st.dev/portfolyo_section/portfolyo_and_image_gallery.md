Installation: npx shadcn@latest add https://21st.dev/r/iamsatish4564/portfolio-and-image-gallery

How to use:

Prompt:
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
portfolio-and-image-gallery.tsx
'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, {
  forwardRef,
  HTMLAttributes,
  ReactNode,
  Ref,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function useMergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return useMemo(() => {
    if (refs.every((ref) => ref == null)) return null;
    return (node: T) => {
      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref != null) {
          (ref as React.MutableRefObject<T | null>).current = node;
        }
      });
    };
  }, [refs]);
}

function useResponsiveValue(baseValue: number, mobileValue: number) {
  const [value, setValue] = useState(baseValue);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setValue(window.innerWidth < 768 ? mobileValue : baseValue);
    };

    handleResize();

    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [baseValue, mobileValue]);

  return value;
}

export interface RadialScrollGalleryProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Render function that returns the array of items to be placed on the wheel.
   * Receives the currently `hoveredIndex` to allow for parent-controlled hover states.
   */
  children: (hoveredIndex: number | null) => ReactNode[];
  /**
   * The vertical scroll distance (in pixels) required to complete one full 360-degree rotation.
   * Defaults to 2500.
   */
  scrollDuration?: number;
  /**
   * Percentage of the circle visible above the fold (0-100).
   * Determines how "deep" the wheel is buried. Defaults to 45.
   */
  visiblePercentage?: number;
  /** Radius of the circle on desktop devices (>=768px). */
  baseRadius?: number;
  /** Radius of the circle on mobile devices (<768px). */
  mobileRadius?: number;
  /**
   * GSAP ScrollTrigger start position string (e.g., "top 80%", "center center").
   */
  startTrigger?: string;
  /** Callback fired when an item is clicked or selected via keyboard. */
  onItemSelect?: (index: number) => void;
  /** Rotational direction of the wheel. */
  direction?: 'ltr' | 'rtl';
  /** Disables all interactions and applies a grayscale effect. */
  disabled?: boolean;
}

/**
 * A scroll-driven interaction that rotates items along a large, partially hidden circle.
 * The component pins itself to the viewport while the user scrolls through the rotational progress.
 */
export const RadialScrollGallery = forwardRef<
  HTMLDivElement,
  RadialScrollGalleryProps
>(
  (
    {
      children,
      scrollDuration = 2500,
      visiblePercentage = 45,
      baseRadius = 550,
      mobileRadius = 220,
      className = '',
      startTrigger = 'center center',
      onItemSelect,
      direction = 'ltr',
      disabled = false,
      ...rest
    },
    ref
  ) => {
    const pinRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLUListElement>(null);
    const childRef = useRef<HTMLLIElement>(null);

    const mergedRef = useMergeRefs(ref, pinRef);

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [childSize, setChildSize] = useState<{ w: number; h: number } | null>(
      null
    );
    const [isMounted, setIsMounted] = useState(false);

    const currentRadius = useResponsiveValue(baseRadius, mobileRadius);
    const circleDiameter = currentRadius * 2;

    const { visibleDecimal, hiddenDecimal } = useMemo(() => {
      const clamped = Math.max(10, Math.min(100, visiblePercentage));
      const v = clamped / 100;
      return { visibleDecimal: v, hiddenDecimal: 1 - v };
    }, [visiblePercentage]);

    const childrenNodes = useMemo(
      () => React.Children.toArray(children(hoveredIndex)),
      [children, hoveredIndex]
    );
    const childrenCount = childrenNodes.length;

    // Measure the first child to determine layout buffers.
    // This ensures the container is tall enough to prevent clipping as items rotate.
    useEffect(() => {
      setIsMounted(true);

      if (!childRef.current) return;

      const observer = new ResizeObserver((entries) => {
        let hasChanged = false;
        for (const entry of entries) {
          setChildSize({
            w: entry.contentRect.width,
            h: entry.contentRect.height,
          });
          hasChanged = true;
        }
        if (hasChanged) {
          ScrollTrigger.refresh();
        }
      });

      observer.observe(childRef.current);
      return () => observer.disconnect();
    }, [childrenCount]);

    useGSAP(
      () => {
        if (!pinRef.current || !containerRef.current || childrenCount === 0)
          return;

        const prefersReducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;

        if (!prefersReducedMotion) {
          gsap.fromTo(
            containerRef.current.children,
            { scale: 0, autoAlpha: 0 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 1.2,
              ease: 'back.out(1.2)',
              stagger: 0.05,
              scrollTrigger: {
                trigger: pinRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );

          gsap.to(containerRef.current, {
            rotation: 360,
            ease: 'none',
            scrollTrigger: {
              trigger: pinRef.current,
              pin: true,
              start: startTrigger,
              end: `+=${scrollDuration}`,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }
      },
      {
        scope: pinRef,
        dependencies: [
          scrollDuration,
          currentRadius,
          startTrigger,
          childrenCount,
        ],
      }
    );

    if (childrenCount === 0) return null;

    // Calculate the total height required for the pinned container.
    // We need (Visible Circle Height) + (Half Item Height) + (Buffer) to ensure items aren't cut off by the mask.
    const scaleFactor = 1.25;
    const calculatedBuffer = childSize
      ? childSize.h * scaleFactor - childSize.h + 60
      : 150;

    const visibleAreaHeight = childSize
      ? circleDiameter * visibleDecimal + childSize.h / 2 + calculatedBuffer
      : circleDiameter * visibleDecimal + 200;

    return (
      <div
        ref={mergedRef}
        className={`min-h-screen w-full relative flex items-center justify-center overflow-hidden ${className}`}
        {...rest}
      >
        <div
          className='relative w-full overflow-hidden'
          style={{
            height: `${visibleAreaHeight}px`,
            maskImage:
              'linear-gradient(to top, transparent 0%, black 40%, black 100%)',
            WebkitMaskImage:
              'linear-gradient(to top, transparent 0%, black 40%, black 100%)',
          }}
        >
          <ul
            ref={containerRef}
            className={`
              absolute left-1/2 -translate-x-1/2 will-change-transform m-0 p-0 list-none
              transition-opacity duration-500 ease-out
              ${disabled ? 'opacity-50 pointer-events-none grayscale' : ''}
              ${isMounted ? 'opacity-100' : 'opacity-0'}
            `}
            dir={direction}
            style={{
              width: circleDiameter,
              height: circleDiameter,
              bottom: -(circleDiameter * hiddenDecimal),
            }}
          >
            {childrenNodes.map((child, index) => {
              const angle = (index / childrenCount) * 2 * Math.PI;
              let x = currentRadius * Math.cos(angle);
              const y = currentRadius * Math.sin(angle);

              if (direction === 'rtl') {
                x = -x;
              }

              const rotationAngle = (angle * 180) / Math.PI;
              const isHovered = hoveredIndex === index;
              const isAnyHovered = hoveredIndex !== null;

              return (
                <li
                  key={index}
                  ref={index === 0 ? childRef : null}
                  className='absolute top-1/2 left-1/2'
                  style={{
                    zIndex: isHovered ? 100 : 10,
                    transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${
                      rotationAngle + 90
                    }deg)`,
                  }}
                >
                  {/* 
                    Using a generic div with role="button" instead of <button> 
                    to allow passing interactive children (like <Link>) without creating invalid HTML nesting.
                  */}
                  <div
                    role='button'
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => !disabled && onItemSelect?.(index)}
                    onKeyDown={(e) => {
                      if (disabled) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onItemSelect?.(index);
                      }
                    }}
                    onMouseEnter={() => !disabled && setHoveredIndex(index)}
                    onMouseLeave={() => !disabled && setHoveredIndex(null)}
                    onFocus={() => !disabled && setHoveredIndex(index)}
                    onBlur={() => !disabled && setHoveredIndex(null)}
                    className={`
                      block cursor-pointer outline-none text-left
                      focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                      rounded-xl transition-all duration-500 ease-out will-change-transform
                      ${isHovered ? 'scale-125 -translate-y-8' : 'scale-100'}
                      ${
                        isAnyHovered && !isHovered
                          ? 'blur-[2px] opacity-40 grayscale'
                          : 'blur-0 opacity-100'
                      }
                    `}
                  >
                    {child}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
);

RadialScrollGallery.displayName = 'RadialScrollGallery';

demo.tsx
'use client';

import React from 'react';
import { RadialScrollGallery } from '@/components/ui/portfolio-and-image-gallery';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const projects = [
{ id: 1, title: "Nebula", cat: "Art", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" },
{ id: 2, title: "Decay", cat: "Photo", img: "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=400&q=80" },
{ id: 3, title: "Oceanic", cat: "Nature", img: "https://images.unsplash.com/photo-1468581264429-2548ef9eb732?auto=format&fit=crop&w=400&q=80" },
{ id: 4, title: "Neon", cat: "Tech", img: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=400&q=80" },
{ id: 5, title: "Desert", cat: "Travel", img: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=400&q=80" },
];

export default function DemoRadialScrollGalleryBento() {
return (
  <div className="bg-background min-h-[600px] text-foreground overflow-hidden rounded-lg border w-full">
    <div className="h-[300px] flex flex-col items-center justify-center space-y-4 pt-8">
      <div className="space-y-1 text-center">
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Portfolio
        </span>
        <h1 className="text-4xl font-bold tracking-tighter">
          Work
        </h1>
      </div>
      <div className="animate-bounce text-muted-foreground text-xs">↓ Scroll</div>
    </div>

    <RadialScrollGallery
      className="!min-h-[600px]"
      baseRadius={400}
      mobileRadius={250}
      visiblePercentage={50}
      scrollDuration={2000}
    >
      {(hoveredIndex) =>
        projects.map((project, index) => {
           const isActive = hoveredIndex === index;
           return (
            <div 
              key={project.id} 
              className="group relative w-[200px] h-[280px] sm:w-[240px] sm:h-[320px] overflow-hidden rounded-xl bg-card border border-border shadow-lg"
            >
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={project.img}
                  alt={project.title}
                  className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
                    isActive ? 'scale-110 blur-0' : 'scale-100 blur-[1px] grayscale-[30%]'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-60" />
              </div>

              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-background/80 backdrop-blur">
                    {project.cat}
                  </Badge>
                  <div className={`w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all duration-500 ${isActive ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-45'}`}>
                    <ArrowUpRight size={12} />
                  </div>
                </div>

                <div className={`transition-transform duration-500 ${isActive ? 'translate-y-0' : 'translate-y-2'}`}>
                  <h3 className="text-xl font-bold leading-tight text-foreground">{project.title}</h3>
                  <div className={`h-0.5 bg-primary mt-2 transition-all duration-500 ${isActive ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
                </div>
              </div>
            </div>
           );
        })
      }
    </RadialScrollGallery>

    <div className="h-[300px] flex items-center justify-center bg-muted/30">
      <h2 className="text-xl font-light tracking-widest uppercase text-muted-foreground">
        Footer
      </h2>
    </div>
  </div>
);
}
```

Copy-paste these files for dependencies:
```tsx
shadcn/badge
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

```

Install NPM dependencies:
```bash
gsap, @gsap/react, class-variance-authority
```

Code:
'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, {
  forwardRef,
  HTMLAttributes,
  ReactNode,
  Ref,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function useMergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return useMemo(() => {
    if (refs.every((ref) => ref == null)) return null;
    return (node: T) => {
      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref != null) {
          (ref as React.MutableRefObject<T | null>).current = node;
        }
      });
    };
  }, [refs]);
}

function useResponsiveValue(baseValue: number, mobileValue: number) {
  const [value, setValue] = useState(baseValue);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setValue(window.innerWidth < 768 ? mobileValue : baseValue);
    };

    handleResize();

    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [baseValue, mobileValue]);

  return value;
}

export interface RadialScrollGalleryProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Render function that returns the array of items to be placed on the wheel.
   * Receives the currently `hoveredIndex` to allow for parent-controlled hover states.
   */
  children: (hoveredIndex: number | null) => ReactNode[];
  /**
   * The vertical scroll distance (in pixels) required to complete one full 360-degree rotation.
   * Defaults to 2500.
   */
  scrollDuration?: number;
  /**
   * Percentage of the circle visible above the fold (0-100).
   * Determines how "deep" the wheel is buried. Defaults to 45.
   */
  visiblePercentage?: number;
  /** Radius of the circle on desktop devices (>=768px). */
  baseRadius?: number;
  /** Radius of the circle on mobile devices (<768px). */
  mobileRadius?: number;
  /**
   * GSAP ScrollTrigger start position string (e.g., "top 80%", "center center").
   */
  startTrigger?: string;
  /** Callback fired when an item is clicked or selected via keyboard. */
  onItemSelect?: (index: number) => void;
  /** Rotational direction of the wheel. */
  direction?: 'ltr' | 'rtl';
  /** Disables all interactions and applies a grayscale effect. */
  disabled?: boolean;
}

/**
 * A scroll-driven interaction that rotates items along a large, partially hidden circle.
 * The component pins itself to the viewport while the user scrolls through the rotational progress.
 */
export const RadialScrollGallery = forwardRef<
  HTMLDivElement,
  RadialScrollGalleryProps
>(
  (
    {
      children,
      scrollDuration = 2500,
      visiblePercentage = 45,
      baseRadius = 550,
      mobileRadius = 220,
      className = '',
      startTrigger = 'center center',
      onItemSelect,
      direction = 'ltr',
      disabled = false,
      ...rest
    },
    ref
  ) => {
    const pinRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLUListElement>(null);
    const childRef = useRef<HTMLLIElement>(null);

    const mergedRef = useMergeRefs(ref, pinRef);

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [childSize, setChildSize] = useState<{ w: number; h: number } | null>(
      null
    );
    const [isMounted, setIsMounted] = useState(false);

    const currentRadius = useResponsiveValue(baseRadius, mobileRadius);
    const circleDiameter = currentRadius * 2;

    const { visibleDecimal, hiddenDecimal } = useMemo(() => {
      const clamped = Math.max(10, Math.min(100, visiblePercentage));
      const v = clamped / 100;
      return { visibleDecimal: v, hiddenDecimal: 1 - v };
    }, [visiblePercentage]);

    const childrenNodes = useMemo(
      () => React.Children.toArray(children(hoveredIndex)),
      [children, hoveredIndex]
    );
    const childrenCount = childrenNodes.length;

    // Measure the first child to determine layout buffers.
    // This ensures the container is tall enough to prevent clipping as items rotate.
    useEffect(() => {
      setIsMounted(true);

      if (!childRef.current) return;

      const observer = new ResizeObserver((entries) => {
        let hasChanged = false;
        for (const entry of entries) {
          setChildSize({
            w: entry.contentRect.width,
            h: entry.contentRect.height,
          });
          hasChanged = true;
        }
        if (hasChanged) {
          ScrollTrigger.refresh();
        }
      });

      observer.observe(childRef.current);
      return () => observer.disconnect();
    }, [childrenCount]);

    useGSAP(
      () => {
        if (!pinRef.current || !containerRef.current || childrenCount === 0)
          return;

        const prefersReducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;

        if (!prefersReducedMotion) {
          gsap.fromTo(
            containerRef.current.children,
            { scale: 0, autoAlpha: 0 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 1.2,
              ease: 'back.out(1.2)',
              stagger: 0.05,
              scrollTrigger: {
                trigger: pinRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );

          gsap.to(containerRef.current, {
            rotation: 360,
            ease: 'none',
            scrollTrigger: {
              trigger: pinRef.current,
              pin: true,
              start: startTrigger,
              end: `+=${scrollDuration}`,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          });
        }
      },
      {
        scope: pinRef,
        dependencies: [
          scrollDuration,
          currentRadius,
          startTrigger,
          childrenCount,
        ],
      }
    );

    if (childrenCount === 0) return null;

    // Calculate the total height required for the pinned container.
    // We need (Visible Circle Height) + (Half Item Height) + (Buffer) to ensure items aren't cut off by the mask.
    const scaleFactor = 1.25;
    const calculatedBuffer = childSize
      ? childSize.h * scaleFactor - childSize.h + 60
      : 150;

    const visibleAreaHeight = childSize
      ? circleDiameter * visibleDecimal + childSize.h / 2 + calculatedBuffer
      : circleDiameter * visibleDecimal + 200;

    return (
      <div
        ref={mergedRef}
        className={`min-h-screen w-full relative flex items-center justify-center overflow-hidden ${className}`}
        {...rest}
      >
        <div
          className='relative w-full overflow-hidden'
          style={{
            height: `${visibleAreaHeight}px`,
            maskImage:
              'linear-gradient(to top, transparent 0%, black 40%, black 100%)',
            WebkitMaskImage:
              'linear-gradient(to top, transparent 0%, black 40%, black 100%)',
          }}
        >
          <ul
            ref={containerRef}
            className={`
              absolute left-1/2 -translate-x-1/2 will-change-transform m-0 p-0 list-none
              transition-opacity duration-500 ease-out
              ${disabled ? 'opacity-50 pointer-events-none grayscale' : ''}
              ${isMounted ? 'opacity-100' : 'opacity-0'}
            `}
            dir={direction}
            style={{
              width: circleDiameter,
              height: circleDiameter,
              bottom: -(circleDiameter * hiddenDecimal),
            }}
          >
            {childrenNodes.map((child, index) => {
              const angle = (index / childrenCount) * 2 * Math.PI;
              let x = currentRadius * Math.cos(angle);
              const y = currentRadius * Math.sin(angle);

              if (direction === 'rtl') {
                x = -x;
              }

              const rotationAngle = (angle * 180) / Math.PI;
              const isHovered = hoveredIndex === index;
              const isAnyHovered = hoveredIndex !== null;

              return (
                <li
                  key={index}
                  ref={index === 0 ? childRef : null}
                  className='absolute top-1/2 left-1/2'
                  style={{
                    zIndex: isHovered ? 100 : 10,
                    transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) rotate(${
                      rotationAngle + 90
                    }deg)`,
                  }}
                >
                  {/* 
                    Using a generic div with role="button" instead of <button> 
                    to allow passing interactive children (like <Link>) without creating invalid HTML nesting.
                  */}
                  <div
                    role='button'
                    tabIndex={disabled ? -1 : 0}
                    onClick={() => !disabled && onItemSelect?.(index)}
                    onKeyDown={(e) => {
                      if (disabled) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onItemSelect?.(index);
                      }
                    }}
                    onMouseEnter={() => !disabled && setHoveredIndex(index)}
                    onMouseLeave={() => !disabled && setHoveredIndex(null)}
                    onFocus={() => !disabled && setHoveredIndex(index)}
                    onBlur={() => !disabled && setHoveredIndex(null)}
                    className={`
                      block cursor-pointer outline-none text-left
                      focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                      rounded-xl transition-all duration-500 ease-out will-change-transform
                      ${isHovered ? 'scale-125 -translate-y-8' : 'scale-100'}
                      ${
                        isAnyHovered && !isHovered
                          ? 'blur-[2px] opacity-40 grayscale'
                          : 'blur-0 opacity-100'
                      }
                    `}
                  >
                    {child}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
);

RadialScrollGallery.displayName = 'RadialScrollGallery';