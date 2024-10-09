<template>
  <section>
    <div class="field-group">
      <b-field label="No. of Pointings">
        <b-numberinput
          v-model="numPointingRuns"
          type="is-light"
          size="is-small"
          controls-position="compact"
          min="1"
          max="10000"
        />
      </b-field>
    </div>
    <div class="field-group">
      <b-field label="Min. Altitude (deg)">
        <b-numberinput
          v-model="minAltitude"
          type="is-light"
          size="is-small"
          controls-position="compact"
          min="0"
          max="90"
        />
      </b-field>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PointingRun',
  computed: {

    numPointingRuns: {
      get () { return this.$store.state.scriptSettings.pointingRun.numPointingRuns },
      set (value) {
        const scriptName = 'pointingRun'
        const paramName = 'numPointingRuns'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    minAltitude: {
      get () { return this.$store.state.scriptSettings.pointingRun.minAltitude },
      set (value) {
        const scriptName = 'pointingRun'
        const paramName = 'minAltitude'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.field-group {
    padding-right: 2em;
    padding-bottom: 1em;
}
</style>
