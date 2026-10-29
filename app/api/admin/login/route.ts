import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { createAdminSession, sessionName } from '@/lib/admin-session'

export async function POST(request: Request) {
  const expected = process.env.BONGO_ADMIN_PASSWORD
  const sessionSecret = process.env.SESSION_SECRET
  const { password } = await request.json()
  if (!expected || !sessionSecret || typeof password !== 'string') return NextResponse.json({ error: 'Owner login is unavailable.' }, { status: 503 })
  const provided = Buffer.from(password)
  const configured = Buffer.from(expected)
  if (provided.length !== configured.length || !timingSafeEqual(provided, configured)) return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })

  const response = NextResponse.json({ ok: true })
  response.cookies.set(sessionName, createAdminSession(sessionSecret), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 12, path: '/' })
  return response
}
