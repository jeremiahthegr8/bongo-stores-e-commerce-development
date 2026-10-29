import fs from 'node:fs'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).flatMap(line => {
    const divider = line.indexOf('=')
    if (divider < 1 || line.trimStart().startsWith('#')) return []
    const key = line.slice(0, divider).trim()
    const raw = line.slice(divider + 1).trim()
    return [[key, raw.replace(/^['"]|['"]$/g, '')]]
  }),
)

if (!getApps().length) initializeApp({
  credential: cert({
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
})

const localFile = 'public/images/bongo-matchday-jersey.png'
const destination = 'products/bongo-matchday-jersey.png'
const bucket = getStorage().bucket()
await bucket.upload(localFile, { destination, resumable: false, metadata: { contentType: 'image/png', cacheControl: 'public,max-age=31536000,immutable' } })
const [image] = await bucket.file(destination).getSignedUrl({ action: 'read', expires: '03-01-2500' })
await getFirestore().collection('products').doc('5').set({ image }, { merge: true })
console.log('Bongo jersey image uploaded and product catalogue updated.')
