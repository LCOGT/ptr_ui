<template>
    <div>      
        <p>Your images:</p>
        <div v-for="(item, index) in user_images" :key="index">
            {{index}}. {{item.url}}
            <img 
                style="width: 60px; height: 60px;"
                v-bind:src="item.url"
                v-bind:title="item.filename"
            >
        </div>
        <p>{{username}}</p>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ImageNavigationPanel',
  data() {
      return {

    };
  },
  beforeMount() {
        this.$store.dispatch('images/get_user_images')
    },

    methods: {
    },

    computed: {
        ...mapGetters('images', {
            user_images: 'user_images'
        }),
        ...mapGetters('auth', {
            username: 'username'
        }),

    },
}

</script>

<style scoped>

</style>

