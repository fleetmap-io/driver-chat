export default async function ({ store, redirect }) {
  try {
    await store.dispatch('fetchSession')
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    redirect('/login')
  }
}
