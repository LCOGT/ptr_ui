<template>
  <div class="container">
    <div class="level top-section">
      <img class="profile-picture" :src="$auth.user.picture">
      <b-image
            :src="$auth.user.picture"
            alt="alt text"
            ratio="1by1"
            :rounded="true"
        ></b-image>
      <p class="title">{{ $auth.user.name }}</p>
      <!--p>{{ $auth.user.email }}</p-->
    </div>
    <div>
      <pre>{{ JSON.stringify($auth.user, null, 2) }}</pre>
      <p>break</p>
      <button @click="showAuth">auth</button>
      <button @click="tokenWithPopup">getTokenWithPopup</button>
      <button @click="tokenSilently">getTokenSilently</button>
    </div>
  </div>
</template>

<script>
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

<style scoped>
.profile-picture {
  width: 100px;
  height: 100px;
}
.top-section {
  max-height: 200px;
}
</style>
