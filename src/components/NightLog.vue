<template>
  <div>
    <b-field custom-class="night-log-buttons">
      <p class="control">
        <b-button
          :disabled="!noteIsLoaded && !noteIsExpired"
          class="is-warning is-small"
          :class="buttonAnimating ? 'note-is-animating' : ''"
          :size="noteButtonSize"
          @click="$event => { noteVisible = true; editorVisible = false }"
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
          @click="$event => { editorVisible = true; noteVisible = false }"
        >
          new
        </b-button>
      </p>
    </b-field>

    <!-- Note display -->
    <div
      id="night-log-draggable-note"
      class="note-container"
    >
      <b-message
        v-model="noteVisible"
        :title="noteTitle"
        type="is-warning"
        class="night-log-message"
        aria-close-label="Close message"
        @close="messageCloseHandler"
      >
        <div class="note-timestamp">
          <div>{{ noteTimestamp.utcIso }}</div>
          <div>{{ noteTimestamp.ago }}</div>
        </div>
        <p>{{ note?.note_data?.message }}</p>
        <div
          class="note-delete"
        >
          <div
            v-if="noteExpiresSoon"
            class="note-expires-soon-warning"
          >
            {{ readableTimeToExpiry }}
          </div>
          <b-button
            v-show="userIsAdmin"
            type="is-danger"
            outlined
            size="is-small"
            :loading="deleteInProgress"
            @click="deleteNote"
          >
            delete
          </b-button>
        </div>
      </b-message>
    </div>

    <!-- Note Editor -->
    <div
      id="night-log-draggable-editor"
      class="note-container"
    >
      <b-message
        v-model="editorVisible"
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
            v-model="noteEditorMessage"
            type="textarea"
          />
        </b-field>
        <b-field
          horizontal
          label="Expires after"
        >
          <b-field>
            <p class="control">
              <b-input
                v-model="noteEditorTtlHours"
                type="number"
              />
            </p>
            <p class="control">
              <b-button disabled>
                hours
              </b-button>
            </p>
          </b-field>
        </b-field>
        <b-field horizontal>
          <b-button
            :loading="createNoteInProgress"
            @click="newNote"
          >
            submit new message
          </b-button>
        </b-field>
        <br>
        <b-field>
          <p>Your message will be visible to all users until it expires or another note is created.</p>
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
import { commands_mixin } from '@/mixins/commands_mixin' // for getAuthHeader
export default {
  props: {
    site: String
  },
  mixins: [user_mixin, clock, commands_mixin],
  data () {
    return {
      noteVisible: false,
      editorVisible: false,

      noteEditorMessage: '',
      noteEditorTtlHours: 48, // default: 48hr expiry

      noteIsLoaded: false,
      note: '',

      buttonFlash: false,
      buttonAnimating: false,
      noteButtonSize: 'is-small',

      deleteInProgress: false,
      createNoteInProgress: false
    }
  },
  mounted () {
    this.getNote()
    $('#night-log-draggable-note').draggable({ cancel: 'article section.message-body' })
    $('#night-log-draggable-editor').draggable({ cancel: 'article section.message-body' })
  },
  methods: {
    getNote () {
      const url = this.$store.state.api_endpoints.active_api + '/nightlog/' + this.site
      axios.get(url).then(response => {
        // Do nothing if there's no note to load
        if (response.status == 204) { return }

        // Save the note we just loaded
        this.note = response.data
        this.noteIsLoaded = true

        // Check if the user has already seen this note
        const lastReadNote = window.localStorage.getItem(this.nightlogReadId)
        if (this.noteId !== lastReadNote) {
          // Hide the editor / show the note
          this.noteVisible = true
          this.editorVisible = false
        }
      }).catch(error => {
        if (error.response.status == 404) {
          console.error('problem fetching night log for site ', this.site)
        }
      })
    },
    async newNote () {
      this.createNoteInProgress = true
      const url = this.$store.state.api_endpoints.active_api + '/nightlog/' + this.site
      const options = await this.getAuthHeader()
      const note_data = {
        site: this.$route.params.sitecode,
        username: this.userName,
        userid: this.userId,
        message: this.noteEditorMessage,
        ttl_hours: this.noteEditorTtlHours,
        selected_image: this.current_image
      }
      const body = { note_data }
      axios.post(url, body, options).then(response => {
        this.createNoteInProgress = false
        this.getNote()
      }).catch(error => {
        console.error('Error creating note', error)
        this.createNoteInProgress = false
      })
    },
    async deleteNote () {
      this.deleteInProgress = true
      const url = this.$store.state.api_endpoints.active_api + '/nightlog/' + this.site
      const options = await this.getAuthHeader()
      axios.delete(url, options).then(response => {
        this.deleteInProgress = false
        window.localStorage.removeItem(this.nightlogReadId)
        this.noteVisible = false
        this.noteIsLoaded = false
        this.note = ''
      })
    },
    pulseNightlogButton () {
      // Quick animation to show where the user can reopen the night log
      this.buttonAnimating = true
      this.noteButtonSize = 'is-medium'
      setTimeout(() => { this.noteButtonSize = 'is-small' }, 200)
      setTimeout(() => { this.buttonAnimating = false }, 1600)
    },
    messageCloseHandler () {
      // mark the message as read
      window.localStorage.setItem(this.nightlogReadId, this.noteId)

      // animate the button users need to reopen
      this.pulseNightlogButton()
    }
  },
  computed: {
    nightlogReadId () {
      const id = 'ptrNightlogLastRead+'
      return id
    },
    noteId () {
      return this.note.site + '|' + this.note.created_timestamp
    },
    noteTitle () {
      return this.site.toUpperCase() + ' - Message from ' + this.note?.note_data?.username
    },
    noteTimestamp () {
      if (!this.noteIsLoaded) { return false }
      const dateObj = moment(this.note.created_timestamp * 1000)
      return {
        utcIso: dateObj.utc().format('MM/DD HH:mm UTC'),
        ago: dateObj.fromNow(),
        timestampNow: this.timestampNow // included so this computed property updates each second
      }
    },
    millisecondsUntilExpiry () {
      // Calculate the timestamp when the note should expire
      const msUntilExpiry = (this.note.ttl_timestamp_seconds * 1000) - this.timestampNow
      return msUntilExpiry
    },
    noteExpiresSoon () {
      const soonIntervalMilliseconds = 1800 * 1000 * 3 // define "soon" as 30 minutes
      return this.millisecondsUntilExpiry < soonIntervalMilliseconds
    },
    readableTimeToExpiry () {
      const expirationTime = this.millisecondsUntilExpiry + this.timestampNow
      return 'This note will expire ' + moment(expirationTime).fromNow()
    },
    noteIsExpired () {
      // Note expirations in the backend are handled by a dynamodb ttl attribute and isn't super precise.
      // This check exists so that we can simply hide the note if it is overdue to expire.
      return this.millisecondsUntilExpiry <= 0
    },
    ...mapGetters('images', [
      'current_image'
    ])
  }
}
</script>

<style lang="scss" scoped>
.night-log-buttons {
  margin: 0;
  z-index: 19; // beneath buefy dropdowns (e.g. profile dropdown in navbar)
}
.note-container {
    position: absolute;
    width: 350px;
    margin-top: 1.5em;
    margin-left: -280px; // right side should align with right of "night log" button (which is 70px wide)

    z-index: 40; // same as buefy modal windows

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
.note-delete {
    color: silver;
    display:flex;
    justify-content: space-between;
    //flex-direction: row-reverse;
    padding-top: 1em;
    margin-top: 1em;
    //border-top: 1px solid grey;
}

.note-expires-soon-warning {
  color: grey;
}
.note-is-animating {
  transition: 0.2s;
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
