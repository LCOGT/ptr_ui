// This was a page created to monitor and test stuff. It is now just a 
// placeholder in case I need something similar and don't want to set it all 
// up again. 


<template>
  <div class="container">
    <pre><code>{{current_image}}</code></pre>
    <div style="height: 20px;"/>
    <pre><code>{{recent_images.map(x => x.image_id)}}</code></pre>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  name: "Devtools",
  computed: {
    ...mapState("images", [
      'recent_images',
      'current_image', 
    ]),
  }
}
</script>

<style scoped>
</style>
