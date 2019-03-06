<template>
    <div>
        <span> Profile for {{ getUsername() }}</span>
    </div>
</template>

<script>
export default {
  name: 'Profile',
  methods: {
    getUsername () {
      let user = this.$store.getters.user
      return user.username
    }
  }
}
</script>

<style scoped>
</style>
