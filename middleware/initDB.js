import { initDB } from '@/methods/idb.js'

export default async function ({ store, route, router, redirect }) {
  await initDB()
}