<template>
  <div>
    <b-notification
      v-for="errorMessage in errorMessages"
      :key="errorMessage"
      type="is-warning"
      role="alert"
      show
    >
      {{ errorMessage }}
    </b-notification>
    <b-input
      v-model="credentials.username"
      placeholder="Username"
      class="my-1"
      required
    />
    <b-input
      v-model="credentials.password"
      placeholder="Password"
      type="password"
      class="my-1"
    />
    <b-button
      type="submit"
      variant="primary"
      class="my-1"
      @click="login"
    >
      Login
    </b-button>
  </div>
</template>
<script>
export default {
  name: 'Login',
  data: function () {
    return {
      errorMessages: [],
      credentials: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    parseErrorMessages: function (responseJson) {
      const errorMessages = []
      for (const field in responseJson) {
        if (field === 'non_field_errors') {
          errorMessages.push(...responseJson[field])
        } else {
          for (const message of responseJson[field]) {
            errorMessages.push(field + ': ' + message)
          }
        }
      }
      return errorMessages
    },
    login: function (evt) {
      console.log('login')
      evt.preventDefault()
      this.errorMessages = []
      this.$store
        .dispatch('user_data/getOcsToken', this.credentials)
        .then(() => {
          const successPathname = this.$router.resolve({ name: 'Home' })
          window.location = successPathname.href
        })
        .catch(response => {
          if (response.status >= 400 && response.status < 500) {
            this.errorMessages = this.parseErrorMessages(response.responseJSON)
          } else {
            this.errorMessages = ['Oops, there was an unexpected error logging in. Please try again, and if the problem persists, contact support.']
          }
        })
    }
  }
}
</script>
