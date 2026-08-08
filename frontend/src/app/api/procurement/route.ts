import { NextRequest, NextResponse } from 'next/server'

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

async function table(name: string, query = 'select=*') {
  if (!url || !key) throw new Error('Supabase environment variables are missing')
  const response = await fetch(`${url}/rest/v1/${name}?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`${name}: ${response.status} ${await response.text()}`)
  return response.json()
}

const num = (value: unknown) => Number(value || 0)

export async function GET(request: NextRequest) {
  try {
    const view = request.nextUrl.searchParams.get('view') || 'dashboard'
    const [notices, suppliers, inventory, orders, alternatives, contracts, penalties, pos] = await Promise.all([
      table('disruption_notices', 'select=*&order=received_at.desc&limit=100'),
      table('suppliers', 'select=*'),
      table('inventory_positions', 'select=*'),
      table('customer_orders', 'select=*'),
      table('alternative_suppliers', 'select=*'),
      table('contracts', 'select=*'),
      table('penalties', 'select=*'),
      table('purchase_order_headers', 'select=*'),
    ])

    const supplierMap = new Map(suppliers.map((s: any) => [String(s.id), s]))
    const cases = notices.map((notice: any) => {
      const itemInventory = inventory.filter((row: any) => row.item_number === notice.item_number)
      const itemOrders = orders.filter((row: any) => row.item_number === notice.item_number && row.status !== 'Closed')
      const onHand = itemInventory.reduce((sum: number, row: any) => sum + num(row.on_hand_qty), 0)
      const committed = itemInventory.reduce((sum: number, row: any) => sum + num(row.committed_qty), 0)
      const demand = itemOrders.reduce((sum: number, row: any) => sum + num(row.qty), 0)
      const shortfall = Math.max(0, demand + committed - onHand)
      const supplier = supplierMap.get(String(notice.supplier_id)) as any
      return { ...notice, supplier_name: supplier?.name || `Supplier ${notice.supplier_id}`, on_hand: onHand, demand, shortfall }
    })

    if (view === 'workbench') {
      const active = cases.find((c: any) => c.notice_id === 'DN-5000') || cases[0]
      const supplierContracts = contracts.filter((c: any) => String(c.supplier_id) === String(active?.supplier_id))
      const contractIds = new Set(supplierContracts.map((c: any) => String(c.id)))
      return NextResponse.json({
        case: active,
        alternatives: alternatives.filter((a: any) => a.item_number === active?.item_number),
        inventory: inventory.filter((i: any) => i.item_number === active?.item_number),
        orders: orders.filter((o: any) => o.item_number === active?.item_number),
        contracts: supplierContracts,
        penalties: penalties.filter((p: any) => contractIds.has(String(p.contract_id))),
      })
    }

    if (view === 'health') {
      return NextResponse.json({ systems: [
        { name: 'Supabase', status: 'Healthy', detail: `${notices.length} notices · ${suppliers.length} suppliers`, category: 'System of record' },
        { name: 'Supervity Auto', status: process.env.SUPERVITY_WORKFLOW_URL ? 'Configured' : 'Needs configuration', detail: 'Procurement Exception Commander', category: 'Agent platform' },
        { name: 'Human Workbench', status: 'Healthy', detail: 'Approval decisions and audit trail', category: 'Human-in-the-loop' },
      ], lastChecked: new Date().toISOString() })
    }

    const stock = inventory.reduce((sum: number, row: any) => sum + num(row.on_hand_qty), 0)
    const committed = inventory.reduce((sum: number, row: any) => sum + num(row.committed_qty), 0)
    const openPOValue = pos.filter((p: any) => !['Closed', 'Cancelled'].includes(p.status)).reduce((sum: number, p: any) => sum + num(p.po_total), 0)
    return NextResponse.json({
      metrics: { openExceptions: cases.length, critical: cases.filter((c: any) => ['HIGH', 'CRITICAL'].includes(String(c.severity).toUpperCase())).length, availableInventory: stock - committed, openPOValue },
      cases: cases.slice(0, 8),
      insights: {
        inactiveSuppliers: suppliers.filter((s: any) => String(s.status).toLowerCase() !== 'active').length,
        soleSource: suppliers.filter((s: any) => s.x_sole_source === true).length,
        constrainedItems: cases.filter((c: any) => c.shortfall > 0).length,
        alternativeCoverage: new Set(alternatives.map((a: any) => a.item_number)).size,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
