"use client";

import React, { useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

export interface WovenLightHeroProps {
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

// --- Main Hero Component ---
export const WovenLightHero = ({
  headline = "Markaları Domine Eder",
  subheadline = "Kurumsal Markalamadan Dijital Dönüşüme, İkonik Markalardan Sektör Devlerine kadar her ölçekte işletmeyi dijital çağda güçlendiriyoruz.",
  ctaLabel = "Keşfet",
  ctaHref = "/explore"
}: WovenLightHeroProps) => {
  const textControls = useAnimation();
  const buttonControls = useAnimation();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Add a more elegant font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    if (!prefersReducedMotion) {
      textControls.start(i => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.1 + 1.5,
          duration: 1.2,
          ease: [0.2, 0.65, 0.3, 0.9]
        }
      }));
      buttonControls.start({
        opacity: 1,
        transition: { delay: 2.5, duration: 1 }
      });
    } else {
      // Skip animation — show immediately
      textControls.set({ opacity: 1, y: 0 });
      buttonControls.set({ opacity: 1 });
    }

    return () => {
      try {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      } catch (e) {
        console.warn("Could not remove font stylesheet link:", e);
      }
    }
  }, [textControls, buttonControls, prefersReducedMotion]);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black dark:bg-background">
      <WovenCanvas prefersReducedMotion={prefersReducedMotion} />
      <HeroNav />
      <div className="relative z-10 text-center px-4">
        <h1 className="text-6xl md:text-8xl text-foreground dark:text-foreground" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 0 50px rgba(255, 255, 255, 0.3)' }}>
          {headline.split(" ").map((word, i) => (
            <span key={i} className="inline-block">
              {word.split("").map((char, j) => (
                <motion.span key={j} custom={i * 5 + j} initial={{ opacity: 0, y: 50 }} animate={textControls} style={{ display: 'inline-block' }}>
                  {char}
                </motion.span>
              ))}
              {i < headline.split(" ").length - 1 && <span>&nbsp;</span>}
            </span>
          ))}
        </h1>
        <motion.p
          custom={headline.length}
          initial={{ opacity: 0, y: 30 }}
          animate={textControls}
          className="mx-auto mt-6 max-w-xl text-md text-foreground-dim dark:text-foreground-dim"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {subheadline}
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={buttonControls} className="mt-10">
          <a
            href={ctaHref}
            className="inline-block rounded-full border-2 border-[var(--ff-purple)]/20 bg-[var(--ff-purple)]/10 px-8 py-3 font-semibold text-[var(--ff-purple)] backdrop-blur-sm transition-all hover:bg-[var(--ff-purple)]/20 dark:border-[var(--ff-purple)]/20 dark:bg-[var(--ff-purple)]/10 dark:text-[var(--ff-purple)] dark:hover:bg-[var(--ff-purple)]/20"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {ctaLabel}
          </a>
        </motion.div>
      </div>
    </div>
  );
};

// --- Navigation Component ---
const HeroNav = () => {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 1, duration: 1 } }}
      className="absolute top-0 left-0 right-0 z-20 p-6"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
      </div>
    </motion.nav>
  );
};

// --- Three.js Canvas Component ---
const WovenCanvas = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Reduced motion: skip Three.js entirely, show static gradient fallback
    if (prefersReducedMotion) return;

    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio to 2 for performance
    currentMount.appendChild(renderer.domElement);

    const mouse = new THREE.Vector2(0, 0);
    const clock = new THREE.Clock();

    const isDarkMode = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // --- Woven Silk ---
    const particleCount = 50000;
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    const torusKnot = new THREE.TorusKnotGeometry(1.5, 0.5, 200, 32);

    for (let i = 0; i < particleCount; i++) {
      const vertexIndex = i % torusKnot.attributes.position.count;
      const x = torusKnot.attributes.position.getX(vertexIndex);
      const y = torusKnot.attributes.position.getY(vertexIndex);
      const z = torusKnot.attributes.position.getZ(vertexIndex);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.8, isDarkMode ? 0.5 : 0.7);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      blending: isDarkMode ? THREE.NormalBlending : THREE.AdditiveBlending,
      transparent: true,
      opacity: isDarkMode ? 1.0 : 0.8,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ── Pre-allocated reusable vectors (no per-frame `new THREE.Vector3`) ──
    const mouseWorld = new THREE.Vector3();
    const currentPos = new THREE.Vector3();
    const originalPos = new THREE.Vector3();
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const returnForce = new THREE.Vector3();

    let animationFrameId: number;

    const animate = () => {
      // Do not schedule the next frame while the tab is hidden —
      // handleVisibilityChange will call animate() once when it becomes
      // visible again. Without this guard, the previous code scheduled a
      // new frame BEFORE the document.hidden check, so returning early still
      // kept the loop alive; a second animate() call from handleVisibilityChange
      // then produced two concurrent rAF loops.
      if (document.hidden) return;

      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Reuse pre-allocated vector — no heap allocation per frame
      mouseWorld.set(mouse.x * 3, mouse.y * 3, 0);

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        // In-place updates — no new THREE.Vector3() calls
        currentPos.set(positions[ix], positions[iy], positions[iz]);
        originalPos.set(originalPositions[ix], originalPositions[iy], originalPositions[iz]);
        velocity.set(velocities[ix], velocities[iy], velocities[iz]);

        const dist = currentPos.distanceTo(mouseWorld);
        if (dist < 1.5) {
          const force = (1.5 - dist) * 0.01;
          direction.subVectors(currentPos, mouseWorld).normalize();
          velocity.addScaledVector(direction, force);
        }

        // Return to original position (in-place)
        returnForce.subVectors(originalPos, currentPos).multiplyScalar(0.001);
        velocity.add(returnForce);

        // Damping
        velocity.multiplyScalar(0.95);

        positions[ix] += velocity.x;
        positions[iy] += velocity.y;
        positions[iz] += velocity.z;

        velocities[ix] = velocity.x;
        velocities[iy] = velocity.y;
        velocities[iz] = velocity.z;
      }
      geometry.attributes.position.needsUpdate = true;

      points.rotation.y = elapsedTime * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    // ── Pause/resume on tab visibility ──────────────────────────────────
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Clean up Three.js resources
      try {
        if (currentMount && renderer.domElement && currentMount.contains(renderer.domElement)) {
          currentMount.removeChild(renderer.domElement);
        }
      } catch (e) {
        console.warn("Could not remove renderer domElement:", e);
      }

      geometry.dispose();
      torusKnot.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [prefersReducedMotion]);

  // Reduced-motion fallback: static gradient that matches the dark canvas aesthetic
  if (prefersReducedMotion) {
    return (
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(161,52,255,0.15) 0%, rgba(0,0,0,0.9) 60%, #000 100%)',
        }}
        aria-hidden
      />
    );
  }

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};
