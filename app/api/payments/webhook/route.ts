import { createHmac, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendOwnerOrderSms } from '@/lib/sms'

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  const raw = await request.text()
  const signature = request.headers.get('x-paystack-signature') || ''
  const expected = secret ? createHmac('sha512', secret).update(raw).digest('hex') : ''
  if (!secret || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 })
  }

  const event = JSON.parse(raw)
  if (event.event === 'charge.success' && adminDb) {
    const reference = event.data?.reference
    if (reference) {
      const ref = adminDb.collection('orders').doc(reference)
      const current = await ref.get()
      const previous = current.exists ? current.data() : undefined
      await ref.set({ payment: 'Paid', status: previous?.status === 'Delivered' || previous?.status === 'Ready' || previous?.status === 'Sourcing' ? previous.status : 'Paid', paidAt: new Date().toISOString(), paystackReference: reference }, { merge: true })
      if (previous?.payment !== 'Paid') void sendOwnerOrderSms({ reference, amount: event.data?.amount, customer: previous?.customer || event.data?.customer?.first_name })
    }
  }
  return NextResponse.json({ received: true })
}
