'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  BUSINESS_UNITS,
  NEED_TYPES,
  MODALITIES,
  COMPLEXITIES,
  PRIORITIES,
  STATUS_COLORS,
} from '@/lib/constants'

type AgentResult = {
  leap_eligible_confirmed: boolean
  estimated_effort_hours: number
  quarter_target: string
  status: string
  agent_notes: string
}

type FormState = {
  requestor_name: string
  requestor_email: string
  business_unit: string
  type_of_need: string
  description: string
  learner_count: string
  desired_delivery_date: string
  priority: string
  delivery_modality: string
  complexity: string
  leap_eligible: boolean | null
}

const initialForm: FormState = {
  requestor_name: '',
  requestor_email: '',
  business_unit: '',
  type_of_need: '',
  description: '',
  learner_count: '',
  desired_delivery_date: '',
  priority: '',
  delivery_modality: '',
  complexity: '',
  leap_eligible: null,
}

export default function NewEntryPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AgentResult | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleLeapToggle(value: boolean | null) {
    setForm((prev) => ({ ...prev, leap_eligible: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Determine leap_eligible value: Yes=true, No=false, Unsure=true
      const leapValue = form.leap_eligible === false ? false : true

      const entryPayload = {
        requestor_name: form.requestor_name,
        requestor_email: form.requestor_email,
        business_unit: form.business_unit,
        need_type: form.type_of_need,
        description: form.description,
        audience_size: parseInt(form.learner_count, 10),
        desired_delivery_date: form.desired_delivery_date,
        priority: form.priority,
        modality: form.delivery_modality,
        complexity: form.complexity,
        leap_eligible: leapValue,
        status: 'Submitted',
      }

      const { data: inserted, error: insertError } = await supabase
        .from('demand_entries')
        .insert(entryPayload)
        .select()
        .single()

      if (insertError) throw new Error(insertError.message)

      const res = await fetch('/api/process-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry: inserted }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Agent processing failed')
      }

      const agentResult: AgentResult = await res.json()
      setResult(agentResult)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setForm(initialForm)
    setResult(null)
    setError(null)
  }

  const leapOptions: { label: string; value: boolean | null }[] = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
    { label: 'Unsure', value: null },
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold text-[#1A1A2E] hover:text-[#CC0066] transition-colors duration-200 flex items-center gap-1"
        >
          ← <img src="/logo.png" alt="LEAP" className="h-6 w-auto inline-block ml-1" />
        </Link>
        <span className="text-sm text-gray-500 font-medium">New Request</span>
        <div className="w-16" />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Submit a Learning Request</h1>
          <p className="text-gray-500 mt-1 text-sm">
            All fields are required. Your request will be reviewed by the LEAP planning agent.
          </p>
        </div>

        {/* Success / Confirmation Card */}
        {result && !loading && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold text-gray-900">Request Processed</span>
              <span
                className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  STATUS_COLORS[result.status] ?? 'bg-gray-100 text-gray-700'
                }`}
              >
                {result.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Estimated Effort
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {result.estimated_effort_hours}
                  <span className="text-sm font-normal text-gray-500 ml-1">units</span>
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Quarter Target
                </p>
                <p className="text-2xl font-bold text-gray-900">{result.quarter_target}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">LEAP Eligible</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  result.leap_eligible_confirmed
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {result.leap_eligible_confirmed ? 'Confirmed Eligible' : 'Not Eligible'}
              </span>
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Agent Notes</p>
              <p className="text-sm text-gray-700 leading-relaxed">{result.agent_notes}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-[#CC0066] hover:bg-[#a3004f] text-white text-sm font-medium py-2.5 px-4 rounded-full transition-all duration-200"
              >
                Submit another request
              </button>
              <Link
                href="/dashboard"
                className="flex-1 text-center border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium py-2.5 px-4 rounded-full transition-all duration-200"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 text-center">
            <div className="flex justify-center mb-4">
              <svg
                className="animate-spin h-8 w-8 text-[#CC0066]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">
              Our planning agent is reviewing your request&hellip;
            </p>
            <p className="text-gray-400 text-sm mt-1">This usually takes a few seconds.</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Form */}
        {!result && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm p-6 space-y-5"
          >
            {/* Requestor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requestor Name
              </label>
              <input
                type="text"
                name="requestor_name"
                required
                value={form.requestor_name}
                onChange={handleChange}
                placeholder="Jane Smith"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC0066] focus:border-transparent"
              />
            </div>

            {/* Requestor Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requestor Email
              </label>
              <input
                type="email"
                name="requestor_email"
                required
                value={form.requestor_email}
                onChange={handleChange}
                placeholder="jane.smith@bms.com"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC0066] focus:border-transparent"
              />
            </div>

            {/* Business Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Unit
              </label>
              <select
                name="business_unit"
                required
                value={form.business_unit}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#CC0066] focus:border-transparent bg-white"
              >
                <option value="">Select a business unit</option>
                {BUSINESS_UNITS.map((bu) => (
                  <option key={bu} value={bu}>
                    {bu}
                  </option>
                ))}
              </select>
            </div>

            {/* Type of Need */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of Need
              </label>
              <select
                name="type_of_need"
                required
                value={form.type_of_need}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#CC0066] focus:border-transparent bg-white"
              >
                <option value="">Select type of need</option>
                {NEED_TYPES.map((nt) => (
                  <option key={nt} value={nt}>
                    {nt}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description of Learning Need
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the learning need, audience, and any relevant context…"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC0066] focus:border-transparent resize-none"
              />
            </div>

            {/* Learner Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience / Learner Count
              </label>
              <input
                type="number"
                name="learner_count"
                required
                min={1}
                value={form.learner_count}
                onChange={handleChange}
                placeholder="e.g. 250"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC0066] focus:border-transparent"
              />
            </div>

            {/* Desired Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desired Delivery Date
              </label>
              <input
                type="date"
                name="desired_delivery_date"
                required
                value={form.desired_delivery_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#CC0066] focus:border-transparent"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                required
                value={form.priority}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#CC0066] focus:border-transparent bg-white"
              >
                <option value="">Select priority</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Modality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Modality
              </label>
              <select
                name="delivery_modality"
                required
                value={form.delivery_modality}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#CC0066] focus:border-transparent bg-white"
              >
                <option value="">Select modality</option>
                {MODALITIES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Complexity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complexity / Size
              </label>
              <select
                name="complexity"
                required
                value={form.complexity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#CC0066] focus:border-transparent bg-white"
              >
                <option value="">Select complexity</option>
                {COMPLEXITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* LEAP Eligible Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LEAP Eligible?
              </label>
              <div className="flex rounded-full border border-gray-300 overflow-hidden w-fit">
                {leapOptions.map((opt) => {
                  const isSelected =
                    opt.label === 'Yes'
                      ? form.leap_eligible === true
                      : opt.label === 'No'
                      ? form.leap_eligible === false
                      : form.leap_eligible === null

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleLeapToggle(opt.value)}
                      className={`px-5 py-2 text-sm font-medium transition-all duration-200 focus:outline-none ${
                        isSelected
                          ? 'bg-[#CC0066] text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      } border-r border-gray-300 last:border-r-0`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              {form.leap_eligible === null && (
                <p className="text-xs text-gray-400 mt-1">
                  &ldquo;Unsure&rdquo; will be treated as eligible for agent review.
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#CC0066] hover:bg-[#a3004f] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-full transition-all duration-200 text-sm"
              >
                {loading ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
