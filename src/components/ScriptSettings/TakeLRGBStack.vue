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
      get () { return this.$store.state.scriptSettings.takeLRGBStack.numFrames },
      set (value) {
        const scriptName = 'takeLRGBStack'
        const paramName = 'numFrames'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    skipL: {
      get () { return this.$store.state.scriptSettings.takeLRGBStack.skipL },
      set (value) {
        const scriptName = 'takeLRGBStack'
        const paramName = 'skipL'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    exposureTime: {
      get () { return this.$store.state.scriptSettings.takeLRGBStack.exposureTime },
      set (value) {
        const scriptName = 'takeLRGBStack'
        const paramName = 'exposureTime'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    useSloane: {
      get () { return this.$store.state.scriptSettings.takeLRGBStack.useSloane },
      set (value) {
        const scriptName = 'takeLRGBStack'
        const paramName = 'useSloane'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
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
