"use client"

// ═══════════════════════════════════════════════════════════
// FlixFlex — Sortable Canvas (dnd-kit)
// ═══════════════════════════════════════════════════════════

import * as React from "react"
import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVertical,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  HelpCircle,
} from "@/lib/icons"
import { cn } from "@/lib/utils"
import { usePageBuilder } from "@/store/page-builder"
import { useShallow } from "zustand/react/shallow"
import { SECTION_REGISTRY } from "@/lib/page-builder/section-registry"
import type { SectionBlock } from "@/types/page-builder"

const EMPTY_SECTIONS: SectionBlock[] = []

// ── Single sortable item ──────────────────────────
interface SortableItemProps {
  section: SectionBlock
  isSelected: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onToggle: (id: string) => void
}

function SortableItem({
  section,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggle,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const meta = SECTION_REGISTRY[section.type]
  const Icon = meta?.icon ?? HelpCircle

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 h-16 px-3 py-3",
        "transition-all duration-150 cursor-pointer",
        "select-none",
        isDragging && "opacity-30",
        isSelected
          ? "border-[#ff4fd8] bg-[#FF4FD8]/10"
          : "border-[#CCCCCC] bg-[#f7f7f5] hover:bg-[#FF4FD8]/10 hover:border-[#FF4FD8]/40",
        !section.visible && "opacity-50"
      )}
      onClick={() => onSelect(section.id)}
      role="button"
      tabIndex={0}
      aria-label={`Section: ${meta?.label ?? section.type}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect(section.id)
        }
      }}
    >
      {/* Drag handle */}
      <button
        className={cn(
          "shrink-0 w-5 h-5 flex items-center justify-center",
          "text-[#666666] hover:text-[#ff4fd8]",
          "cursor-grab active:cursor-grabbing",
          "focus:outline-none"
        )}
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        aria-label="Sürükle"
        tabIndex={0}
      >
        <GripVertical size={14} />
      </button>

      {/* Icon + label */}
      <span className="shrink-0 text-[#ff4fd8]">
        <Icon size={14} />
      </span>
      <span className="flex-1 min-w-0 text-[12px] font-medium text-[#333333] truncate">
        {meta?.label}
      </span>

      {/* Order badge */}
      <span className="shrink-0 text-[10px] text-[#666666] tabular-nums w-5 text-center">
        {section.order + 1}
      </span>

      {/* Actions — visible on hover / selected */}
      <div
        className={cn(
          "shrink-0 flex items-center gap-0.5",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggle(section.id)}
          title={section.visible ? "Gizle" : "Göster"}
          className="w-7 h-7 flex items-center justify-center text-[#666666] hover:text-[#ff4fd8] transition-colors"
        >
          {section.visible ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
        <button
          onClick={() => onDuplicate(section.id)}
          title="Kopyala"
          className="w-7 h-7 flex items-center justify-center text-[#666666] hover:text-[#ff4fd8] transition-colors"
        >
          <Copy size={13} />
        </button>
        <button
          onClick={() => onDelete(section.id)}
          title="Sil"
          className="w-7 h-7 flex items-center justify-center text-[#666666] hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Ghost overlay ─────────────────────────────────
function DragGhost({ section }: { section: SectionBlock }) {
  const meta = SECTION_REGISTRY[section.type]
  const Icon = meta?.icon ?? HelpCircle
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-3",
        "border border-[#ff4fd8] bg-[#ff4fd8]/0.12]",
        "shadow-[0_8px_32px_rgba(255, 79, 216,0.25)]",
        "w-72 opacity-90"
      )}
    >
      <GripVertical size={14} className="text-[#666666]" />
      <span className="text-[#ff4fd8]"><Icon size={14} /></span>
      <span className="text-[12px] font-medium text-[#333333]">
        {meta.label}
      </span>
    </div>
  )
}

// ── Main canvas ───────────────────────────────────
export function SortableCanvas() {
  // Scoped selectors — component only re-renders when these specific slices change
  const { page, selectedSectionId } = usePageBuilder(
    useShallow((s) => ({ page: s.page, selectedSectionId: s.selectedSectionId }))
  )
  const selectSection = usePageBuilder((s) => s.selectSection)
  const removeSection = usePageBuilder((s) => s.removeSection)
  const duplicateSection = usePageBuilder((s) => s.duplicateSection)
  const toggleSectionVisibility = usePageBuilder((s) => s.toggleSectionVisibility)
  const moveSection = usePageBuilder((s) => s.moveSection)

  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const sections = page?.sections ?? EMPTY_SECTIONS
  // Memoised sort — avoids a new array + comparisons on every render
  const sortedSections = React.useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections]
  )
  const activeSection = activeId
    ? sections.find((s) => s.id === activeId)
    : undefined

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const fromIdx = sortedSections.findIndex((s) => s.id === active.id)
    const toIdx = sortedSections.findIndex((s) => s.id === over.id)
    if (fromIdx !== -1 && toIdx !== -1) {
      moveSection(fromIdx, toIdx)
    }
  }

  if (sections.length === 0) {
    return (
      <div className="ff-shape-container flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--border)] text-center">
        <p className="text-[var(--foreground-faint)] text-sm">
          Sayfa boş — soldan bir section ekleyin
        </p>
        <p className="text-[var(--foreground-faint)] text-[11px] mt-1">
          veya sürükleyip bırakın
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedSections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col" role="list" aria-label="Sayfa bölümleri">
          {sortedSections.map((section) => (
            <SortableItem
              key={section.id}
              section={section}
              isSelected={selectedSectionId === section.id}
              onSelect={selectSection}
              onDelete={removeSection}
              onDuplicate={duplicateSection}
              onToggle={toggleSectionVisibility}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeSection && <DragGhost section={activeSection} />}
      </DragOverlay>
    </DndContext>
  )
}
