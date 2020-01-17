<template>
  <div>      
    <!--ImageFilter/-->
    <div active icon="account" label="My Account Images" :expanded="true">
        <!--All images folder-->
        <b-collapse class="card" :open="false" aria-id="contentIdForA11y3">

            <div
                slot="trigger" 
                slot-scope="props"
                class="card-header"
                role="button"
                aria-controls="contentIdForA11y3">
                <p class="card-header-title">
                    Images
                </p>
                <a class="card-header-icon">
                    <b-icon
                        :icon="props.open ? 'menu-down' : 'menu-up'">
                    </b-icon>
                </a>
            </div>

            <div class="folder" ref="records">
                <div v-for="item in limitedItems" :key="item.image_id">
                    <div v-bind:id="item.image_id" class="img-record level" v-bind:class="{'selected_thumbnail' : item.image_id == current_image.image_id}"  @click="setActiveImage(item)">
                        <div class="image">
                            <img 
                                v-bind:src="item.jpg13_url"
                                v-bind:title="item.base_filename"
                                alt="Preview Not Available"
                            >
                        </div>
                        <div class="image-information">
                            <p style="color:white;"> {{item.base_filename}}</p>
                            <!--p style="color:rgb(175,175,175);"> {{item.site}}</p-->
                            <p style="color:rgb(175,175,175);"> {{new Date(item.capture_date).toISOString().slice(0, 19).replace('T', ' ')}}</p>
                            <div class=image-coordinates>
                                <p style="color:rgb(175,175,175); padding-right: 5px;">
                                    ra: {{item.right_ascension.toFixed(2)}}
                                </p>
                                <p style="color:rgb(175,175,175);">
                                    dec: {{item.declination.toFixed(2)}}
                                </p>
                            </div>
                            <!--a class="is-text has-text-white" :href="item.fits13_url" download>download fits</a-->
                        </div>
                    </div>
                </div>
            </div>
            <button class="show-more button" @click="limitNumber += 50">Show more</button>
        </b-collapse>
        
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ImageFilter from "@/components/ImageFilter";

export default {
  name: "ImageNavigationPanel",
  components: {
    ImageFilter
  },
  data() {
    return {
      limitNumber: 20,
      filter: false,
      start_date: null,
      end_date: null
    };
  },

  beforeMount() {
    this.$store.dispatch("images/get_user_images");
  },

  mounted() {
    this.$store.dispatch("images/get_user_images");
  },

  methods: {
    setActiveImage(image) {
      this.$store.dispatch("images/set_current_image", image);
    },
  },

  computed: {
    ...mapGetters("images", {
      username: "username",
      user_images: "user_images",
      current_image: "current_image"
    }),
    limitedItems() {
      return this.user_images.slice(0, this.limitNumber);
    }
  }
};
</script>

<style scoped>
.img-record {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  border-bottom: 1px solid rgb(78, 74, 74);
  padding: 10px;
}
.folder {
  max-height: 65vh;
  overflow-y: scroll;
}
.img-record:hover {
  background: rgb(65, 75, 75);
}
.image {
  padding-right: 10px;
  text-align: center;
  flex-basis: 100px;
  flex-grow: 1;
}
.image img {
  width: 100%;
}
.image img:after {
  content: "";
  display: block;
  padding-bottom: 100%;
}
.image-information {
  flex-basis: 200px;
  flex-grow: 5;
}
.image-coordinates {
  display: flex;
  text-align: left;
}
.side-panel {
  grid-column: 1;
  width: auto;
}
.selected_thumbnail {
  background-color: rgb(60, 70, 70);
}
.download-link:hover {
  cursor: pointer;
  text-decoration: underline;
}
.show-more {
  margin-top: 5px;
  width: 100%;
}
</style>

