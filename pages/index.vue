<template>
  <div>
    <vue-advanced-chat
      height="calc(100vh - 65px)"
      :current-user-id="currentUserId"
      :rooms="JSON.stringify(rooms)"
      :rooms-loaded="true"
      :messages="JSON.stringify(messages)"
      :messages-loaded="messagesLoaded"
      @send-message="$store.dispatch('sendMessage', $event.detail[0])"
      @fetch-messages="fetchMessages($event.detail[0])"
      @add-room="addRoom"
    />
  </div>
</template>

<script>
import { register } from 'vue-advanced-chat'
import { mapGetters } from 'vuex'
register()

export default {
  name: 'IndexPage',
  data () {
    return {
      currentUserId: '1234',
      messages: [],
      messagesLoaded: false
    }
  },
  async fetch () {
    await this.$store.dispatch('fetchDrivers')
    await this.$store.dispatch('fetchMessages')
    await this.$store.dispatch('bindRooms')
  },
  computed: {
    ...mapGetters(['drivers']),
    rooms () {
      return this.drivers.map((d) => {
        return {
          roomId: d.id + '',
          roomName: d.name,
          avatar: `https://ui-avatars.com/api/?name=${d.name}`,
          users: [
            {
              _id: '1234',
              username: 'John Doe'
            },
            {
              _id: d.id + '',
              username: d.name
            }
          ]
        }
      })
    }
  },
  methods: {
    addRoom () {
    },
    fetchMessages (/* {  room, options = {}  } */) {
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
    },

    addMessages (senderId, reset) {
      const messages = []

      for (let i = 0; i < 30; i++) {
        messages.push({
          _id: reset ? i : this.messages.length + i,
          content: `${reset ? '' : 'paginated'} message ${i + 1}`,
          senderId,
          username: 'John Doe',
          date: '13 November',
          timestamp: '10:20'
        })
      }

      return messages
    },

    addNewMessage () {
      setTimeout(() => {
        this.messages = [
          ...this.messages,
          {
            _id: this.messages.length,
            content: 'NEW MESSAGE',
            senderId: '1234',
            timestamp: new Date().toString().substring(16, 21),
            date: new Date().toDateString()
          }
        ]
      }, 2000)
    }
  }
}
</script>
