import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a demand planning agent for the LEAP learning program at Bristol Myers Squibb.
Your job is to review incoming learning demand requests and produce a structured assessment.

For each request, you must:
1. Confirm or correct LEAP eligibility (LEAP handles scalable, repeatable digital learning; internal handles bespoke, one-off, or facilitated content)
2. Estimate design and development effort in hours using these benchmarks:
   - Small eLearning (<1hr): 40–80 hrs D&D
   - Medium eLearning (1–4hr): 80–200 hrs D&D
   - Large eLearning (4hr+): 200–400 hrs D&D
   - ILT/VILT (per day): 40–60 hrs D&D
   - Job Aid: 8–20 hrs D&D
   - Curriculum: sum of components + 20% coordination overhead
3. Assign a recommended quarter target based on desired delivery date and complexity
4. Assign a status of "In Review"
5. Write brief agent notes explaining your reasoning and any flags or risks

Respond ONLY in JSON with this structure:
{
  "leap_eligible_confirmed": boolean,
  "estimated_effort_hours": number,
  "quarter_target": string,
  "status": "In Review",
  "agent_notes": string
}`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { entry } = body

    if (!entry || !entry.id) {
      return NextResponse.json({ error: 'Missing entry or entry id' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(entry),
        },
      ],
    })

    const rawContent = message.content[0]
    if (rawContent.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic API')
    }

    // Strip markdown code fences if present
    const text = rawContent.text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(text)

    const { error: updateError } = await supabase
      .from('demand_entries')
      .update({
        leap_eligible_confirmed: parsed.leap_eligible_confirmed,
        estimated_effort_hours: parsed.estimated_effort_hours,
        quarter_target: parsed.quarter_target,
        status: parsed.status,
        agent_notes: parsed.agent_notes,
      })
      .eq('id', entry.id)

    if (updateError) {
      throw new Error(`Supabase update failed: ${updateError.message}`)
    }

    return NextResponse.json(parsed)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
