<template>
  <div class="columns">
    <div class="column is-full container">
      <image-view />
    </div>
  </div>
</template>

<script>
import { API, Auth } from 'aws-amplify'
import ImageView from '@/components/ImageView'

export default {
  name: 'imgs',
  components: {
    ImageView,
  },
  data() {
    return {

    }
  },
  methods: {
  }
}
</script>

<style scoped>
.container {
  margin-top: 3em;
}
</style>
