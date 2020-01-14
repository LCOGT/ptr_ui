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
      <p>break</p>
      <button @click="showAuth">auth</button>
      <button @click="tokenWithPopup">getTokenWithPopup</button>
      <button @click="tokenSilently">getTokenSilently</button>
    </div>
  </div>
</div>
</template>

<script>
import axios from 'axios';

export default {
  name: "Profile",
  methods: {

    async tokenWithPopup() {
      console.log(await this.$auth.getTokenWithPopup())
    },
    async tokenSilently() {
      return await this.$auth.getTokenSilently()
    },
    showAuth() {
      console.log(this.$auth)
    },
    async getTokenClaims() {
      return await this.$auth.getIdTokenClaims()
    },
  },
};
</script>

<style>
</style>
