import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

function adminApp() {
  if (getApps().length) return getApps()[0]
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!projectId || !clientEmail || !privateKey) return null
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET })
}

const app = adminApp()
export const adminDb = app ? getFirestore(app) : null
export const adminStorage = app ? getStorage(app) : null
