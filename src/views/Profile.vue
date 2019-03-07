<template>
    <div>
        <span> Profile for {{ this.$store.getters['auth/username'] }}</span>
    </div>
</template>

<script>

export default {
  name: 'Profile',
}
</script>

<style scoped>
</style>
