<template>
  <div>
    <b-field style="margin: 0;">
      <p class="control">
        <b-button
          :disabled="!note_is_loaded"
          class="is-warning is-small"
          outlined
          @click="note_visible = true; editor_visible = false"
        >
          night log
        </b-button>
      </p>
      <p
        v-show="userIsAdmin"
        class="control"
      >
        <b-button
          class="is-warning is-small"
          outlined
          icon-left="plus"
          @click="editor_visible = true; note_visible = false"
        >
          new
        </b-button>
      </p>
    </b-field>
    <div
      id="night-log-draggable-note"
      class="note-container"
    >
      <b-message
        v-model="note_visible"
        :title="note_title"
        type="is-warning"
        class="night-log-message"
        aria-close-label="Close message"
        @close="message_close_handler"
      >
        <div class="note-timestamp">
          <div>{{ note_timestamp.utc_iso }}</div>
          <div>{{ note_timestamp.ago }}</div>
        </div>
        <p>{{ note?.note_data?.message }}</p>
      </b-message>
    </div>
    <div
      id="night-log-draggable-editor"
      class="note-container"
    >
      <b-message
        v-model="editor_visible"
        title="New Message"
        type="is-warning"
        class="night-log-message"
        aria-close-label="Close message"
      >
        <b-field
          horizontal
          label="From"
        >
          {{ userName }}
        </b-field>
        <b-field
          label="Message"
          horizontal
        >
          <b-input
            v-model="note_editor_message"
            type="textarea"
          />
        </b-field>
        <b-field horizontal>
          <b-button @click="new_note">
            submit new message
          </b-button>
        </b-field>
        <b-field>
          <p>Note: messages are visible for 48 hours or until another note is created.</p>
        </b-field>
      </b-message>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import { mapGetters } from 'vuex'
import { user_mixin } from '@/mixins/user_mixin'
import { clock } from '@/mixins/clock'
export default {
  props: {
    site: String
  },
  mixins: [user_mixin, clock],
  data () {
    return {
      note_visible: false,
      editor_visible: false,
      note_editor_message: '',

      note_is_loaded: false,
      note: ''
    }
  },
  mounted () {
    this.get_note()
    $('#night-log-draggable-note').draggable({ cancel: 'article section.message-body' })
    $('#night-log-draggable-editor').draggable({ cancel: 'article section.message-body' })
  },
  methods: {
    get_note () {
      const url = this.$store.state.api_endpoints.active_api + '/nightlog/' + this.site
      axios.get(url).then(response => {
        console.log(response)

        // Save the note we just loaded
        this.note = response.data
        this.note_is_loaded = true

        // Check if the user has already seen this note
        const note_id = this.note.site + this.note.created_timestamp
        const last_read_note = window.localStorage.getItem('ptr_nightlog_last_read')
        if (note_id !== last_read_note) {
          // Hide the editor / show the note
          this.note_visible = true
          this.editor_visible = false
        }
      })
    },
    new_note () {
      const url = this.$store.state.api_endpoints.active_api + '/nightlog/' + this.site
      const note_data = {
        site: this.$route.params.sitecode,
        username: this.userName,
        userid: this.userId,
        message: this.note_editor_message,
        selected_image: this.current_image
      }
      const body = { note_data }
      axios.post(url, body).then(response => {
        console.log(response)
        this.get_note()
      })
    },
    message_close_handler () {
      // mark the message as read
      const note_id = this.note.site + this.note.created_timestamp
      window.localStorage.setItem('ptr_nightlog_last_read', note_id)
    }
  },
  computed: {
    note_title () {
      return this.site.toUpperCase() + ' - Message from ' + this.note?.note_data?.username
    },
    note_timestamp () {
      if (!this.note_is_loaded) { return false }
      const date_obj = moment(this.note.created_timestamp * 1000)
      return {
        utc_iso: date_obj.utc().format('MM/DD HH:mm UTC'),
        ago: date_obj.fromNow(),
        timestamp_now: this.timestamp_now // included so this computed property updates each second
      }
    },
    ...mapGetters('images', [
      'current_image'
    ])
  }
}
</script>

<style lang="scss" scoped>
.note-container {
    position: absolute;
    width: 350px;
    margin-top: 1.5em;
    margin-left: -280px; // right side should align with right of "night log" button (which is 70px wide)

    // shadow
    -webkit-box-shadow: 4px 4px 25px 0px rgba(0,0,0,0.67);
    -moz-box-shadow: 4px 4px 25px 0px rgba(0,0,0,0.67);
    box-shadow: 4px 4px 25px 0px rgba(0,0,0,0.67);
}

.note-timestamp {
    color: silver;
    display: flex;
    justify-content: space-between;
    padding-bottom: 0.5em;
    margin-bottom: 1em;
    border-bottom: 1px solid silver;
}
</style>

<style>
.night-log-message .message-body {
    background-color: #151718;
}
.message.is-warning {
    background-color: #fffaeb;
}
.message.is-warning .message-body {
    /*color: #946c00;*/
    border: 2px solid;
}
.message.is-warning .message-body ::-moz-selection {
    /* Code for Firefox */
    color: black;
    background: paleturquoise; /* highlight color */
}

.message.is-warning .message-body ::selection {
    color: black;
    background: paleturquoise; /* highlight color */
}
</style>
