<template>
  <button
    v-if="isVisible"
    class="button"
    :class="{ 'is-loading': isLoading, 'is-admin': admin, 'is-preview-mode': previewMode }"
    :disabled="isDisabled"
    @mouseover="isHovering = true"
    @mouseleave="isHovering = false"
    @click="handleClick"
  >
    <slot> {{ data?.button_name || 'command button'}} </slot>
  </button>
</template>

<script>
import axios from 'axios'
import { commands_mixin } from '@/mixins/commands_mixin'

export default {
  props: {
    data: {
      type: Object,
      required: false
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    admin: {
      type: Boolean
    }
  },
  mixins: [commands_mixin],
  data () {
    return {
      isLoading: false,
      shiftKeyActive: false,
      isHovering: false
    }
  },
  methods: {

    async handleClick () {
      // Require a site to be specified
      if (this.data.site == '') {
        console.log('No site specified for the command. Command has been cancelled.')
        this.isLoading = false
        return
      }
      // Use the value of preview mode when the button was first clicked
      // Preview mode doesn't send the command to the backend, but simply
      // displays the payload to the user.
      const inPreviewMode = this.previewMode

      // Add a loading spinner to the button
      this.isLoading = true

      const commandPayload = {
        ...this.data.form,
        site: this.data.site,
        mount: this.data.mount,
        timestamp: parseInt(Date.now() / 1000)
      }

      // If in preview mode, show a popup and return without sending anything.
      if (inPreviewMode) {
        this.isLoading = false
        const commandPayloadString = JSON.stringify(commandPayload, null, 4)
        const message = `
          <b>Command Payload - Preview Mode</b>
          <p> Note: commands are not sent in preview mode. </p>
          <hr>
          <div style="white-space: pre; max-height: 70vh; overflow-y: auto;">
            ${commandPayloadString}
          </div>`
        this.$buefy.notification.open({
          message,
          position: 'is-bottom',
          type: 'is-warning',
          hasIcon: true,
          indefinite: true
        })
      }
      // send the command to site here using the 'data' props
      else {
        const url = `${this.$store.state.api_endpoints.jobs_api}/newjob?site=${this.data.site}`
        const options = await this.getAuthHeader()
        axios.post(url, commandPayload, options).then(response => {
          this.isLoading = false
          console.log('command response: ', response.data)
          this.$emit('jobPost', response.data)
        }).catch(error => {
          this.isLoading = false
          console.log(error)
          this.handleNotAuthorizedResponse(error)
        })
      }
    },

    onKeydown (event) {
      if (event.shiftKey) {
        this.shiftKeyActive = true
      }
    },

    onKeyup (event) {
      if (!event.shiftKe) {
        this.shiftKeyActive = false
      }
    }
  },
  mounted () {
    window.addEventListener('keydown', this.onKeydown)
    window.addEventListener('keyup', this.onKeyup)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeydown)
    window.removeEventListener('keyup', this.onKeyup)
  },
  computed: {
    // Preview mode is enabled when a user holds the shift key while clicking.
    // It changes the command button style and results in a preview
    // of the command payload being displayed. The command is not
    // sent to the backend.
    previewMode () {
      return this.shiftKeyActive && this.isHovering
    },

    isVisible () {
      // Make sure admin buttons are only present if the user is an admin
      if (this.admin) {
        return this.$store.state.user_data.userIsAdmin
      }
      return true
    }
  }
}
</script>

<style scoped>

.is-admin {
    background-color: rgba(68, 0, 255, 0.164);
    border-color: rgba(76, 0, 255, 0.541);
}
.is-preview-mode {
  /* border-width: 2px; */
  color: gold !important;
  background-color: rgba(199, 172, 47, 0.164) !important;
  border-color: gold !important;
  border-style: dashed;
}
</style>
