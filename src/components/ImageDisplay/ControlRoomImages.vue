<template>
    <div class="image-display-area">
      <image-info-bar 
        class="image-info-bar"
        v-if="Object.keys(current_image).length > 0"
        :current_image="current_image"
        />
      <image-view 
        class="image-view"
        :site="sitecode" 
        :markedStars="markedStars" />
        
      <div class="thumbnail-row">
        <info-image-thumb class="info-thumbs" v-if="info_images_exist"/>
        <div class="thumb-divider" v-if="info_images_exist" />
        <thumbnail-row 
          class="data-thumbs"
          :images="recent_images" 
          :selected_image="current_image.image_id" 
          @thumbnailClicked="set_current_image"/>
      </div>

      <ButtonRowBelowImage class="mt-3"/>
      <DrawShapesToolbar />
    </div>
</template>

<script>
import ImageInfoBar from '@/components/ImageDisplay/ImageInfoBar'
import ImageView from '@/components/ImageView'
import InfoImageThumb from '@/components/ImageDisplay/InfoImageThumb'
import ThumbnailRow from '@/components/ImageDisplay/ThumbnailRow'
import ButtonRowBelowImage from '@/components/ImageDisplay/ButtonRowBelowImage'
import DrawShapesToolbar from '@/components/ImageDisplay/DrawShapesToolbar'
import { mapState, mapGetters, mapActions } from 'vuex'
export default {
    name: "ControlRoomImages",
    components: {
        ImageInfoBar,
        ImageView,
        InfoImageThumb,
        ThumbnailRow,
        ButtonRowBelowImage,
        DrawShapesToolbar,
    },
    props: {
        sitecode: String
    },
    methods: {
        ...mapActions("images", [
            'set_current_image'
        ]),
    },
    computed: {

        ...mapState("images", [
            'recent_images',
            'current_image', 
        ]),

        ...mapGetters("images", [
            'small_fits_exists',
            'large_fits_exists',
            'small_fits_filename', 
            'large_fits_filename',
            'info_images_exist',
        ]),

        markedStars() {
            return this.$store.getters['starprofile/marked_stars']
        },

        best_available_full_filename() {
            return this.large_fits_exists 
                ? this.large_fits_filename 
                : this.small_fits_filename
        },
        subframe_x0: {
            get() { return this.$store.getters['command_params/subframe_x0']},
            set(val) { this.$store.commit('command_params/subframe_x0', val)},
        },

        subframe_y0: {
            get() { return this.$store.getters['command_params/subframe_y0']},
            set(val) { this.$store.commit('command_params/subframe_y0', val)},
        },

        subframe_x1: {
            get() { return this.$store.getters['command_params/subframe_x1']},
            set(val) { this.$store.commit('command_params/subframe_x1', val)},
        },

        subframe_y1: {
            get() { return this.$store.getters['command_params/subframe_y1']},
            set(val) { this.$store.commit('command_params/subframe_y1', val)},
        },
    }
    
}
</script>

<style lang="scss" scoped>
.image-display-area {

}

.image-view {

}

.thumbnail-row {

}

.data-thumbs {

}



</style>
