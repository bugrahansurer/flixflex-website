import Link from "next/link"
import {
  ArrowUpRight,
  type LucideIcon,
  Search,
  Target,
  Film,
  LayoutGrid,
  PenTool,
  Clapperboard,
  Camera,
  FileText,
  MessageCircle,
  Video,
  TrendingUp,
  Shapes,
  BookOpen,
  Lightbulb,
  Layout,
  Monitor,
  Code2,
  Zap,
  Sparkles,
  Scissors,
  Globe,
  BarChart3,
  Palette,
  MessageSquare,
  Fingerprint,
} from "@/lib/icons"
import { cn } from "@/lib/utils"

// ── Icon lookup map ────────────────────────────────
export const ICON_MAP: Record<string, LucideIcon> = {
  Search,
  Target,
  Film,
  LayoutGrid,
  PenTool,
  Clapperboard,
  Camera,
  FileText,
  MessageCircle,
  Video,
  TrendingUp,
  Shapes,
  BookOpen,
  Lightbulb,
  Layout,
  Monitor,
  Code2,
  Zap,
  Sparkles,
  Scissors,
  Globe,
  BarChart3,
  Palette,
  MessageSquare,
  Fingerprint,
}

// ── Props ──────────────────────────────────────────
interface SubServiceRowProps {
  /** Lucide icon key (matches keys in ICON_MAP) */
  iconKey: string
  /** Display label */
  label: string
  /** Link target URL */
  href: string
}

// ── Component ──────────────────────────────────────
export function SubServiceRow({ iconKey, label, href }: SubServiceRowProps) {
  const Icon = ICON_MAP[iconKey] ?? Globe

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "group/link flex items-center justify-between gap-3 py-2.5",
          "text-[13px] font-semibold text-[var(--foreground)]",
          "transition-colors duration-200",
          "hover:text-[var(--ff-charcoal)]",
          "focus-visible:outline-[var(--ff-charcoal)] focus-visible:outline-2 focus-visible:outline-offset-2",
        )}
      >
        {/* Icon + label */}
        <span className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              "ff-shape-container flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              "bg-[var(--ff-charcoal)]",
              "text-[#0D0D0D]",
              "transition-colors duration-200",
            )}
          >
            <Icon size={15} strokeWidth={1.75} />
          </span>
          <span className="truncate">{label}</span>
        </span>

        {/* Arrow */}
        <ArrowUpRight
          size={14}
          strokeWidth={2}
          className={cn(
            "shrink-0 text-[var(--foreground-faint)]",
            "transition-all duration-200",
            "group-hover/link:text-[var(--ff-charcoal)]",
            "group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
          )}
        />
      </Link>
    </li>
  )
}
