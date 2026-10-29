import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendOwnerOrderSms } from '@/lib/sms'

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference')
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!reference || !secret) return NextResponse.json({ error: 'Invalid payment verification request.' }, { status: 400 })

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store',
  })
  const payload = await response.json()
  if (!response.ok || !payload.status || payload.data?.status !== 'success' || payload.data?.reference !== reference) {
    return NextResponse.json({ error: 'Payment has not been completed.' }, { status: 402 })
  }

  let order: Record<string, unknown> = { id: reference, total: payload.data.amount / 100, payment: 'Paid', status: 'Paid' }
  if (adminDb) {
    const ref = adminDb.collection('orders').doc(reference)
    const snapshot = await ref.get()
    const existing = snapshot.exists ? snapshot.data() || {} : {}
    const wasPaid = existing.payment === 'Paid'
    order = { ...existing, payment: 'Paid', status: existing.status === 'Delivered' || existing.status === 'Ready' || existing.status === 'Sourcing' ? existing.status : 'Paid', paidAt: new Date().toISOString(), paystackReference: reference }
    await ref.set(order, { merge: true })
    if (!wasPaid) void sendOwnerOrderSms({ reference, amount: payload.data.amount, customer: typeof existing.customer === 'string' ? existing.customer : undefined })
  }
  return NextResponse.json({ status: true, order })
}
