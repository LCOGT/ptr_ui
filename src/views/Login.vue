<template>
    <div class='level'>
        <div></div>
        <div class="login-component">

            <b-field 
                label="Username"
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

            <div style="padding-top: 2em;" />
            <button class="button is-light" type="submit" value="Log In" v-on:click="login()">Log In</button>
            <button class="button is-warning" style="margin-left: 1em;" @click="adminLogIn">log in as wmd_admin</button>

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
            this.$store.dispatch('auth/log_in_user', user)
            this.$router.go(-1)
          })
          .catch(err => {
            console.log(err);
            this.showError = true
          })
      }
    },
    /**
     * Sign in as wmd_admin. 
     * This is temporary for quick testing, and will be disabled when 
     * authentication grants access to controls. 
     */
    adminLogIn() {
      this.$store.dispatch('auth/logInAdmin')
      this.$router.go(-1)
    },
  }
}
</script>

<style scoped>
.page-container {
    display: flex;
}
.rainbow {
    background:white; /* For browsers that do not support gradients */
    background: -webkit-linear-gradient(left,red, orange , yellow, green, cyan, blue, violet); /* For Safari 5.1 to 6.0 */
    background: -o-linear-gradient(right, red, orange, yellow, green, cyan, blue, violet); /* For Opera 11.1 to 12.0 */
    background: -moz-linear-gradient(right, red, orange, yellow, green, cyan, blue, violet); /* For Firefox 3.6 to 15 */
    background: linear-gradient(to right,red,orange , yellow, green, cyan, blue,violet, red, red, orange , yellow, green, cyan, blue, violet, violet); /* Standard syntax (must be last) */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent; 
}
.login-component {
    padding: 40px;
    margin: 10px;
    max-width: 950px;
}

</style>
