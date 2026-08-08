'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, AlertTriangle, Boxes, CircleDollarSign, Play, ShieldCheck } from 'lucide-react'

const money = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0)

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [noticeId, setNoticeId] = useState('DN-5000')
  const [runState, setRunState] = useState('')
  useEffect(() => { fetch('/api/procurement').then(r => r.json()).then(d => d.error ? setError(d.error) : setData(d)).catch(e => setError(e.message)) }, [])
  async function runAgent() {
    setRunState('Starting…')
    const res = await fetch('/api/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ noticeId }) })
    const body = await res.json(); setRunState(res.ok ? 'Agent started successfully' : body.error)
  }
  if (error) return <SetupError error={error} />
  if (!data) return <div className='p-8 text-brand-muted'>Loading live procurement data…</div>
  const cards = [
    ['Open exceptions', data.metrics.openExceptions, AlertTriangle, 'text-amber-600'],
    ['Critical cases', data.metrics.critical, ShieldCheck, 'text-red-600'],
    ['Available inventory', data.metrics.availableInventory.toLocaleString(), Boxes, 'text-blue-600'],
    ['Open PO value', money(data.metrics.openPOValue), CircleDollarSign, 'text-emerald-600'],
  ]
  return <div className='mx-auto w-full max-w-7xl space-y-7'>
    <section className='flex flex-col justify-between gap-5 lg:flex-row lg:items-end'>
      <div><p className='mb-2 text-xs font-semibold uppercase tracking-[.24em] text-brand-cornflower'>Procurement Exception Commander</p><h1 className='text-4xl text-brand-navy'>Live Operations Command Center</h1><p className='mt-2 text-brand-muted'>Detect, investigate, approve, and resolve supply disruptions from one interface.</p></div>
      <div className='flex gap-2 rounded-2xl border bg-white p-2 shadow-sm'><input value={noticeId} onChange={e => setNoticeId(e.target.value)} className='w-36 rounded-xl border px-3 text-sm' aria-label='Disruption notice ID'/><button onClick={runAgent} className='flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-sm font-semibold text-white'><Play className='h-4 w-4'/>Run agent</button></div>
    </section>
    {runState && <div className='rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900'>{runState}</div>}
    <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>{cards.map(([label,value,Icon,color]: any) => <div key={label} className='rounded-2xl border bg-white p-5 shadow-sm'><div className='flex items-center justify-between'><span className='text-sm text-brand-muted'>{label}</span><Icon className={`h-5 w-5 ${color}`}/></div><p className='mt-4 text-3xl font-semibold text-brand-navy'>{value}</p></div>)}</section>
    <section className='grid gap-5 xl:grid-cols-[1fr_320px]'>
      <div className='overflow-hidden rounded-2xl border bg-white shadow-sm'><div className='flex items-center justify-between border-b p-5'><div><h2 className='text-xl'>Live exception queue</h2><p className='text-sm text-brand-muted'>Evidence pulled from Supabase</p></div><Link href='/workbench' className='text-sm font-semibold text-brand-purple'>Open Workbench →</Link></div><div className='overflow-x-auto'><table className='w-full text-left text-sm'><thead className='bg-slate-50 text-xs uppercase text-brand-muted'><tr><th className='px-5 py-3'>Notice</th><th>Supplier / Item</th><th>Severity</th><th>Shortfall</th><th>Received</th></tr></thead><tbody>{data.cases.map((c:any)=><tr key={c.id} className='border-t'><td className='px-5 py-4 font-semibold'>{c.notice_id}</td><td><p>{c.supplier_name}</p><p className='text-xs text-brand-muted'>{c.item_number}</p></td><td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${['HIGH','CRITICAL'].includes(String(c.severity).toUpperCase())?'bg-red-50 text-red-700':'bg-amber-50 text-amber-700'}`}>{c.severity || 'Unscored'}</span></td><td>{c.shortfall.toLocaleString()} units</td><td>{c.received_at ? new Date(c.received_at).toLocaleDateString() : '—'}</td></tr>)}</tbody></table></div></div>
      <div className='rounded-2xl bg-brand-navy p-5 text-white shadow-lg'><div className='flex items-center gap-2'><Activity className='h-5 w-5 text-brand-cornflower'/><h2 className='text-xl'>Agent workforce</h2></div><p className='mt-1 text-sm text-white/60'>8 operators ready</p><div className='mt-5 space-y-3'>{['Notice Extractor','Impact Assessor','Alternative Sourcer','Inventory Reallocator','Contract Checker','Cost Analyst','Orchestrator','Recovery Recommender'].map((name,i)=><div key={name} className='flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-sm'><span>{name}</span><span className={`h-2.5 w-2.5 rounded-full ${i<6?'bg-emerald-400':'bg-blue-400'}`}/></div>)}</div></div>
    </section>
  </div>
}

function SetupError({error}:{error:string}) { return <div className='mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-7'><h1 className='text-2xl'>Connect Supabase to load the dashboard</h1><p className='mt-2 text-sm text-amber-900'>{error}</p><pre className='mt-5 overflow-x-auto rounded-xl bg-brand-navy p-4 text-xs text-white'>SUPABASE_URL=https://your-project.supabase.co{`\n`}SUPABASE_ANON_KEY=your-key</pre></div> }
