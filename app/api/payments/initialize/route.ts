import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return NextResponse.json({ error: 'Payment service is not configured.' }, { status: 503 })

  const body = await request.json()
  const { email, amount, reference, callbackUrl, metadata } = body
  if (!email || !Number.isInteger(amount) || amount < 100 || !reference || !callbackUrl) {
    return NextResponse.json({ error: 'Invalid payment request.' }, { status: 400 })
  }

  const order = metadata?.order
  if (!order || order.id !== reference || !Array.isArray(order.items) || order.total * 100 !== amount) {
    return NextResponse.json({ error: 'Invalid order details.' }, { status: 400 })
  }
  if (adminDb) await adminDb.collection('orders').doc(reference).set({ ...order, payment: 'Pending', paystackReference: reference, createdAt: new Date().toISOString() }, { merge: true })

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount, currency: 'GHS', reference, callback_url: callbackUrl, channels: ['mobile_money', 'card'], metadata }),
    })
    const payload = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: payload.message || 'Paystack could not start this payment.' }, { status: 502 })
    }
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json({ error: 'Could not reach Paystack. Please try again shortly.' }, { status: 502 })
  }
}
