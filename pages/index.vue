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
      messages: [],
      messagesLoaded: false
    }
  },
  computed: {
    ...mapGetters(['drivers', 'rooms', 'session']),
    currentUserId () { return this.session && this.session.id + '' }
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
