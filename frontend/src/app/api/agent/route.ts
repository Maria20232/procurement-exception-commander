import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const workflowUrl = process.env.SUPERVITY_WORKFLOW_URL
  if (!workflowUrl) return NextResponse.json({ error: 'Set SUPERVITY_WORKFLOW_URL before running the agent.' }, { status: 503 })
  const { noticeId } = await request.json()
  if (!noticeId) return NextResponse.json({ error: 'A disruption notice ID is required.' }, { status: 400 })
  try {
    const response = await fetch(workflowUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(process.env.SUPERVITY_API_KEY ? { Authorization: `Bearer ${process.env.SUPERVITY_API_KEY}` } : {}) },
      body: JSON.stringify({ disruption_notice_id: noticeId }),
    })
    const body = await response.text()
    if (!response.ok) return NextResponse.json({ error: body || `Supervity returned ${response.status}` }, { status: response.status })
    try { return NextResponse.json(JSON.parse(body)) } catch { return NextResponse.json({ status: 'started', result: body }) }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Agent request failed' }, { status: 502 })
  }
}
