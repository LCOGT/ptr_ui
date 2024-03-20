<template>
  <section>
    <div class="level">
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
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TakeLunarStack',
  computed: {

    numFrames: {
      get () { return this.$store.state.scriptSettings.takeLunarStack.numFrames },
      set (value) {
        const scriptName = 'takeLunarStack'
        const paramName = 'numFrames'
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
