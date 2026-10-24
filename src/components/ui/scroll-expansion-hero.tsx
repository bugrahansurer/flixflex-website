'use client';

import {
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import Image, { getImageProps } from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from '@/lib/icons';

/** isMobileState ile aynı kırılım (< 768px) */
const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

/** Kartın ilk (kapalı) genişliği: mobil 240px, masaüstü 320px */
const POSTER_SIZES = '(max-width: 767px) 240px, 320px';

/**
 * Kapak görselinin karta göre boyutlandırılmış srcset'i (Next görsel
 * optimizasyonu). Açılışta 1080px+ orijinal yerine kart boyutunda bir sürüm
 * iner; ilk boyama için gereken CSS/font ile bant genişliği yarışmaz.
 * Yalnızca optimizasyona izin verilen kaynaklar (kendi CDN'imiz / yerel).
 */
function posterSrcSet(src?: string): string | undefined {
  if (!src || !(src.startsWith('https://cdn.flixflex.com.tr/') || src.startsWith('/'))) return undefined;
  return getImageProps({ src, alt: '', width: 320, height: 420, sizes: POSTER_SIZES }).props.srcSet;
}

export interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  /** Mobil (<768px) için ayrı, dikey medya — boşsa mediaSrc kullanılır */
  mediaSrcMobile?: string;
  posterSrc?: string;
  /** Mobil kapak görseli — boşsa posterSrc kullanılır */
  posterSrcMobile?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

export const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  mediaSrcMobile,
  posterSrc,
  posterSrcMobile,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);
  // Kapak görseli varsa video, sayfa yüklemesi (load) bitene kadar indirilmez:
  // kartta videonun ilk karesi (kapak) görünür, ilk boyama için gereken
  // dosyalar bant genişliğini videoyla paylaşmaz. Kapak yoksa hemen yüklenir.
  const [loadVideo, setLoadVideo] = useState<boolean>(!posterSrc);

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType]);

  useEffect(() => {
    const handleWheel = (e: globalThis.WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const scrollDelta = e.deltaY * 0.0009;
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }
      }
    };

    const handleTouchStart = (e: globalThis.TouchEvent) => {
      setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      if (!touchStartY) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        // Increase sensitivity for mobile, especially when scrolling back
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005; // Higher sensitivity for scrolling back
        const scrollDelta = deltaY * scrollFactor;
        const newProgress = Math.min(
          Math.max(scrollProgress + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }

        setTouchStartY(touchY);
      }
    };

    const handleTouchEnd = (): void => {
      setTouchStartY(0);
    };

    const handleScroll = (): void => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('wheel', handleWheel, {
      passive: false,
    });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener(
      'touchstart',
      handleTouchStart,
      { passive: false }
    );
    window.addEventListener(
      'touchmove',
      handleTouchMove,
      { passive: false }
    );
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener(
        'wheel',
        handleWheel
      );
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener(
        'touchstart',
        handleTouchStart
      );
      window.removeEventListener(
        'touchmove',
        handleTouchMove
      );
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollProgress, mediaFullyExpanded, touchStartY]);

  useEffect(() => {
    if (loadVideo) return;
    const start = () => setLoadVideo(true);
    if (document.readyState === 'complete') {
      start();
      return;
    }
    window.addEventListener('load', start, { once: true });
    return () => window.removeEventListener('load', start);
  }, [loadVideo]);

  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobileState(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const startWidth = isMobileState ? 240 : 320;
  const startHeight = isMobileState ? 320 : 420;
  const textTranslateX = scrollProgress * (isMobileState ? 180 : 150);

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  // LCP optimizasyonu: poster'ı SSR'da anında görünen fetchPriority=high <img> olarak da basıyoruz.
  const effectivePoster = posterSrc;
  // Kart büyümeye başlayınca (ilk kaydırma) tam çözünürlüklü orijinale geçilir;
  // tarayıcı yenisi inene kadar eskisini gösterdiği için geçiş görünmez.
  const posterHiRes = scrollProgress > 0;
  const posterSet = posterHiRes ? undefined : posterSrcSet(posterSrc);
  const posterMobileSet = posterHiRes ? undefined : posterSrcSet(posterSrcMobile);

  return (
    <div
      ref={sectionRef}
      className='transition-colors duration-700 ease-in-out overflow-x-hidden w-full min-h-screen relative'
    >
      {/* Background Image overlay */}
      <motion.div
        className='absolute inset-0 z-0 h-screen w-full pointer-events-none'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 - scrollProgress }}
        transition={{ duration: 0.1 }}
      >
        <Image
          src={bgImageSrc}
          alt='Background'
          fill
          sizes="100vw"
          className='object-cover object-center'
          priority
        />
        <div className='absolute inset-0 bg-black/10' />
        {/* Premium depth: radial vignette + bottom scrim for text legibility */}
        <div
          aria-hidden
          className='absolute inset-0 pointer-events-none'
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 50% 45%, transparent 40%, rgba(0,0,0,0.45) 100%), linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.55) 100%)',
          }}
        />
      </motion.div>

      {/* Main hero fold wrapper (Exactly h-screen, relative, flex-center) */}
      <div className='w-full flex flex-col items-center justify-center relative z-10 h-screen overflow-hidden'>

        {/* Expansion progress bar — top edge */}
        <div className='absolute top-0 inset-x-0 h-[3px] z-30 pointer-events-none bg-white/10'>
          <div
            className='h-full bg-[var(--ff-purple)] shadow-[0_0_12px_rgba(255,79,216,0.7)]'
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>


        {/* Expanding Media Card */}
        <div
          className='ff-shape-container absolute z-0 top-1/2 left-1/2 transition-none'
          style={{
            width: `calc(${startWidth}px + ${scrollProgress} * (100% - ${startWidth}px))`,
            height: `calc(${startHeight}px + ${scrollProgress} * (100vh - ${startHeight}px))`,
            maxWidth: '100vw',
            maxHeight: '100vh',
            borderRadius: `${(1 - scrollProgress) * 16}px`,
            boxShadow: `0px 0px 50px rgba(0, 0, 0, ${0.3 * (1 - scrollProgress)})`,
            overflow: 'hidden',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {mediaType === 'video' ? (
            mediaSrc.includes('youtube.com') ? (
              <div className='relative w-full h-full pointer-events-none rounded-[inherit]'>
                <iframe
                  width='100%'
                  height='100%'
                  src={
                    mediaSrc.includes('embed')
                      ? mediaSrc +
                      (mediaSrc.includes('?') ? '&' : '?') +
                      'autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1'
                      : mediaSrc.replace('watch?v=', 'embed/') +
                      '?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=' +
                      mediaSrc.split('v=')[1]
                  }
                  className='w-full h-full rounded-[inherit]'
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                />
                <div
                  className='absolute inset-0 z-10'
                  style={{ pointerEvents: 'none' }}
                ></div>

                <motion.div
                  className='absolute inset-0 bg-black/30 rounded-[inherit]'
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            ) : (
              <div className='relative w-full h-full pointer-events-none rounded-[inherit]'>
                {/* SSR poster — LCP için anında boyanır, video yüklenince altında kalır */}
                {effectivePoster && (
                  <picture>
                    {posterSrcMobile && (
                      <source
                        media={MOBILE_MEDIA_QUERY}
                        srcSet={posterMobileSet ?? posterSrcMobile}
                        sizes={posterMobileSet ? POSTER_SIZES : undefined}
                      />
                    )}
                    <img
                      src={effectivePoster}
                      srcSet={posterSet}
                      sizes={posterSet ? POSTER_SIZES : undefined}
                      alt=''
                      aria-hidden
                      fetchPriority='high'
                      decoding='async'
                      className='absolute inset-0 w-full h-full object-cover rounded-[inherit]'
                    />
                  </picture>
                )}
                {/* Mobil video varsa tarayıcı ekran genişliğine göre doğru
                    kaynağı SSR'dan itibaren seçer — iki video birden inmez. */}
                <video
                  key={`${mediaSrcMobile ? 'responsive' : 'single'}-${loadVideo ? 'on' : 'off'}`}
                  src={!loadVideo || mediaSrcMobile ? undefined : mediaSrc}
                  // poster verilmez: kapak altta <picture> ile gösteriliyor;
                  // video poster'ı aynı görselin tam boyunu ikinci kez indirir.
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload={loadVideo ? 'auto' : 'none'}
                  className='relative w-full h-full object-cover rounded-[inherit]'
                  controls={false}
                  disablePictureInPicture
                  disableRemotePlayback
                >
                  {loadVideo && mediaSrcMobile && (
                    <>
                      <source media={MOBILE_MEDIA_QUERY} src={mediaSrcMobile} />
                      <source src={mediaSrc} />
                    </>
                  )}
                </video>
                <div
                  className='absolute inset-0 z-10'
                  style={{ pointerEvents: 'none' }}
                ></div>

                <motion.div
                  className='absolute inset-0 bg-black/30 rounded-[inherit]'
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            )
          ) : (
            <div className='relative w-full h-full rounded-[inherit]'>
              <Image
                src={mediaSrc}
                alt={title || 'Media content'}
                fill
                sizes="100vw"
                className={`object-cover rounded-[inherit]${mediaSrcMobile ? ' hidden md:block' : ''}`}
              />
              {mediaSrcMobile && (
                <Image
                  src={mediaSrcMobile}
                  alt={title || 'Media content'}
                  fill
                  sizes="100vw"
                  className='object-cover rounded-[inherit] md:hidden'
                />
              )}

              <motion.div
                className='absolute inset-0 bg-black/50 rounded-[inherit]'
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 0.7 - scrollProgress * 0.3 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}

          <div className='flex flex-col items-center text-center relative z-10 mt-4 transition-none'>
            {date && (
              <p
                className='text-2xl text-white/80'
                style={{ transform: `translateX(-${textTranslateX}vw)` }}
              >
                {date}
              </p>
            )}
            {scrollToExpand && (
              <p
                className='text-white/80 font-medium text-center tracking-wide'
                style={{ transform: `translateX(${textTranslateX}vw)` }}
              >
                {scrollToExpand}
              </p>
            )}
          </div>
        </div>

        {/* Centered title text */}
        <div
          className={`flex items-center justify-center text-center gap-4 w-full relative z-10 transition-none flex-col ${textBlend ? 'mix-blend-difference' : 'mix-blend-normal'
            }`}
        >
          <motion.h2
            className='font-display text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.55)] transition-none'
            style={{ transform: `translateX(-${textTranslateX}vw)` }}
          >
            {firstWord}
          </motion.h2>
          <motion.h2
            className='font-display text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-center text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.55)] transition-none'
            style={{ transform: `translateX(${textTranslateX}vw)` }}
          >
            {restOfTitle}
          </motion.h2>
        </div>

        {/* Animated scroll cue — fades out as the media expands */}
        <motion.div
          className='absolute bottom-8 left-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none'
          style={{ x: '-50%' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: Math.max(0, 1 - scrollProgress * 3) }}
          transition={{ duration: 0.2 }}
        >
          <span className='text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70'>
            Kaydır
          </span>
          {/* Saf CSS bounce — React 19 Strict Mode'da framer repeat:Infinity güvenilir değil */}
          <span
            className={`text-white/80${prefersReducedMotion ? '' : ' animate-bounce'}`}
          >
            <ChevronDown size={22} strokeWidth={2} />
          </span>
        </motion.div>
      </div>

      {/* Content Section below the card fold */}
      <motion.section
        className='flex flex-col w-full px-8 py-10 md:px-16 lg:py-20 relative z-20 bg-[var(--background)]'
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.7 }}
      >
        {children}
      </motion.section>
    </div>
  );
};

export default ScrollExpandMedia;
