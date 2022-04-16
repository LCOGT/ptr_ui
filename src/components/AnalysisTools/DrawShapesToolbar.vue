<template>
  <div class="image-toolbar-wrapper">
    <b-field grouped>

    <b-field label="draw shapes" :horizontal="horizontal">
        <b-radio-button :size="size" v-model="activeDrawShape" native-value="none"> none </b-radio-button>
        <b-radio-button :size="size" v-model="activeDrawShape" native-value="point">
            <span class="iconify" data-icon="radix-icons:dot" data-inline="false"></span>
        </b-radio-button>
        <b-radio-button :size="size" v-model="activeDrawShape" native-value="line">
            <span class="iconify" data-icon="mdi:vector-line" data-inline="false"></span>
        </b-radio-button>
        <b-radio-button :size="size" v-model="activeDrawShape" native-value="circle">
            <span class="iconify" data-icon="mdi:vector-circle-variant" data-inline="false"></span>
        </b-radio-button>
        <b-radio-button :size="size" v-model="activeDrawShape" native-value="rect">
            <span class="iconify" data-icon="mdi:vector-rectangle" data-inline="false"></span>
        </b-radio-button>
      </b-field>

      <!--b-button 
        class="button"
        title="Remove selected shape"
        style="margin-left: 10px;"
        type="is-danger"
        :disabled="selectedId == 'none'"
        icon-right="delete"
        @click='$store.dispatch("drawshapes/deleteSelectedShape")'>
      </b-button-->
      <b-field label="crosshairs" class="ml-5" :horizontal="horizontal">
        <b-switch :size="size" type="is-info" v-model="crosshairsVisible"></b-switch>
      </b-field>
    </b-field>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
export default {
  name: "DrawShapesToolbar",
  props: {
    size: {
      type: String,
      default: "",
    },
    horizontal: Boolean,
  },
  data() {
    return {
      show_crosshairs: false,
    }
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
    },

    crosshairsVisible: {
      get() { return this.$store.getters['drawshapes/crosshairsVisible']},
      set(val) { this.$store.commit('drawshapes/crosshairsVisible', val)}
    },
  }
}
</script>
