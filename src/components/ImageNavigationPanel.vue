<template>
    <div>      
        <div class="side-panel">
            <b-menu>
                <b-menu-list>
                    <b-menu-item icon="account" label="My Account Images" :expanded="true">
                        <!--All images folder-->
                        <b-collapse class="card" :open="false" aria-id="contentIdForA11y3">
                            <div @click="open"
                                slot="trigger" 
                                slot-scope="props"
                                class="card-header"
                                role="button"
                                aria-controls="contentIdForA11y3">
                                <p class="card-header-title">
                                    All Images
                                </p>
                                <a class="card-header-icon">
                                    <b-icon
                                        :icon="props.open ? 'menu-down' : 'menu-up'">
                                    </b-icon>
                                </a>
                            </div>
                            <draggable v-model="user_images">
                                <transition-group class="trans">
                                    <div class="card-content" v-for="(item, index) in user_images" :key="index">
                                        <div class="image">
                                        <img 
                                            style="width: 100px; height: 100px;"
                                            v-bind:src="item.url"
                                            v-bind:title="item.base_filename"
                                            alt="Preview Not Available"
                                        >
                                        </div>
                                        <div class=image-information>
                                            <p style="color:white;">Filename: {{item.base_filename}}</p>
                                            <p style="color:rgb(175,175,175);">Site: {{item.site}}</p>
                                            <p style="color:rgb(175,175,175);">Date Captured: {{item.capture_date}}</p>
                                            <div class=image-coordinates>
                                                <p style="color:rgb(175,175,175);">RA: {{item.right_ascension}}</p>
                                                <p style="color:rgb(175,175,175);">DEC: {{item.declination}}</p>
                                            </div>
                                        </div>
                                    </div>
                                </transition-group>
                            </draggable>
                        </b-collapse>
                        <br>
                        <!--Trash folder-->
                        <b-collapse class="card" :open="false" aria-id="contentIdForA11y3">
                            <div @click="open"
                                slot="trigger" 
                                slot-scope="props"
                                class="card-header"
                                role="button"
                                aria-controls="contentIdForA11y3">
                                <p class="card-header-title">
                                    Trash
                                </p>
                                <a class="card-header-icon">
                                    <b-icon
                                        :icon="props.open ? 'menu-down' : 'menu-up'">
                                    </b-icon>
                                </a>
                            </div>
                            <draggable v-model="user_images">
                                <transition-group>
                                    <div class="card-content" v-for="(item, index) in trash_images" :key="index">
                                        <div class="image">
                                        <img 
                                            style="width: 100px; height: 100px;"
                                            v-bind:src="item.url"
                                            v-bind:title="item.base_filename"
                                            alt="Preview Not Available"
                                        >
                                        </div>
                                        <div class=image-information>
                                            <p style="color:white;">Filename: {{item.base_filename}}</p>
                                            <p style="color:rgb(175,175,175);">Site: {{item.site}}</p>
                                            <p style="color:rgb(175,175,175);">Date Captured: {{item.capture_date}}</p>
                                            <div class=image-coordinates>
                                                <p style="color:rgb(175,175,175);">RA: {{item.right_ascension}}</p>
                                                <p style="color:rgb(175,175,175);">DEC: {{item.declination}}</p>
                                            </div>
                                        </div>
                                    </div>
                                </transition-group>
                            </draggable>
                        </b-collapse>
                    </b-menu-item>
                </b-menu-list>
            </b-menu>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'

export default {
  name: 'ImageNavigationPanel',
  data() {
      return {
          isFullPage: false,
    };
  },
  components: {
      draggable,
  },
  beforeMount() {
        this.$store.dispatch('images/get_user_images')
        this.$store.dispatch('images/get_trash_images')
    },

    methods: {
        open() {
            const loadingComponent = this.$buefy.loading.open({
                container: this.isFullPage ? null : this.$refs.element.$el
            })
            setTimeout(() => loadingComponent.close(), 3 * 1000)
        }
    },

    computed: {
        ...mapGetters('images', {
            user_images: 'user_images'
        }),
        ...mapGetters('images', {
            trash_images: 'trash_images'
        }),
        ...mapGetters('auth', {
            username: 'username'
        }),
    },
}

</script>

<style scoped>
.card-content{
  display: grid;
  grid-template-columns: 28% 75%;
  grid-row-gap: 5px;
  border-bottom: 1px solid rgb(78, 74, 74);
}
.card-content:hover{
  background:gray;
}
.image{
  grid-column: 1;
  border-right: 1px solid darkgray;
  text-align: center;
}
.image-information{
  grid-column: 2;
  padding-left: 20px
}
.image-coordinates{
  display: grid;
  grid-template-columns: 50% 50%;
  grid-row-gap: 5px;
}
.side-panel {
  grid-column: 1;
  width: 500px;
  height: 740px;
  overflow-y: auto;
}
.trans{
    background-color: blueviolet;
}
</style>

