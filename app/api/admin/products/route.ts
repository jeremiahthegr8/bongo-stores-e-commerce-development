import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requestIsAdmin } from '@/lib/admin-session'

export async function GET() {
  if (!adminDb) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 })
  const products = (await adminDb.collection('products').get()).docs.map(document => document.data())
  return NextResponse.json({ products })
}

export async function PUT(request: NextRequest) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: 'Owner access required.' }, { status: 401 })
  if (!adminDb) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 })
  const product = await request.json()
  if (!Number.isFinite(product?.id) || !product?.name || !Array.isArray(product?.sizes) || typeof product?.stock !== 'object') return NextResponse.json({ error: 'Invalid product.' }, { status: 400 })
  await adminDb.collection('products').doc(String(product.id)).set(product)
  return NextResponse.json({ product })
}

export async function DELETE(request: NextRequest) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: 'Owner access required.' }, { status: 401 })
  if (!adminDb) return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 })
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Product id is required.' }, { status: 400 })
  await adminDb.collection('products').doc(id).delete()
  return NextResponse.json({ ok: true })
}
