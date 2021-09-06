export default async function ({ store, route, router, redirect }) {
  // Get API Path
  await store.dispatch('Setting/getSetting')
}