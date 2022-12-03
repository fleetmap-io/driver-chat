import { firestoreAction, vuexfireMutations } from 'vuexfire'
import { Auth } from '@aws-amplify/auth'
import { increment } from 'firebase/firestore'
const driverUrl = process.env.DRIVER_BACKEND_URL

export const state = () => ({
  session: null,
  drivers: [],
  messages: [],
  rooms: [],
  cognitoSession: null,
  loading: false,
  users: [],
  dispatchUsers: [],
  pushToken: ''
})

export const getters = {
  avatar: state => `https://ui-avatars.com/api/?size=300&name=${encodeURI(state.session && state.session.name)}`,
  users (state) { return state.users },
  dispatchUsers (state) { return state.dispatchUsers },
  loading (state) { return state.loading },
  session (state) { return state.session },
  drivers (state) { return state.drivers },
  messages (state) { return state.messages },
  rooms (state) { return state.rooms },
  cognitoSession (state) { return state.cognitoSession },
  pushToken (state) { return state.pushToken },
  user (state) { return state.session && state.session.id }
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
  },
  setPushToken (state, token) {
    state.pushToken = token
  }
}

export const actions = {
  clearUnread ({ state }, roomId) {
    return this.$fire.firestore.collection('rooms').doc(`${roomId}`).update({
      unreadCount: 0
    })
  },
  addPushToken: firestoreAction(function ({ getters, state }) {
    return this.$fire.firestore.collection('dispatchUsers').doc('' + getters.user).set({
      id: getters.user,
      email: state.session.email,
      pushToken: getters.pushToken,
      lastUpdate: new Date()
    })
  }),
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
    // const image = getters.avatar
    const image = getters.avatar
    await this.$fire.firestore.collection('rooms').doc(`${message.roomId}`).update({
      driverUnreadCount: increment(1),
      unreadCount: 0
    })
    return this.$axios.$post(driverUrl + '/messages', {
      android: {},
      notification: {
        title: state.session.name,
        body: message.content,
        image
      },
      token: state.users.find(u => u.id === room.users[0]._id).pushToken,
      data: { senderId: data.senderId }
    })
  }),
  async fetchSession ({ commit, dispatch }) {
    commit('setCognitoSession', await Auth.currentSession())
    commit('setSession', await this.$axios.$get('api/session'))
    commit('setPushToken', await this.$fire.messaging.getToken())
    await dispatch('addPushToken')
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
