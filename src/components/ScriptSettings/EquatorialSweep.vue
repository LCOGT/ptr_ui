<template>
  <section>
    <div class="field-group">
      <b-field label="Points">
        <b-numberinput
          v-model="points"
          type="is-light"
          size="is-small"
          controls-position="compact"
          min="0"
        />
      </b-field>
      <b-field label="Minimum Altitude">
        <b-numberinput
          v-model="minAltitude"
          type="is-light"
          size="is-small"
          controls-position="compact"
          min="0"
        />
      </b-field>
    </div>
  </section>
</template>

<script>
export default {
  computed: {

    points: {
      get () { return this.$store.state.scriptSettings.equatorialSweep.points },
      set (value) {
        const scriptName = 'equatorialSweep'
        const paramName = 'points'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    minAltitude: {
      get () { return this.$store.state.scriptSettings.equatorialSweep.minAltitude },
      set (value) {
        const scriptName = 'equatorialSweep'
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
