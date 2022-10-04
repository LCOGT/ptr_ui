<template>
  <section>
    <div class="">
      <div class="field-group">
        <b-field label="No. of Frames">
          <b-numberinput
            v-model="numFrames"
            type="is-light"
            size="is-small"
            controls-position="compact"
            min="0"
          />
        </b-field>
        <b-field label="Exposure Time (s)">
          <b-numberinput
            v-model="exposureTime"
            type="is-light"
            size="is-small"
            controls-position="compact"
            min="0"
          />
        </b-field>
      </div>
      <div class="field-group">
        <b-field>
          <b-checkbox v-model="skipL">
            Skip Luminance
          </b-checkbox>
        </b-field>
        <b-field>
          <b-checkbox v-model="useSloane">
            Use Sloane
          </b-checkbox>
        </b-field>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TakeLRGBStack',
  computed: {

    numFrames: {
      get () { return this.$store.getters.takeLRGBStack_numFrames },
      set (val) { this.$store.commit('takeLRGBStack_numFrames', val) }
    },
    skipL: {
      get () { return this.$store.getters.takeLRGBStack_skipL },
      set (val) { this.$store.commit('takeLRGBStack_skipL', val) }
    },
    exposureTime: {
      get () { return this.$store.getters.takeLRGBStack_exposureTime },
      set (val) { this.$store.commit('takeLRGBStack_exposureTime', val) }
    },
    useSloane: {
      get () { return this.$store.getters.takeLRGBStack_useSloane },
      set (val) { this.$store.commit('takeLRGBStack_useSloane', val) }
    }
  }
}
</script>

<style lang="scss" scoped>
.field-group {
    padding-right: 2em;
    padding-bottom: 2em;
}
</style>
