
<template>
  <div>
    <b-button
      :size="size"
      @click="restart_modal_is_active = true"
    >
      Restart Observatory
    </b-button>
    <b-modal :active.sync="restart_modal_is_active">
      <div class="card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Restart Observatory:
            <span class="modal-site-name">&nbsp;{{ site.toUpperCase() }}</span>
          </p>
          <button
            type="button"
            class="delete"
            @click="restart_modal_is_active = false"
          />
        </header>
        <section class="modal-card-body">
          <b-field label="Please say why you would like to restart">
            <b-input
              v-model="user_provided_reason"
              type="text"
              :disabled="not_logged_in"
              :value="user_provided_reason"
            />
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <b-button
            label="Restart"
            :disabled="user_provided_reason.length == 0 || not_logged_in"
            :class="{ 'is-loading': is_loading }"
            type="is-primary"
            @click="send_command"
          />
          <p
            v-if="!$auth.isAuthenticated"
            class="login-warning"
          >
            You need to be logged in to do this
          </p>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import { commands_mixin } from '@/mixins/commands_mixin'
import { getInstance } from '@/auth/index' // get user object: getInstance().user

export default {
  name: 'ObservatoryRestartCommand',
  mixins: [commands_mixin],
  props: {
    site: {
      type: String,
      required: true
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    // Used to set the modal trigger button size
    size: {
      type: String,
      default: 'is-small'
    },
    admin: {
      type: Boolean
    }
  },
  data () {
    return {
      is_loading: false,
      restart_modal_is_active: false,
      user_provided_reason: ''
    }
  },
  methods: {
    async send_command () {
      this.is_loading = true

      const url = `${this.$store.state.api_endpoints.jobs_api}/newjob?site=${this.site}`
      const options = await this.getAuthHeader()
      axios
        .post(url, this.restart_command_body, options)
        .then((response) => {
          this.is_loading = false
          console.log('command response: ', response.data)
          this.$emit('jobPost', response.data)
        })
        .catch((error) => {
          this.is_loading = false
          console.log(error)
          this.handleNotAuthorizedResponse(error)
        })
        .finally(() => {
          this.restart_modal_is_active = false
        })
    }
  },
  computed: {
    ...mapGetters('auth', {
      token: 'getToken'
    }),
    not_logged_in () {
      return !this.$auth.isAuthenticated
    },
    username () {
      return getInstance().user?.name ?? 'anonymous'
    },
    user_id () {
      return getInstance().user?.sub ?? 'anonymous'
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

    restart_command_body () {
      return {
        site: this.site,
        action: 'observatory_restart',
        device: 'all',
        instance: 'all',
        user_name: this.username,
        user_id: this.user_id,
        user_roles: this.user_roles,
        timestamp: parseInt(Date.now() / 1000),
        required_params: {
          user_provided_reason: this.user_provided_reason
        },
        optional_params: {}
      }
    }

  }
}
</script>

<style lang="scss" scoped>
@import "@/style/_variables.scss";
.is-admin {
  background-color: rgba(68, 0, 255, 0.164);
  border-color: rgba(76, 0, 255, 0.541);
}
.modal-site-name {
  color: $grey-light;
  font: 20px "Share Tech Mono", monospace;
}
.login-warning {
    color: #f1b70e;
}
</style>
