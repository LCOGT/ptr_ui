<template>
    <div>
        <ImageNavigationPanel/>
    </div>
</template>

<script>
import { API, Auth } from 'aws-amplify'
import ImageView from '@/components/ImageView'
import ImageNavigationPanel from '@/components/ImageNavigationPanel'
import { mapGetters } from 'vuex'

export default {
  name: "archive",
  components: {
      ImageView,
      ImageNavigationPanel
  },
  computed: {
   ...mapGetters('auth', {
        user: 'user'
    }),
  },
}
</script>

<style scoped>
</style>
