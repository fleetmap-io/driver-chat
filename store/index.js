import { firestoreAction, vuexfireMutations } from 'vuexfire'
import { Auth } from '@aws-amplify/auth'
const driverUrl = process.env.DRIVER_BACKEND_URL

export const state = () => ({
  session: null,
  drivers: [],
  messages: [],
  rooms: [],
  cognitoSession: null,
  loading: false,
  users: []
})

export const getters = {
  users (state) { return state.users },
  loading (state) { return state.loading },
  session (state) { return state.session },
  drivers (state) { return state.drivers },
  messages (state) { return state.messages },
  rooms (state) { return state.rooms },
  cognitoSession (state) { return state.cognitoSession }
}

export const mutations = {
  ...vuexfireMutations,
  setLoading (state, loading) {
    state.loading = loading
  },
  setCognitoSession (state, session) {
    state.cognitoSession = session
  },
  setSession (state, session) {
    state.session = session
  },
  setDrivers (state, drivers) {
    state.drivers = drivers
  }
}

export const actions = {
  async logout ({ commit }) {
    commit('setLoading', true)
    try {
      await this.$axios.$delete('api/session')
      await Auth.signOut()
      window.location.href = '/'
    } catch (e) {
      alert(e)
    }
    commit('setLoading', false)
  },
  async login ({ commit, getters, dispatch }, { username, password }) {
    const { signInUserSession } = await Auth.signIn(username, password)
    commit('setCognitoSession', signInUserSession)
    await this.$axios.$get('backend/api', {
      headers: {
        Authorization: `${getters.cognitoSession.accessToken.getJwtToken()}`
      }
    })
    await dispatch('fetchSession')
  },
  sendMessage: firestoreAction(async function ({ state, getters, dispatch }, message) {
    const data = {
      _id: new Date().getTime(),
      content: message.content,
      senderId: state.session.id + '',
      timestamp: new Date().toString().substring(16, 21),
      date: new Date().toLocaleDateString()
    }
    await this.$fire.firestore.collection(`rooms/${message.roomId}/messages`).add(data)
    const room = getters.rooms.find(r => r.roomId === message.roomId)
    return this.$axios.$post(driverUrl + '/messages', {
      notification: {
        title: state.session.name,
        body: message.content,
        click_action: 'http://localhost:8081'
      },
      webpush: {
        notification: {
          action: [
            {
              action: 'message',
              title: state.session.name
            }
          ]
        }
      },
      token: state.users.find(u => u.id === room.users[0]._id).pushToken,
      data: { senderId: data.senderId }
    })
  }),
  async fetchSession ({ commit }) {
    commit('setCognitoSession', await Auth.currentSession())
    commit('setSession', await this.$axios.$get('api/session'))
  },
  async fetchDrivers ({ commit }) {
    commit('setDrivers', await this.$axios.$get('api/drivers'))
  },
  bindMessages: firestoreAction(function ({ bindFirestoreRef }, roomId) {
    const db = this.$fire.firestore
    return bindFirestoreRef('messages', db.collection(`rooms/${roomId}/messages`).orderBy('_id'))
  }),
  bindUsers: firestoreAction(function ({
    bindFirestoreRef
  }) {
    return bindFirestoreRef('users', this.$fire.firestore.collection('users'))
  }),
  bindRooms: firestoreAction(function ({
    state,
    bindFirestoreRef
  }) {
    return bindFirestoreRef('rooms', this.$fire.firestore.collection('rooms')
      .where('roomId', 'in', state.drivers.map(d => `${d.uniqueId}_${state.session.id}`)))
  }),
  addRoom: firestoreAction(function ({ state }, driverId) {
    const d = state.drivers.find(d => d.id === driverId)
    const id = `${d.uniqueId}_${state.session.id}`
    return this.$fire.firestore.collection('rooms').doc(id).set({
      roomId: id,
      driverId: d.id,
      user: state.session.name,
      roomName: d.name,
      avatar: `https://ui-avatars.com/api/?name=${d.name}`,
      users: [
        {
          _id: d.uniqueId,
          username: d.name
        },
        {
          _id: state.session.id,
          username: state.session.name
        }
      ]
    })
  }),
  unbindMessages: firestoreAction(({ unbindFirestoreRef }) => {
    unbindFirestoreRef('messages')
  })
}
