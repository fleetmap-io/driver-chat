<template>
  <div>
    <select-driver v-if="addDriver" @click="addRoom" @cancel="addDriver=false" />
    <vue-advanced-chat
      height="calc(100vh - 65px)"
      :current-user-id="currentUserId"
      :rooms="JSON.stringify(rooms)"
      :rooms-loaded="true"
      :messages="JSON.stringify(messages)"
      :messages-loaded="messagesLoaded"
      @send-message="$store.dispatch('sendMessage', $event.detail[0])"
      @fetch-messages="fetchMessages($event.detail[0])"
      @add-room="addDriver=true"
    />
  </div>
</template>

<script>
import { register } from 'vue-advanced-chat'
import { mapGetters } from 'vuex'
import SelectDriver from '@/components/select-driver'
register()

export default {
  name: 'IndexPage',
  components: { SelectDriver },
  data () {
    return {
      addDriver: false,
      currentUserId: '1234',
      messages: [],
      messagesLoaded: false
    }
  },
  async fetch () {
    await this.$store.dispatch('fetchDrivers')
    await this.$store.dispatch('bindRooms')
  },
  computed: {
    ...mapGetters(['drivers', 'rooms'])
  },
  methods: {
    addRoom (d) {
      this.$store.dispatch('addRoom', d)
      this.addDriver = false
    },
    async fetchMessages ({ room/*, options = {} */ }) {
      this.messages = []
      await this.$store.dispatch('unbindMessages')
      await this.$store.dispatch('bindMessages', room.roomId)
      this.messages = this.$store.getters.messages
      this.messagesLoaded = true
      /*
      if (options.reset) {
        this.messages = this.addMessages(room.roomId, true)
      } else {
        this.messages = [...this.addMessages(room.roomId), ...this.messages]
        this.messagesLoaded = true
      }
      // this.addNewMessage() */
    }
  }
}
</script>
