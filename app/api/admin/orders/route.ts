import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requestIsAdmin } from '@/lib/admin-session'

export async function GET(request: NextRequest) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: 'Owner access required.' }, { status: 401 })
  if (!adminDb) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 })
  const orders = (await adminDb.collection('orders').orderBy('createdAt', 'desc').get()).docs.map(document => document.data())
  return NextResponse.json({ orders })
}

export async function PATCH(request: NextRequest) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: 'Owner access required.' }, { status: 401 })
  if (!adminDb) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 })
  const { id, status } = await request.json()
  if (!id || !['Paid', 'Sourcing', 'Ready', 'Delivered'].includes(status)) return NextResponse.json({ error: 'Invalid order status.' }, { status: 400 })
  await adminDb.collection('orders').doc(id).update({ status, updatedAt: new Date().toISOString() })
  return NextResponse.json({ ok: true })
}
