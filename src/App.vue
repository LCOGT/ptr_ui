<template>
  <div id="app">
    <Menu></Menu>
    <router-view></router-view>
  </div>
</template>

<script>
import Menu from '@/components/Menu.vue'
import { Auth } from 'aws-amplify'
import { components } from 'aws-amplify-vue'

export default {
  name: 'App',
  components: {
    Menu,
    components
  },
  created() {
    this.$store.dispatch('observatory/streamSSE')
  }
}
</script>

<style>
</style>
