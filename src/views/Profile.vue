<template>
  <div>
    <div>
      <div>
        <img :src="$auth.user.picture">
        <h1>{{ $auth.user.name }}</h1>
        <p>{{ $auth.user.email }}</p>
      </div>
    <div>
      <pre>{{ JSON.stringify($auth.user, null, 2) }}</pre>
      <pre>{{ $auth.context}}</pre>
      <pre>{{ JSON.stringify($auth.getIdTokenClaims(), null, 2) }}</pre>
      <button @click="showAuth">auth</button>
      <button @click="tokenWithPopup">getTokenWithPopup</button>
      <button @click="tokenSilently">getTokenSilently</button>
      <button @click="getAccessToken">accessToken</button>
    </div>
  </div>
</div>
</template>

<script>
import axios from 'axios';

export default {
  name: "Profile",
  methods: {
    async getAccessToken() {
      let response = await axios.get(`https://photonranch.auth0.com/authorize?
  audience=https://photonranch.auth0.com/api/v2/
  &response_type=token%20id_token
  &scope=read:current_user
  &client_id=czNLK0BPUFeoR9p98U7uIP4OoAy4XnyM
  &redirect_uri=http://localhost:8080
  &nonce=NONCE
  &state=OPAQUE_VALUE`)

      console.log(response)
    },

    async tokenWithPopup() {
      console.log(await this.$auth.getTokenWithPopup())
    },
    async tokenSilently() {
      console.log(await this.$auth.getTokenSilently())
    },
    showAuth() {
      console.log(this.$auth)
    },
  }
};
</script>

<style>
</style>
