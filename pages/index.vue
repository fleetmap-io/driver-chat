<i18n lang="yaml">
pt:
  TYPE_MESSAGE: 'Escreva uma mensagem'
es:
  TYPE_MESSAGE: 'Escreva un mensaje'
</i18n>
<template>
  <div>
    <select-driver v-if="addDriver" @click="addRoom" @cancel="addDriver=false" />
    <vue-advanced-chat
      :text-messages="textMessages"
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
    textMessages () {
      return JSON.stringify(
        {
          ROOMS_EMPTY: this.$t('ROOMS_EMPTY'),
          ROOM_EMPTY: this.$t('ROOM_EMPTY'),
          NEW_MESSAGES: this.$t('NEW_MESSAGES'),
          MESSAGE_DELETED: this.$t('MESSAGE_DELETED'),
          MESSAGES_EMPTY: this.$t('MESSAGES_EMPTY'),
          CONVERSATION_STARTED: this.$t('CONVERSATION_STARTED'),
          TYPE_MESSAGE: this.$t('TYPE_MESSAGE'),
          SEARCH: this.$t('SEARCH'),
          IS_ONLINE: this.$t('IS_ONLINE'),
          LAST_SEEN: this.$t('LAST_SEEN'),
          IS_TYPING: this.$t('IS_TYPING'),
          CANCEL_SELECT_MESSAGE: this.$t('CANCEL_SELECT_MESSAGE')
        })
    },
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
      await this.$store.dispatch('clearUnread', room.roomId)
    }
  }
}
</script>
