<template>
  <div class="min-h-full">
    <nav-bar />
    <nuxt />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NavBar from '@/components/nav-bar'

export default {
  name: 'DefaultLayout',
  components: { NavBar },
  middleware: 'auth',
  async fetch () {
    await this.$store.dispatch('fetchDrivers')
    await this.$store.dispatch('bindRooms')
    await this.$store.dispatch('bindUsers')
  },
  computed: {
    ...mapGetters(['session'])
  }
}
</script>
