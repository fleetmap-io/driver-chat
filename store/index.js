export const state = () => ({
  session: null,
  drivers: []
})

export const getters = {
  session (state) { return state.session },
  drivers (state) { return state.drivers }
}

export const mutations = {
  setSession (state, session) {
    state.session = session
  },
  setDrivers (state, drivers) {
    state.drivers = drivers
  }
}

export const actions = {
  async fetchSession ({ commit }) {
    commit('setSession', await this.$axios.$get('/session'))
  },
  async fetchDrivers ({ commit }) {
    commit('setDrivers', await this.$axios.$get('/drivers'))
  }
}
