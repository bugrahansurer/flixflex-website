"use client"

import React, { useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { sanitizeHtml } from "@/lib/sanitize"

/**
 * Renders the 3D poem animation hero section.
 */
export interface PoemAnimationProps {
  poemHTML: string
  backgroundImageUrl: string
  boyImageUrl: string
}

export const PoemAnimation: React.FC<PoemAnimationProps> = ({
  poemHTML,
  backgroundImageUrl,
  boyImageUrl,
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  // Sanitize once; the markup is mirrored across six cube faces.
  const safePoem = useMemo(() => sanitizeHtml(poemHTML), [poemHTML])

  // This effect handles the responsive scaling of the animation container.
  useEffect(() => {
    function adjustContentSize() {
      if (contentRef.current) {
        const viewportWidth = window.innerWidth
        const baseWidth = 1000
        const scaleFactor =
          viewportWidth < baseWidth ? (viewportWidth / baseWidth) * 0.9 : 1
        contentRef.current.style.transform = `scale(${scaleFactor})`
      }
    }

    adjustContentSize()
    window.addEventListener("resize", adjustContentSize)
    return () => window.removeEventListener("resize", adjustContentSize)
  }, [])

  return (
    <header className="poem-animation-hero hero-section">
      <div className="container">
        <div
          ref={contentRef}
          className="content"
          style={{ display: "block", width: "1000px", height: "562px" }}
        >
          <div className="container-full">
            <div className="animated hue"></div>
            {backgroundImageUrl && (
              <div className="backgroundImage" style={{ position: "absolute", inset: 0 }}>
                <Image
                  src={backgroundImageUrl}
                  alt="An old stone courtyard at dawn"
                  fill
                  sizes="1000px"
                  className="object-cover"
                  onError={(e) => {
                    ; (e.target as HTMLElement).style.display = "none"
                  }}
                />
              </div>
            )}
            {boyImageUrl && (
              <div className="boyImage" style={{ position: "absolute", inset: 0 }}>
                <Image
                  src={boyImageUrl}
                  alt="A man and woman practicing with swords"
                  fill
                  sizes="1000px"
                  className="object-cover"
                  onError={(e) => {
                    ; (e.target as HTMLElement).style.display = "none"
                  }}
                />
              </div>
            )}

            <div className="container">
              <div className="cube">
                <div className="face top"></div>
                <div className="face bottom"></div>
                <div
                  className="face left text"
                  dangerouslySetInnerHTML={{ __html: safePoem }}
                ></div>
                <div
                  className="face right text"
                  dangerouslySetInnerHTML={{ __html: safePoem }}
                ></div>
                <div className="face front"></div>
                <div
                  className="face back text"
                  dangerouslySetInnerHTML={{ __html: safePoem }}
                ></div>
              </div>
            </div>

            <div className="container-reflect">
              <div className="cube">
                <div className="face top"></div>
                <div className="face bottom"></div>
                <div
                  className="face left text"
                  dangerouslySetInnerHTML={{ __html: safePoem }}
                ></div>
                <div
                  className="face right text"
                  dangerouslySetInnerHTML={{ __html: safePoem }}
                ></div>
                <div className="face front"></div>
                <div
                  className="face back text"
                  dangerouslySetInnerHTML={{ __html: safePoem }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
