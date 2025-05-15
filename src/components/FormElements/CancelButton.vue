<template>
  <button
    class="button"
    :class="{ 'is-loading': is_loading, 'is-admin': admin }"
    :disabled="isDisabled"
    @click="send_command"
  >
    <slot name="title">
      Cancel
    </slot>
  </button>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import { commands_mixin } from '@/mixins/commands_mixin'

export default {
  name: 'CancelButton',
  props: {
    site: {
      type: String,
      required: true
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
      is_loading: false
    }
  },
  methods: {

    async send_command () {
      this.is_loading = true

      const url = `${this.$store.state.api_endpoints.jobs_api}/newjob?site=${this.site}`
      const options = await this.getAuthHeader()
      axios.post(url, this.cancel_request_body, options).then(response => {
        this.is_loading = false
        console.log('command response: ', response.data)
        this.$emit('jobPost', response.data)
      }).catch(error => {
        this.is_loading = false
        console.log(error)
        this.handleNotAuthorizedResponse(error)
      })
    }
  },
  computed: {
    ...mapGetters('auth', {
      token: 'getToken'
    }),
    username () {
      return this.$store.state.user_data.userName
    },
    user_id () {
      return this.$store.state.user_data.userId
    },
    user_roles () {
      try {
        const user = this.$auth.user
        const roles = user['https://photonranch.org/user_metadata'].roles
        return roles
      } catch {
        return []
      }
    },

    cancel_request_body () {
      return {
        site: this.site,
        action: 'cancel_all_commands',
        device: 'all',
        instance: 'all',
        user_name: this.username,
        user_id: this.user_id,
        user_roles: this.user_roles,
        timestamp: parseInt(Date.now() / 1000),
        required_params: {},
        optional_params: {}
      }
    }
  }
}
</script>

<style scoped>

.is-admin {
    background-color: rgba(68, 0, 255, 0.164);
    border-color: rgba(76, 0, 255, 0.541);
}
</style>
