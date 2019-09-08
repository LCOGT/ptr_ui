<template><div class="page">
  <div class="user-images">
    <ImageNavigationPanel/>
  </div>
</div></template>

<script>
import { API, Auth } from 'aws-amplify'
import ImageView from '@/components/ImageView'
import ImageNavigationPanel from '@/components/ImageNavigationPanel'
import { mapGetters } from 'vuex'

export default {
  name: 'imgnav',
  components: {
    ImageView,
    ImageNavigationPanel
  },
  methods: {

  },
  computed: {
    ...mapGetters('auth', {
        user: 'user'
    }),
  }
}


</script>

<style scoped>
.page {
  display: grid;
  grid-template-columns: 20% 70% 10%;
  grid-gap: 10px;
}
</style>