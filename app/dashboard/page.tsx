'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { STATUS_COLORS } from '@/lib/constants'

// ── Types ────────────────────────────────────────────────────────────────────

type DemandEntry = {
  id: string
  requestor_name: string
  business_unit: string
  need_type: string
  modality: string
  audience_size: number
  complexity: string
  leap_eligible: boolean
  desired_delivery_date: string
  quarter_target: string
  estimated_effort_hours: number
  status: string
  agent_notes: string
}

type CapacityEntry = {
  id: string
  business_unit: string
  quarter: string
  available_hours: number
  allocated_hours: number
}

const ALL_BUS = [
  'R&D',
  'Commercialization',
  'Leadership Development',
  'Product Supply',
  'Corporate Functions',
]

const TABS = ['Holistic View', ...ALL_BUS]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCurrentQuarter(): string {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `Q${q} ${now.getFullYear()}`
}

function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str
}

// ── Dashboard Page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [entries, setEntries] = useState<DemandEntry[]>([])
  const [capacity, setCapacity] = useState<CapacityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Holistic View')
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  const currentQ = getCurrentQuarter()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [{ data: demandData }, { data: capData }] = await Promise.all([
        supabase
          .from('demand_entries')
          .select('*')
          .not('status', 'eq', 'Archived')
          .order('created_at', { ascending: false }),
        supabase.from('capacity').select('*'),
      ])
      setEntries((demandData as DemandEntry[]) ?? [])
      setCapacity((capData as CapacityEntry[]) ?? [])
      setLoading(false)
    }
    fetchData()
  }, [])

  // ── KPI Calculations ────────────────────────────────────────────────────────

  const activeRequests = entries.length

  const currentQCapacity = capacity
    .filter((c) => c.quarter === currentQ)
    .reduce((sum, c) => sum + (c.available_hours ?? 0), 0)

  const currentQAllocated = capacity
    .filter((c) => c.quarter === currentQ)
    .reduce((sum, c) => sum + (c.allocated_hours ?? 0), 0)

  const utilization =
    currentQCapacity > 0
      ? Math.round((currentQAllocated / currentQCapacity) * 100)
      : 0

  const utilizationColor =
    utilization >= 90
      ? 'text-red-500'
      : utilization >= 70
      ? 'text-amber-500'
      : 'text-green-500'

  // ── Chart Data ───────────────────────────────────────────────────────────────

  const holisticChartData = ALL_BUS.map((bu) => {
    const demand = entries
      .filter((e) => e.business_unit === bu)
      .reduce((sum, e) => sum + (e.estimated_effort_hours ?? 0), 0)
    const cap =
      capacity
        .filter((c) => c.business_unit === bu && c.quarter === currentQ)
        .reduce((sum, c) => sum + (c.available_hours ?? 0), 0)
    return { bu: bu.replace(' ', '\n'), demand, capacity: cap }
  })

  const singleBuChartData =
    activeTab !== 'Holistic View'
      ? [
          {
            bu: activeTab,
            demand: entries
              .filter((e) => e.business_unit === activeTab)
              .reduce((sum, e) => sum + (e.estimated_effort_hours ?? 0), 0),
            capacity: capacity
              .filter((c) => c.business_unit === activeTab && c.quarter === currentQ)
              .reduce((sum, c) => sum + (c.available_hours ?? 0), 0),
          },
        ]
      : []

  // ── Filtered Table Rows ──────────────────────────────────────────────────────

  const visibleEntries =
    activeTab === 'Holistic View'
      ? entries
      : entries.filter((e) => e.business_unit === activeTab)

  // ── Export to CSV ─────────────────────────────────────────────────────────────

  function exportToCSV() {
    const headers = [
      'Requestor', 'Business Unit', 'Need Type', 'Modality', 'Audience Size',
      'Complexity', 'LEAP Eligible', 'Delivery Date', 'Quarter', 'Est. Units',
      'Status', 'Agent Notes'
    ]
    const rows = visibleEntries.map((e) => [
      e.requestor_name,
      e.business_unit,
      e.need_type,
      e.modality,
      e.audience_size,
      e.complexity,
      e.leap_eligible ? 'Yes' : 'No',
      e.desired_delivery_date,
      e.quarter_target ?? '',
      e.estimated_effort_hours ?? '',
      e.status,
      `"${(e.agent_notes ?? '').replace(/"/g, '""')}"`,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leap-requests-${activeTab.replace(/\s+/g, '-').toLowerCase()}-${currentQ.replace(' ', '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Toggle Note Expand ───────────────────────────────────────────────────────

  function toggleNote(id: string) {
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold text-[#1A1A2E] hover:text-[#8B1FA8] transition-colors duration-200 flex items-center gap-1"
        >
          ← <img src="/logo.png" alt="LEAP" className="h-6 w-auto inline-block ml-1" />
        </Link>
        <span className="text-sm text-gray-500 font-medium">Dashboard</span>
        <Link
          href="/new-entry"
          className="bg-[#8B1FA8] text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#6a177f] transition-all duration-200"
        >
          ＋ New Request
        </Link>
      </header>

      {/* KPI Strip */}
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Active Requests */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">
              Active Requests
            </p>
            <p className="text-4xl font-bold text-[#1A1A2E]">
              {loading ? '—' : activeRequests}
            </p>
            <p className="text-xs text-gray-400 mt-1">Across all BUs</p>
          </div>

          {/* Available Capacity */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">
              Available Capacity
            </p>
            <p className="text-4xl font-bold text-[#1A1A2E]">
              {loading ? '—' : currentQCapacity}
              <span className="text-lg font-normal text-gray-400 ml-1">units</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">{currentQ}</p>
          </div>

          {/* Allocated Units */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">
              Allocated Units
            </p>
            <p className="text-4xl font-bold text-[#1A1A2E]">
              {loading ? '—' : currentQAllocated}
              <span className="text-lg font-normal text-gray-400 ml-1">units</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">{currentQ}</p>
          </div>

          {/* Utilization */}
          <div className="bg-gray-50 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">
              Utilization
            </p>
            <p className={`text-4xl font-bold ${loading ? 'text-[#1A1A2E]' : utilizationColor}`}>
              {loading ? '—' : `${utilization}%`}
            </p>
            <p className="text-xs text-gray-400 mt-1">{currentQ}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-16">
        {/* View Toggle */}
        <div className="mb-6 overflow-x-auto">
          <div className="inline-flex bg-gray-100 rounded-full p-1 gap-1 whitespace-nowrap">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm transition-all duration-200 rounded-full ${
                  activeTab === tab
                    ? 'bg-white shadow-sm text-[#8B1FA8] font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
            {activeTab === 'Holistic View'
              ? 'Demand vs Capacity — All Business Units'
              : `Demand vs Capacity — ${activeTab}`}
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={activeTab === 'Holistic View' ? holisticChartData : singleBuChartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              barCategoryGap="30%"
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="bu"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
              <Bar dataKey="demand" name="Demand (units)" fill="#8B1FA8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="capacity" name="Capacity (units)" fill="#1A1A2E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
              {activeTab === 'Holistic View' ? 'All Active Requests' : `${activeTab} Requests`}
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="text-sm font-medium text-[#8B1FA8] border border-[#8B1FA8] rounded-full px-4 py-1.5 hover:bg-[#8B1FA8] hover:text-white transition-all duration-200"
              >
                ↓ Export to Excel
              </button>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">
              {loading ? '—' : `${visibleEntries.length} requests`}
            </span>
            </div>
          </div>

          {/* Empty State */}
          {!loading && visibleEntries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-4xl">📭</span>
              <p className="text-base font-semibold text-gray-700">No active requests</p>
              <p className="text-sm text-gray-400">Submit a new request to get started.</p>
              <Link
                href="/new-entry"
                className="mt-2 bg-[#8B1FA8] text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-[#6a177f] transition-all duration-200"
              >
                ＋ New Request
              </Link>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="px-6 py-8 text-center text-sm text-gray-400">Loading…</div>
          )}

          {/* Table */}
          {!loading && visibleEntries.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {[
                      'Requestor',
                      'Need Type',
                      'Modality',
                      'Audience',
                      'Complexity',
                      'LEAP',
                      'Delivery Date',
                      'Quarter',
                      'Est. Units',
                      'Status',
                      'Notes',
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleEntries.map((entry) => {
                    const isExpanded = expandedNotes.has(entry.id)
                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                          {entry.requestor_name}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {entry.need_type}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {entry.modality}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-center">
                          {entry.audience_size}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {entry.complexity}
                        </td>
                        <td className="px-4 py-3">
                          {entry.leap_eligible ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8B1FA8]/10 text-[#8B1FA8]">
                              LEAP
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                              Internal
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {entry.desired_delivery_date
                            ? new Date(entry.desired_delivery_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {entry.quarter_target ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-center font-medium">
                          {entry.estimated_effort_hours ?? '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              STATUS_COLORS[entry.status] ?? 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs">
                          {entry.agent_notes ? (
                            <span>
                              {isExpanded
                                ? entry.agent_notes
                                : truncate(entry.agent_notes, 60)}
                              {entry.agent_notes.length > 60 && (
                                <button
                                  onClick={() => toggleNote(entry.id)}
                                  className="ml-1 text-[#8B1FA8] text-xs font-medium hover:underline focus:outline-none"
                                >
                                  {isExpanded ? 'less' : 'more'}
                                </button>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
