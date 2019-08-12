<template>
<div class="user_images">

        <div 
            class="user_image" 
            style="display: flex;"
            v-for="(item, index) in user_images" 
            v-bind:key="index"
        >
            <img 
                style="width: 60px; height: 60px;"
                v-bind:src="item.url"
                v-bind:title="item.filename"
            >
        </div>
            
    </div>
</template>

<script>
export default {
  name: 'ImageNavigationPanel',
  components: {

    },
  beforeMount() {
        this.active_site = 'WMD'
        this.$store.dispatch('images/get_user_images')
    },

    methods: {
    },

    computed: {
        ...mapGetters('images', {
            user_images: 'user_images'
        }),
    },
}

</script>

<style scoped>

</style>