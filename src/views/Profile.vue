<template>
  <div class="container">
    <div style="height: 25px;"/>
    <div class="top-section">
      <div class="img-container" style="width: 200px;">
          <b-image
            :src="$auth.user.picture"
            alt="alt text"
            ratio="1by1"
            :rounded="true"
            :lazy="false" ></b-image>
          </div>
        <p class="title profile-name">{{ $auth.user.name }}</p>
      </div>
      <!--p>{{ $auth.user.email }}</p-->
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
.top-section {
  max-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 2em;
}
.profile-name {
}
</style>
