import { firestoreAction, vuexfireMutations } from 'vuexfire'

export const state = () => ({
  session: null,
  drivers: [],
  messages: []
})

export const getters = {
  session (state) { return state.session },
  drivers (state) { return state.drivers },
  messages (state) { return state.messages }
}

export const mutations = {
  ...vuexfireMutations,
  setSession (state, session) {
    state.session = session
  },
  setDrivers (state, drivers) {
    state.drivers = drivers
  }
}

export const actions = {
  sendMessage: firestoreAction(function ({ state }, message) {
    return this.$fire.firestore.collection('messages').add({
      _id: new Date().getTime(),
      content: message.content,
      senderId: state.session.id,
      timestamp: new Date().toString().substring(16, 21),
      date: new Date().toLocaleDateString()
    })
  }),
  async fetchSession ({ commit }) {
    commit('setSession', await this.$axios.$get('/session'))
  },
  async fetchDrivers ({ commit }) {
    commit('setDrivers', await this.$axios.$get('/drivers'))
  },
  fetchMessages: firestoreAction(function ({ bindFirestoreRef }) {
    // return the promise returned by `bindFirestoreRef`
    const db = this.$fire.firestore
    return bindFirestoreRef('messages', db.collection('messages').orderBy('_id'))
  })
}
