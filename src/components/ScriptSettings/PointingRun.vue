<template>
  <section>
    <b-field>
      <b-radio-button
        v-model="gridType"
        class="is-light"
        native-value="coarse"
      >
        coarse
      </b-radio-button>

      <b-radio-button
        v-model="gridType"
        native-value="medium"
      >
        medium
      </b-radio-button>

      <b-radio-button
        v-model="gridType"
        native-value="fine"
      >
        fine
      </b-radio-button>

      <b-radio-button
        v-model="gridType"
        native-value="sweep"
      >
        sweep
      </b-radio-button>

      <b-radio-button
        v-model="gridType"
        native-value="cross"
      >
        cross
      </b-radio-button>
    </b-field>
    <div class="field-group">
      <b-field label="No. of Runs">
        <b-numberinput
          v-model="numGridRuns"
          type="is-light"
          controls-position="compact"
          min="1"
          max="5"
        />
      </b-field>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PointingRun',
  computed: {

    gridType: {
      get () { return this.$store.state.scriptSettings.pointingRun.gridType },
      set (value) {
        const scriptName = 'pointingRun'
        const paramName = 'gridType'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    numGridRuns: {
      get () { return this.$store.state.scriptSettings.pointingRun.numGridRuns },
      set (value) {
        const scriptName = 'pointingRun'
        const paramName = 'numGridRuns'
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
