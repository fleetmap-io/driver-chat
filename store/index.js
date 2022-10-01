import { firestoreAction, vuexfireMutations } from 'vuexfire'

export const state = () => ({
  session: null,
  drivers: [],
  messages: [],
  rooms: []
})

export const getters = {
  session (state) { return state.session },
  drivers (state) { return state.drivers },
  messages (state) { return state.messages },
  rooms (state) { return state.rooms }
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
    const db = this.$fire.firestore
    return bindFirestoreRef('messages', db.collection('messages').orderBy('_id'))
  }),
  bindRooms: firestoreAction(function ({
    state,
    bindFirestoreRef
  }) {
    return bindFirestoreRef('rooms', this.$fire.firestore.collection('rooms')
      .where('roomId', 'in', state.drivers.map(d => `${d.id}_${state.session.id}`)))
  }),
  addRoom: firestoreAction(function ({ state }, driverId) {
    const d = state.drivers.find(d => d.id === driverId)
    return this.$fire.firestore.collection('rooms').add({
      roomId: `${d.id}_${state.session.id}`,
      driverId: d.id,
      roomName: d.name,
      avatar: `https://ui-avatars.com/api/?name=${d.name}`,
      users: [
        {
          _id: d.id,
          username: d.name
        },
        {
          _id: state.session.id,
          username: state.session.name
        }
      ]
    })
  })
}
