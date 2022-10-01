<template>
  <div style="padding: 20px; width: 500px">
    <label style="padding-right: 5px" for="drivers">Seleccione conductor:</label>
    <select id="drivers" v-model="driver" name="drivers">
      <option
        v-for="_driver in drivers.filter(d => !rooms.find(r => r.driverId === d.id))"
        :key="_driver.id"
        :value="_driver.id"
      >
        {{ _driver.name }}
      </option>
    </select>
    <button type="submit" class="justify-center rounded-md border border-transparent bg-indigo-600 py-1 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" @click="$emit('click', driver)">
      OK
    </button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'SelectDriver',
  data () {
    return {
      driver: ''
    }
  },
  computed: {
    ...mapGetters(['drivers', 'rooms'])
  }
}
</script>
