"use client"

// ═══════════════════════════════════════════════════════════
// FFCursor — Premium multi-state custom cursor
//
// States:
//   default  → small dot + lagging gradient halo
//   hover    → halo expands + fills with brand gradient + label
//   click    → ripple burst on mousedown
//   text     → I-beam morph
//   drag     → crosshair morph
//
// data-cursor attribute on any element → custom label
// data-cursor-icon attribute           → icon character / emoji
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion"

// ── Types ─────────────────────────────────────────
type CursorState = "default" | "hover" | "text" | "drag" | "click"

interface CursorData {
  state: CursorState
  label: string
  icon: string
}

// ── Helpers ───────────────────────────────────────
function detectState(el: EventTarget | null): CursorData {
  const target = el as HTMLElement | null
  if (!target) return { state: "default", label: "", icon: "" }

  const closest = (sel: string) => target.closest(sel) as HTMLElement | null

  // Data attributes — walk up the tree
  const labelEl = target.getAttribute("data-cursor")
    ? target
    : (closest("[data-cursor]") ?? null)
  const label = labelEl?.getAttribute("data-cursor") ?? ""
  const icon  = labelEl?.getAttribute("data-cursor-icon") ?? ""

  // Text inputs → I-beam
  if (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.getAttribute("contenteditable") === "true" ||
    closest("[contenteditable='true']")
  ) return { state: "text", label, icon }

  // Drag targets
  if (
    target.getAttribute("draggable") === "true" ||
    closest("[draggable='true']")
  ) return { state: "drag", label, icon }

  // Hover — interactive elements
  if (
    target.tagName === "A" ||
    target.tagName === "BUTTON" ||
    target.tagName === "SELECT" ||
    target.getAttribute("role") === "button" ||
    target.getAttribute("role") === "link" ||
    target.getAttribute("role") === "tab" ||
    target.getAttribute("tabindex") !== null ||
    closest("a") ||
    closest("button") ||
    closest("[role='button']") ||
    closest("[data-cursor]")
  ) return { state: "hover", label, icon }

  return { state: "default", label: "", icon: "" }
}

// ── Component ─────────────────────────────────────
export function FFCursor() {
  // Raw mouse position (instant)
  const rawX = useMotionValue(-200)
  const rawY = useMotionValue(-200)

  // Lagging halo position (spring)
  const haloX = useSpring(rawX, { stiffness: 80, damping: 22, mass: 0.6 })
  const haloY = useSpring(rawY, { stiffness: 80, damping: 22, mass: 0.6 })

  const [cursor, setCursor] = React.useState<CursorData>({ state: "default", label: "", icon: "" })
  const [visible, setVisible] = React.useState(false)
  const [clicking, setClicking] = React.useState(false)
  const [clickPos, setClickPos] = React.useState({ x: -200, y: -200 })

  React.useEffect(() => {
    // Touch devices → bail out entirely
    if (window.matchMedia("(pointer: coarse)").matches) return

    // Hide native cursor globally
    document.documentElement.style.cursor = "none"

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
      setVisible(true)
      setCursor(detectState(e.target))
    }

    const onOver = (e: MouseEvent) => {
      setCursor(detectState(e.target))
    }

    const onDown = (e: MouseEvent) => {
      setClicking(true)
      setClickPos({ x: e.clientX, y: e.clientY })
      setTimeout(() => setClicking(false), 600)
    }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    window.addEventListener("mousemove", onMove,    { passive: true })
    window.addEventListener("mouseover", onOver,    { passive: true })
    window.addEventListener("mousedown", onDown,    { passive: true })
    document.addEventListener("mouseleave", onLeave, { passive: true })
    document.addEventListener("mouseenter", onEnter, { passive: true })

    return () => {
      document.documentElement.style.cursor = ""
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseover", onOver)
      window.removeEventListener("mousedown", onDown)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseenter", onEnter)
    }
  }, [rawX, rawY])

  // ── Derived values per state ───────────────────
  const isHover = cursor.state === "hover"
  const isText  = cursor.state === "text"
  const isDrag  = cursor.state === "drag"

  // Dot config
  const dotW = isText ? 2 : isDrag ? 10 : 6
  const dotH = isText ? 20 : isDrag ? 10 : 6
  const dotR = isText ? 1 : isDrag ? 0 : 9999

  // Halo config
  const haloSize  = isHover ? 56 : isText ? 36 : isDrag ? 48 : 36
  const haloAlpha = isHover ? 1 : 0.55

  const hasLabel = isHover && (cursor.label || cursor.icon)

  return (
    <>
      {/* ── Lagging halo ──────────────────────────── */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="halo"
            className="fixed top-0 left-0 pointer-events-none z-[9998]"
            style={{
              x: haloX,
              y: haloY,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{
                width: haloSize,
                height: haloSize,
                opacity: haloAlpha,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.5 }}
              style={{
                borderRadius: isText ? "2px" : "9999px",
                background: isHover
                  ? "conic-gradient(from 0deg, #FF4FD8, #D6FF3B, #FF4FD8)"
                  : "transparent",
                border: isHover
                  ? "none"
                  : "1.5px solid rgba(255,255,255,0.35)",
                boxShadow: isHover
                  ? "0 0 20px rgba(255,79,216,0.5), 0 0 40px rgba(214,255,59,0.2)"
                  : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Inner fill on hover — glassmorphism */}
              {isHover && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{
                    width: "calc(100% - 3px)",
                    height: "calc(100% - 3px)",
                    borderRadius: "9999px",
                    background: "rgba(12,12,12,0.75)",
                    backdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {/* Icon */}
                  {cursor.icon && (
                    <span style={{ fontSize: 16, lineHeight: 1 }}>{cursor.icon}</span>
                  )}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Magnetic dot (instant, on raw position) ── */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="dot"
            className="fixed top-0 left-0 pointer-events-none z-[9999]"
            style={{ x: rawX, y: rawY, translateX: "-50%", translateY: "-50%" }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              animate={{
                width: dotW,
                height: dotH,
                borderRadius: dotR,
                backgroundColor: isHover ? "#D6FF3B" : "#FF4FD8",
                boxShadow: isHover
                  ? "0 0 8px rgba(214,255,59,0.9)"
                  : "0 0 6px rgba(255,79,216,0.8)",
                rotate: isDrag ? 45 : 0,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Click ripple ──────────────────────────── */}
      <AnimatePresence>
        {clicking && (
          <motion.div
            key={`ripple-${clickPos.x}-${clickPos.y}`}
            className="fixed top-0 left-0 pointer-events-none z-[9997]"
            style={{
              x: clickPos.x,
              y: clickPos.y,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: 80, height: 80, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0.8, 0.4, 1] }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "9999px",
                border: "1.5px solid #FF4FD8",
                boxShadow: "0 0 12px rgba(255,79,216,0.6)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Label tooltip ─────────────────────────── */}
      <AnimatePresence>
        {visible && hasLabel && (
          <motion.div
            key="label"
            className="fixed top-0 left-0 pointer-events-none z-[9999]"
            style={{ x: rawX, y: rawY }}
            initial={{ opacity: 0, scale: 0.85, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.18 }}
          >
            <div
              style={{
                position: "absolute",
                top: 28,
                left: 16,
                whiteSpace: "nowrap",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#D6FF3B",
                background: "rgba(12,12,12,0.88)",
                padding: "4px 10px",
                border: "1px solid rgba(214,255,59,0.3)",
                backdropFilter: "blur(8px)",
                lineHeight: 1.5,
              }}
            >
              {cursor.label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
