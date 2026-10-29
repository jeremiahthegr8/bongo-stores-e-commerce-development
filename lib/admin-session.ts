import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

const sessionName = 'bongo_owner_session'

function signature(secret: string) {
  return createHmac('sha256', secret).update('bongo-owner-v1').digest('hex')
}

export function createAdminSession(secret: string) {
  return signature(secret)
}

export function validAdminSession(value: string | undefined, secret = process.env.SESSION_SECRET) {
  if (!value || !secret) return false
  const expected = signature(secret)
  return value.length === expected.length && timingSafeEqual(Buffer.from(value), Buffer.from(expected))
}

export function requestIsAdmin(request: NextRequest) {
  return validAdminSession(request.cookies.get(sessionName)?.value)
}

export { sessionName }
