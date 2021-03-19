<template>
  <div class="image-toolbar-wrapper">
    <b-field grouped>
      <b-field> 
        <button title="open the JS9 analysis tools"
          class="button" @click="toggleAnalysis">JS9</button> </b-field>
      <b-field>
        <p class="control">
          <button 
            class="button level-item" title="go to the latest image" 
            @click="$store.dispatch('images/set_latest_image')">
            <b-icon icon="chevron-double-left"/>
          </button>
        </p>
        <p class="control">
          <button class="button level-item" title="previous image"
            @click="$store.dispatch('images/set_previous_image')">
            <b-icon icon="chevron-left" />
          </button>
        </p>
        <p class="control">
          <button class="button level-item" title="next image"
            @click="$store.dispatch('images/set_next_image')">
            <b-icon icon="chevron-right" />
          </button>
        </p>
      </b-field>
    </b-field>

    <b-field>
      <b-field label="crosshairs" style="margin-right: 10px;" >
        <b-switch type="is-info" v-model="show_crosshairs"></b-switch>
      </b-field>
      <b-field>
        <b-radio-button v-model="activeDrawShape" native-value="none"> none </b-radio-button>
        <b-radio-button v-model="activeDrawShape" native-value="point">
            <span class="iconify" data-icon="radix-icons:dot" data-inline="false"></span>
        </b-radio-button>
        <b-radio-button v-model="activeDrawShape" native-value="line">
            <span class="iconify" data-icon="mdi:vector-line" data-inline="false"></span>
        </b-radio-button>
        <b-radio-button v-model="activeDrawShape" native-value="circle">
            <span class="iconify" data-icon="mdi:vector-circle-variant" data-inline="false"></span>
        </b-radio-button>
        <b-radio-button v-model="activeDrawShape" native-value="rect">
            <span class="iconify" data-icon="mdi:vector-rectangle" data-inline="false"></span>
        </b-radio-button>
      </b-field>

      <b-button 
        class="button"
        title="Remove selected shape"
        style="margin-left: 10px;"
        type="is-danger"
        :disabled="selectedId == 'none'"
        icon-right="delete"
        @click='$store.dispatch("drawshapes/deleteSelectedShape")'>
      </b-button>
    </b-field>

  </div>

</template>

<script>
import {mapState, mapGetters} from 'vuex';
export default {
  name: "ImageToolbar",
  data() {
    return {
      show_crosshairs: false,
    }
  },

  methods: {
    toggleAnalysis() {
      if (this.js9IsVisible) {
        this.js9IsVisible = false;
        //this.init()
      } else {
        this.js9LoadImage(this.current_image)
        this.js9IsVisible = true;
      }
    },
    js9LoadImage(image) {
      let the_load_options = {
        site: image.site,
        base_filename: image.base_filename,
      }
      this.$store.dispatch('js9/loadImage', the_load_options)
    },
  },
  computed: {

    ...mapGetters("images", [
      "recent_images",
      "current_image",
    ]),

    ...mapState('drawshapes', [
      'shapes', 
      'lines', 
      'rects', 
      'circles', 
      'points', 
      'starmarkers'
    ]),

    js9IsVisible: {
      get() { return this.$store.getters['js9/instanceIsVisible']},
      set(val) { this.$store.commit('js9/instanceIsVisible', val)},
    },

    subframeIsActive: {
        get() { return this.$store.getters['command_params/subframeIsActive']},
        set(val) { this.$store.commit('command_params/subframeIsActive', val)},
    },

    subframeDefinedWithFile: {
        get() { return this.$store.getters['command_params/subframeDefinedWithFile']},
        set(val) { this.$store.commit('command_params/subframeDefinedWithFile', val)},
    },

    

    // ID of the shape that is currently selected
    selectedId: {
      get() { return this.$store.getters['drawshapes/selectedId']},
      set(val) { this.$store.commit('drawshapes/selectedId', val)}
    },

    // User selection for which shape they want to draw
    activeDrawShape: {
      get() { return this.$store.getters['drawshapes/activeDrawShape']},
      set(val) { this.$store.commit('drawshapes/activeDrawShape', val)}
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/_responsive.scss";

.image-toolbar-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

</style>