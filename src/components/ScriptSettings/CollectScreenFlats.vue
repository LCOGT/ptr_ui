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
            max="63"
          />
        </b-field>
      </div>
      <div class="field-group">
        <b-field>
          <b-checkbox v-model="gainCalc">
            Gain Calc
          </b-checkbox>
        </b-field>
        <b-field>
          <b-checkbox v-model="shutterCompensation">
            Shutter Comp
          </b-checkbox>
        </b-field>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CollectScreenFlats',
  computed: {

    numFrames: {
      get () { return this.$store.state.scriptSettings.collectScreenFlats.numFrames },
      set (value) {
        const scriptName = 'collectScreenFlats'
        const paramName = 'numFrames'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    gainCalc: {
      get () { return this.$store.state.scriptSettings.collectScreenFlats.gainCalc },
      set (value) {
        const scriptName = 'collectScreenFlats'
        const paramName = 'gainCalc'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    shutterCompensation: {
      get () { return this.$store.state.scriptSettings.collectScreenFlats.shutterCompensation },
      set (value) {
        const scriptName = 'collectScreenFlats'
        const paramName = 'shutterCompensation'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    }

  }
}
</script>

<style lang="scss" scoped>
.field-group {
    padding-right: 2em;
}
</style>
