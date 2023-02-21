<template>
  <div class="image-toolbar-wrapper">
    <b-field
      grouped
      style="margin-bottom: 0;"
    >
      <b-field>
        <button
          title="open the JS9 analysis tools"
          class="button is-small"
          @click="toggleJS9"
        >
          JS9
        </button>
      </b-field>
      <b-field>
        <p class="control">
          <button
            class="button level-item is-small"
            title="go to the latest image"
            @click="$store.dispatch('images/set_latest_image')"
          >
            <b-icon icon="chevron-double-left" />
          </button>
        </p>
        <p class="control">
          <button
            class="button level-item is-small"
            title="previous image"
            @click="$store.dispatch('images/set_previous_image')"
          >
            <b-icon icon="chevron-left" />
          </button>
        </p>
        <p class="control">
          <button
            class="button level-item is-small"
            title="next image"
            @click="$store.dispatch('images/set_next_image')"
          >
            <b-icon icon="chevron-right" />
          </button>
        </p>
        <p class="control">
          <button
            class="button level-item is-small"
            title="go to tonight's first image"
            @click="$store.dispatch('images/set_first_image')"
          >
            <b-icon icon="chevron-double-right" />
          </button>
        </p>
      </b-field>
    </b-field>

    <b-field>
      <FitsHeaderModal
        :image="current_image"
        button_size="is-small"
        class="mr-3"
      />

      <ImageDownloadsButton :image_package="current_image" />

    </b-field>
  </div>
</template>

<script>
import FitsHeaderModal from '@/components/ImageDisplay/FitsHeaderModal.vue'
import ImageDownloadsButton from '@/components/ImageDownloadsButton.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'ButtonRowBelowImage',
  components: {
    FitsHeaderModal,
    ImageDownloadsButton
  },

  methods: {
    toggleJS9 () {
      if (this.js9IsVisible) {
        this.js9IsVisible = false
        // this.init()
      } else {
        this.js9LoadImage(this.current_image)
        this.js9IsVisible = true
      }
    },

    js9LoadImage (image) {
      const the_load_options = {
        site: image.site,
        base_filename: image.base_filename
      }
      this.$store.dispatch('js9/loadImage', the_load_options)
    }
  },
  computed: {
    ...mapGetters('images', [ 'current_image', ]),

    js9IsVisible: {
      get () { return this.$store.getters['js9/instanceIsVisible'] },
      set (val) { this.$store.commit('js9/instanceIsVisible', val) }
    }

  }
}
</script>

<style lang="scss" scoped>
@import "@/style/_responsive.scss";

.image-toolbar-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

.image-toolbar-wrapper > * {
  margin-bottom: 0;
}

</style>
