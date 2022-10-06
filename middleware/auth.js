export default async function ({ store, redirect }) {
  try { await store.dispatch('fetchSession') } catch (e) { redirect('/login') }
}
