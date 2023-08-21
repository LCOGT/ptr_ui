<template>
  <section>
    <div class="field-group">
      <b-field label="No. of Pointings">
        <b-numberinput
          v-model="numPointingRuns"
          type="is-light"
          controls-position="compact"
          min="1"
          max="10000"
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
