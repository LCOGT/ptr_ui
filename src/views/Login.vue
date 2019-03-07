<template>
    <div class='level'>
        <div></div>
        <div class="login-component">

            <b-field label="Username"
                :type="{ 'is-danger': showError }"
                >
                <b-input
                value=""
                v-model="input.username"
                v-on:keyup.native.enter="login()"></b-input>
            </b-field>

            <b-field
                label="Password"
                :type="{ 'is-danger': showError }"
                :message="[
                    { 'Username or password is incorrect': showError }
                ]">
                <b-input
                value=""
                type="password"
                v-model="input.password"
                v-on:keyup.native.enter="login()">
                </b-input>
            </b-field>

            <button class="button is-primary" type="submit" value="Log In" v-on:click="login()">Log In</button>

        </div>
        <div></div>
    </div>

</template>

<script>
import { Auth } from 'aws-amplify'
export default {
  name: 'Login',
  data () {
    return {
      input: {
        username: '',
        password: ''
      },
      showError: false
    }
  },
  methods: {
    login () {
      if (this.input.username != '' && this.input.password != '') {
        Auth.signIn({ username: this.input.username, password: this.input.password })
          .then(user => {
            this.$store.commit('auth/setUser', user)
            this.$router.go(-1)
          })
          .catch(err => {
            console.log(err)
            this.showError = true
          })
      }
    }
  }
}
</script>

<style scoped>
.page-container {
    display: flex;
}
.login-component {
    border: 200px solid;
    padding: 40px;
    margin: 10px;
    max-width: 950px;
}
</style>
