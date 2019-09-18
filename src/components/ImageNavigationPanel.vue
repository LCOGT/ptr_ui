<template>
    <div>      
        <div class="side-panel">
            <b-menu>
                <b-menu-list>
                    <b-menu-item icon="account" label="My Account Images" :expanded="true">
                        <!--All images folder-->
                        <b-collapse class="card" :open="false" aria-id="contentIdForA11y3">
                            <div
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
                            <div class="folder" ref="records">
                                <div 
                                    v-on:click="toggle(index)" 
                                    :class="{'active': index == activeIndex}" 
                                    v-for="(item, index) in user_images" 
                                    :key="item.image_id"
                                >
                                    <div v-bind:id="item.image_id" class="img-record" v-bind:class="{ active: isActive }"  @click="setActiveImage(item)">
                                        <div class="image">
                                            <img 
                                                style="width: 100px; height: 100px;"
                                                v-bind:src="item.jpg13_url"
                                                v-bind:title="item.base_filename"
                                                alt="Preview Not Available"
                                            >
                                        </div>
                                        <div class=image-information>
                                            <p>{{item.image_id}}</p>
                                            <p style="color:white;">Filename: {{item.base_filename}}</p>
                                            <p style="color:rgb(175,175,175);">Site: {{item.site}}</p>
                                            <p style="color:rgb(175,175,175);">Date Captured: {{item.capture_date}}</p>
                                            <div class=image-coordinates>
                                                <p style="color:rgb(175,175,175);">
                                                    RA: {{item.right_ascension.toFixed(2)}}
                                                </p>
                                                <p style="color:rgb(175,175,175);">
                                                    DEC: {{item.declination.toFixed(2)}}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </b-collapse>
                        <br>
                        <!--Trash folder-->
                        <!--<b-collapse class="card" :open="false" aria-id="contentIdForA11y3">
                            <div
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
                            <div class="card-content" v-for="(item, index) in trash_images" :key="index">
                                <div class="image">
                                <img 
                                    style="width: 100px; height: 100px;"
                                    v-bind:src="item.jpg13_url"
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
                        </b-collapse>-->
                    </b-menu-item>
                </b-menu-list>
            </b-menu>
            <b-button @click="getUserImageAt(37511)">Click Me</b-button>
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
            activeColor:String,
            activeIndex: null,
            isActive: false,
        };
    },

    components: { 
        draggable,
    },

    beforeMount() {
        this.$store.dispatch('images/get_user_images')
    },

    methods: {
        toggle: function(index) {
            if(this.activeIndex == index) {
                this.activeIndex = null
            } else {
                this.activeIndex = index
            }
        },
        setActiveImage(image) {
            this.$store.dispatch("images/set_current_image", image);
        },
        getUserImageAt(index) {
            document.getElementById(index).classList.toggle('active');
            // let image = this.$refs.records.children[index];
            // this.isActive = true;
        }
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
.img-record{
  display: grid;
  grid-template-columns: 30% 70%;
  grid-row-gap: 5px;
  border-bottom: 1px solid rgb(78, 74, 74);
  padding-right: 10px;
  padding-left: 10px;
  padding-top: 22px;
  padding-bottom: 22px;
}
.folder{
    max-height: 1000px;
    overflow-y: auto;
}
.img-record:hover{
  background:rgb(65, 75, 75);
}
.card-content:focus-within{
    background:white;
}
.image{
  grid-column: 1;
  border-right: 1px solid darkgray;
  text-align: center;
  padding-left:10px;
}
.image-information{
  grid-column: 2;
  padding-left: 15px;
}
.image-coordinates{
  display: grid;
  grid-template-columns: 50% 50%;
  grid-row-gap: 5px;
}
.side-panel {
  grid-column: 1;
  width: 520px;
  height: 740px;
}
.active{
    background-color: rgb(60, 70, 70);
}
.image-coordinates{
    padding-top: 20px;
}
</style>

