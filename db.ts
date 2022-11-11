import * as dotenv from 'dotenv'
import admin from 'firebase-admin'
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import Image from './Image'
dotenv.config()

initializeApp({
  credential: admin.credential.cert('./rinkey.json')
})

const db = getFirestore()

async function add_images(guild_id: string, channel_id: string, images: Image[]) {
  const c = db.collection(`${guild_id}+${channel_id}`)
  images.forEach(async i => {
    const d = c.doc(i.message)
    await d.set(i)
  })
} 

export default {
  add_images: add_images
}