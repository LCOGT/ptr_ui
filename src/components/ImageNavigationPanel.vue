<template>
    <div>      
        <p>Your images:</p>
        <p>{{username}}</p>
        <div>
            <b-collapse class="card" aria-id="contentIdForA11y3">
                <div 
                    slot="trigger" 
                    slot-scope="props"
                    class="card-header"
                    role="button"
                    aria-controls="contentIdForA11y3">
                    <p class="card-header-title">
                        Your Images
                    </p>
                    <a class="card-header-icon">
                        <b-icon
                            :icon="props.open ? 'menu-down' : 'menu-up'">
                        </b-icon>
                    </a>
                </div>
                <div class="card-content" v-for="(item, index) in user_images" :key="index">
                    <div class="content">
                        <div>
                            {{item.filename}}
                        </div>
                        <img 
                            style="width: 100px; height: 100px;"
                            v-bind:src="item.url"
                            v-bind:title="item.filename"
                        >
                        <div class="is-divider" data-content="OR"></div>
                    </div>
                </div>
            </b-collapse>
        </div>
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

