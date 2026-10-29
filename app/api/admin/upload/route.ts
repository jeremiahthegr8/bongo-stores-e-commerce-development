import { NextRequest, NextResponse } from 'next/server'
import { adminStorage } from '@/lib/firebase-admin'
import { requestIsAdmin } from '@/lib/admin-session'

export async function POST(request: NextRequest) {
  if (!requestIsAdmin(request)) return NextResponse.json({ error: 'Owner access required.' }, { status: 401 })
  if (!adminStorage) return NextResponse.json({ error: 'Storage is not configured.' }, { status: 503 })
  const file = (await request.formData()).get('file')
  if (!(file instanceof File) || !file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Use an image up to 8 MB.' }, { status: 400 })
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const objectName = `products/${Date.now()}-${safeName}`
  const bucket = adminStorage.bucket()
  const object = bucket.file(objectName)
  await object.save(Buffer.from(await file.arrayBuffer()), { contentType: file.type, resumable: false })
  const [url] = await object.getSignedUrl({ action: 'read', expires: '03-01-2500' })
  return NextResponse.json({ url })
}
