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
  async fetch () {
    await this.$store.dispatch('fetchSession')
    await this.$store.dispatch('fetchDrivers')
    await this.$store.dispatch('bindRooms')
  },
  computed: {
    ...mapGetters(['session'])
  }
}
</script>
