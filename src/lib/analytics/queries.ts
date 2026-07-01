// ═══════════════════════════════════════════════════════════
// FlixFlex — Analytics aggregation queries
//
// All figures come from our first-party `page_views` table + real
// content models. Powers the admin dashboard and the reports page.
//
// CONNECTION DISCIPLINE: the production DB (direct Prisma Postgres
// connection) has a low connection cap, so queries are COMBINED into
// as few statements as possible and run in small concurrency batches
// (≤4 at a time) — never a wide fan-out that could exhaust the pool.
// Time boundaries use server time (UTC on Vercel).
// ═══════════════════════════════════════════════════════════

import prisma from "@/lib/prisma"

// ── Date helpers ───────────────────────────────────────────
function startOfDay(d = new Date()): Date {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x
}
function startOfMonth(d = new Date()): Date {
  const x = new Date(d); x.setDate(1); x.setHours(0, 0, 0, 0); return x
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d); x.setDate(x.getDate() + n); return x
}
function isoDay(d: Date): string { return d.toISOString().slice(0, 10) }

// Hosts that are really us / local — collapsed into "Doğrudan".
const INTERNAL_HOST_RE = /(localhost|127\.0\.0\.1|vercel\.app|flixflex)/i

function pct(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0
  return Math.round(((curr - prev) / prev) * 100)
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════

export interface DashboardData {
  visits: {
    today: number; todayDelta: number
    month: number; monthDelta: number
    uniqueMonth: number; avgDurationSec: number; activeNow: number
  }
  content: {
    posts: number; pages: number; portfolio: number; services: number
    appointments: number; messages: number; users: number
  }
  trend: { date: string; count: number }[]
  topPages: { path: string; count: number }[]
  recent: {
    id: string; action: string; resource: string
    userName: string; initials: string; createdAt: string
  }[]
}

const EMPTY_DASH: DashboardData = {
  visits: { today: 0, todayDelta: 0, month: 0, monthDelta: 0, uniqueMonth: 0, avgDurationSec: 0, activeNow: 0 },
  content: { posts: 0, pages: 0, portfolio: 0, services: 0, appointments: 0, messages: 0, users: 0 },
  trend: [], topPages: [], recent: [],
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!prisma) return EMPTY_DASH

  try {
  const now = new Date()
  const todayStart = startOfDay(now)
  const yesterdayStart = addDays(todayStart, -1)
  const monthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(addDays(monthStart, -1))
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000)
  const trendStart = addDays(todayStart, -13)

  // ── Batch 1 (3 concurrent): visit metrics + content counts + trend ──
  const [visitRows, contentRows, trendRows] = await Promise.all([
    prisma.$queryRaw<{
      today: number; yday: number; month: number; lastmonth: number
      uniquemonth: number; avgdur: number; activenow: number
    }[]>`
      SELECT
        COUNT(*) FILTER (WHERE "createdAt" >= ${todayStart})::int AS today,
        COUNT(*) FILTER (WHERE "createdAt" >= ${yesterdayStart} AND "createdAt" < ${todayStart})::int AS yday,
        COUNT(*) FILTER (WHERE "createdAt" >= ${monthStart})::int AS month,
        COUNT(*) FILTER (WHERE "createdAt" >= ${lastMonthStart} AND "createdAt" < ${monthStart})::int AS lastmonth,
        COUNT(DISTINCT "visitorId") FILTER (WHERE "createdAt" >= ${monthStart})::int AS uniquemonth,
        COALESCE(AVG("duration") FILTER (WHERE "createdAt" >= ${monthStart} AND "duration" > 0), 0)::float AS avgdur,
        COUNT(DISTINCT "sessionId") FILTER (WHERE "createdAt" >= ${fiveMinAgo})::int AS activenow
      FROM page_views
      WHERE "createdAt" >= ${lastMonthStart}`,
    prisma.$queryRaw<{
      posts: number; pages: number; portfolio: number; services: number
      appointments: number; messages: number; users: number
    }[]>`
      SELECT
        (SELECT COUNT(*)::int FROM blog_posts WHERE status = 'published') AS posts,
        (SELECT COUNT(*)::int FROM pages WHERE "isPublished" = true) AS pages,
        (SELECT COUNT(*)::int FROM portfolio_items WHERE "isPublished" = true) AS portfolio,
        (SELECT COUNT(*)::int FROM services WHERE "isPublished" = true) AS services,
        (SELECT COUNT(*)::int FROM appointments) AS appointments,
        (SELECT COUNT(*)::int FROM contact_submissions) AS messages,
        (SELECT COUNT(*)::int FROM users WHERE "isActive" = true) AS users`,
    prisma.$queryRaw<{ day: Date; count: number }[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
      FROM page_views WHERE "createdAt" >= ${trendStart}
      GROUP BY day ORDER BY day ASC`,
  ])

  // ── Batch 2 (2 concurrent): top pages + recent activity ──
  const [topPagesGrouped, recentLogs] = await Promise.all([
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: addDays(todayStart, -29) } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 6,
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true, username: true } } },
    }),
  ])

  const v = visitRows[0] ?? { today: 0, yday: 0, month: 0, lastmonth: 0, uniquemonth: 0, avgdur: 0, activenow: 0 }
  const c = contentRows[0] ?? { posts: 0, pages: 0, portfolio: 0, services: 0, appointments: 0, messages: 0, users: 0 }

  // Dense 14-day trend (fill gaps).
  const trendMap = new Map(trendRows.map((r) => [isoDay(new Date(r.day)), Number(r.count)]))
  const trend: { date: string; count: number }[] = []
  for (let i = 0; i < 14; i++) {
    const d = addDays(trendStart, i)
    trend.push({ date: isoDay(d), count: trendMap.get(isoDay(d)) ?? 0 })
  }

  const initialsOf = (name?: string | null) =>
    (name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?"

  return {
    visits: {
      today: v.today,
      todayDelta: pct(v.today, v.yday),
      month: v.month,
      monthDelta: pct(v.month, v.lastmonth),
      uniqueMonth: v.uniquemonth,
      avgDurationSec: Math.round((v.avgdur ?? 0) / 1000),
      activeNow: v.activenow,
    },
    content: c,
    trend,
    topPages: topPagesGrouped.map((g) => ({ path: g.path, count: g._count.path })),
    recent: recentLogs.map((l) => ({
      id: l.id,
      action: l.action,
      resource: l.resource,
      userName: l.user?.name || l.user?.username || "Sistem",
      initials: initialsOf(l.user?.name || l.user?.username),
      createdAt: l.createdAt.toISOString(),
    })),
  }
  } catch (err) {
    console.error("[getDashboardData] DB erişilemedi, boş veri döndürülüyor:", err)
    return EMPTY_DASH
  }
}

// ═══════════════════════════════════════════════════════════
// LIVE (polled by the integrations page to prove tracking works)
// ═══════════════════════════════════════════════════════════

export interface LiveStats { activeNow: number; todayViews: number; todayVisitors: number }

export async function getLiveStats(): Promise<LiveStats> {
  const empty = { activeNow: 0, todayViews: 0, todayVisitors: 0 }
  if (!prisma) return empty
  try {
    const todayStart = startOfDay()
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    // Single combined query — one connection.
    const rows = await prisma.$queryRaw<{ active: number; views: number; visitors: number }[]>`
      SELECT
        COUNT(DISTINCT "sessionId") FILTER (WHERE "createdAt" >= ${fiveMinAgo})::int AS active,
        COUNT(*) FILTER (WHERE "createdAt" >= ${todayStart})::int AS views,
        COUNT(DISTINCT "visitorId") FILTER (WHERE "createdAt" >= ${todayStart})::int AS visitors
      FROM page_views
      WHERE "createdAt" >= ${todayStart} OR "createdAt" >= ${fiveMinAgo}`
    const r = rows[0] ?? { active: 0, views: 0, visitors: 0 }
    return { activeNow: r.active, todayViews: r.views, todayVisitors: r.visitors }
  } catch {
    return empty
  }
}

// ═══════════════════════════════════════════════════════════
// REPORTS (date-range)
// ═══════════════════════════════════════════════════════════

export interface ReportData {
  range: { from: string; to: string; days: number }
  summary: {
    views: number; uniqueVisitors: number; sessions: number
    avgDurationSec: number; viewsPerSession: number; bounceRate: number
  }
  deltas: { views: number; uniqueVisitors: number; sessions: number; avgDuration: number }
  daily: { date: string; views: number; visitors: number }[]
  topPages: { path: string; views: number; avgDurationSec: number }[]
  referrers: { source: string; count: number }[]
  devices: { device: string; count: number }[]
  browsers: { browser: string; count: number }[]
  countries: { country: string; count: number }[]
}

interface RangeMetrics { views: number; uniques: number; sessions: number; avgSec: number; bounceRate: number }

// All five scalar metrics for a window in ONE query.
async function rangeMetrics(from: Date, to: Date): Promise<RangeMetrics> {
  if (!prisma) return { views: 0, uniques: 0, sessions: 0, avgSec: 0, bounceRate: 0 }
  const rows = await prisma.$queryRaw<{
    views: number; uniques: number; sessions: number; avg: number; bounce: number
  }[]>`
    SELECT
      COUNT(*)::int AS views,
      COUNT(DISTINCT "visitorId")::int AS uniques,
      COUNT(DISTINCT "sessionId")::int AS sessions,
      COALESCE(AVG("duration") FILTER (WHERE "duration" > 0), 0)::float AS avg,
      (SELECT COUNT(*)::int FROM (
        SELECT "sessionId" FROM page_views
        WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
        GROUP BY "sessionId" HAVING COUNT(*) = 1
      ) b) AS bounce
    FROM page_views
    WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}`
  const r = rows[0] ?? { views: 0, uniques: 0, sessions: 0, avg: 0, bounce: 0 }
  return {
    views: r.views,
    uniques: r.uniques,
    sessions: r.sessions,
    avgSec: Math.round((r.avg ?? 0) / 1000),
    bounceRate: r.sessions > 0 ? Math.round((r.bounce / r.sessions) * 100) : 0,
  }
}

export async function getReportData(fromInput: Date, toInput: Date): Promise<ReportData> {
  const from = startOfDay(fromInput)
  const to = new Date(toInput); to.setHours(23, 59, 59, 999)
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)))
  const prevTo = new Date(from.getTime() - 1)
  const prevFrom = addDays(from, -days)

  const empty: ReportData = {
    range: { from: isoDay(from), to: isoDay(to), days },
    summary: { views: 0, uniqueVisitors: 0, sessions: 0, avgDurationSec: 0, viewsPerSession: 0, bounceRate: 0 },
    deltas: { views: 0, uniqueVisitors: 0, sessions: 0, avgDuration: 0 },
    daily: [], topPages: [], referrers: [], devices: [], browsers: [], countries: [],
  }
  if (!prisma) return empty

  try {
  // ── Batch 1 (4 concurrent): curr + prev metrics + daily + top pages ──
  const [curr, prev, dailyRows, pageRows] = await Promise.all([
    rangeMetrics(from, to),
    rangeMetrics(prevFrom, prevTo),
    prisma.$queryRaw<{ day: Date; views: number; visitors: number }[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS views, COUNT(DISTINCT "visitorId")::int AS visitors
      FROM page_views WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
      GROUP BY day ORDER BY day ASC`,
    prisma.$queryRaw<{ path: string; views: number; avg: number }[]>`
      SELECT "path", COUNT(*)::int AS views, COALESCE(AVG(NULLIF("duration", 0)), 0)::float AS avg
      FROM page_views WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
      GROUP BY "path" ORDER BY views DESC LIMIT 20`,
  ])

  // ── Batch 2 (4 concurrent): referrers + devices + browsers + countries ──
  const [refRows, devRows, browserRows, countryRows] = await Promise.all([
    prisma.$queryRaw<{ source: string | null; count: number }[]>`
      SELECT substring("referrer" from '^https?://([^/]+)') AS source, COUNT(*)::int AS count
      FROM page_views WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
      GROUP BY source ORDER BY count DESC LIMIT 20`,
    prisma.$queryRaw<{ device: string | null; count: number }[]>`
      SELECT "device", COUNT(*)::int AS count FROM page_views
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
      GROUP BY "device" ORDER BY count DESC`,
    prisma.$queryRaw<{ browser: string | null; count: number }[]>`
      SELECT "browser", COUNT(*)::int AS count FROM page_views
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
      GROUP BY "browser" ORDER BY count DESC LIMIT 8`,
    prisma.$queryRaw<{ country: string | null; count: number }[]>`
      SELECT "country", COUNT(*)::int AS count FROM page_views
      WHERE "createdAt" >= ${from} AND "createdAt" <= ${to} AND "country" IS NOT NULL
      GROUP BY "country" ORDER BY count DESC LIMIT 12`,
  ])

  // Dense daily series (fill gaps).
  const dViews = new Map(dailyRows.map((r) => [isoDay(new Date(r.day)), Number(r.views)]))
  const dVis = new Map(dailyRows.map((r) => [isoDay(new Date(r.day)), Number(r.visitors)]))
  const daily: { date: string; views: number; visitors: number }[] = []
  for (let i = 0; i <= days; i++) {
    const d = addDays(from, i)
    if (d > to) break
    const key = isoDay(d)
    daily.push({ date: key, views: dViews.get(key) ?? 0, visitors: dVis.get(key) ?? 0 })
  }

  // Collapse internal referrers into "Doğrudan".
  const refAgg = new Map<string, number>()
  for (const r of refRows) {
    const host = r.source && !INTERNAL_HOST_RE.test(r.source) ? r.source : "Doğrudan"
    refAgg.set(host, (refAgg.get(host) ?? 0) + Number(r.count))
  }
  const referrers = [...refAgg.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)

  return {
    range: { from: isoDay(from), to: isoDay(to), days },
    summary: {
      views: curr.views,
      uniqueVisitors: curr.uniques,
      sessions: curr.sessions,
      avgDurationSec: curr.avgSec,
      viewsPerSession: curr.sessions > 0 ? Math.round((curr.views / curr.sessions) * 10) / 10 : 0,
      bounceRate: curr.bounceRate,
    },
    deltas: {
      views: pct(curr.views, prev.views),
      uniqueVisitors: pct(curr.uniques, prev.uniques),
      sessions: pct(curr.sessions, prev.sessions),
      avgDuration: pct(curr.avgSec, prev.avgSec),
    },
    daily,
    topPages: pageRows.map((r) => ({ path: r.path, views: Number(r.views), avgDurationSec: Math.round((r.avg ?? 0) / 1000) })),
    referrers,
    devices: devRows.map((r) => ({ device: r.device || "Bilinmiyor", count: Number(r.count) })),
    browsers: browserRows.map((r) => ({ browser: r.browser || "Bilinmiyor", count: Number(r.count) })),
    countries: countryRows.map((r) => ({ country: r.country || "??", count: Number(r.count) })),
  }
  } catch (err) {
    console.error("[getReportData] DB erişilemedi, boş rapor döndürülüyor:", err)
    return empty
  }
}
