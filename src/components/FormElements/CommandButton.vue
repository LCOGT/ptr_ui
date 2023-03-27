<template>
  <button
    class="button"
    :class="{ 'is-loading': isLoading, 'is-admin': admin }"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <slot> {{ data.button_name }} </slot>
  </button>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import { commands_mixin } from '@/mixins/commands_mixin'

export default {
  props: {
    data: Object,
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
      isLoading: false
    }
  },
  methods: {

    async handleClick () {
      this.isLoading = true

      if (this.data.site == '' || this.data.mount == '') {
        console.log('No site and/or mount specified for the command. Command has been cancelled.')
        this.isLoading = false
        return
      }

      const commandPayload = {
        ...this.data.form,
        site: this.data.site,
        mount: this.data.mount,
        timestamp: parseInt(Date.now() / 1000)
      }

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
  computed: {
    ...mapGetters('auth', {
      token: 'getToken'
    })
  }
}
</script>

<style scoped>

.is-admin {
    background-color: rgba(68, 0, 255, 0.164);
    border-color: rgba(76, 0, 255, 0.541);
}
</style>
