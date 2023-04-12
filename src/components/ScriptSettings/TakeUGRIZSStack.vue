<template>
  <section>
    <div class="level">
      <div class="field-group">
        <b-field label="No. of Frames">
          <b-numberinput
            v-model="numFrames"
            size="is-small"
            type="is-light"
            controls-position="compact"
            min="0"
          />
        </b-field>
      </div>
      <div class="field-group">
        <b-field>
          <b-checkbox v-model="skipU">
            Skip &#956;
          </b-checkbox>
        </b-field>
        <b-field>
          <b-checkbox v-model="skipZS">
            Skip zs
          </b-checkbox>
        </b-field>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TakeUGRIZSStack',
  computed: {

    numFrames: {
      get () { return this.$store.state.scriptSettings.takeUGRIZSStack.numFrames },
      set (value) {
        const scriptName = 'takeUGRIZSStack'
        const paramName = 'numFrames'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    skipU: {
      get () { return this.$store.state.scriptSettings.takeUGRIZSStack.skipU },
      set (value) {
        const scriptName = 'takeUGRIZSStack'
        const paramName = 'skipU'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    skipZS: {
      get () { return this.$store.state.scriptSettings.takeUGRIZSStack.skipZS },
      set (value) {
        const scriptName = 'takeUGRIZSStack'
        const paramName = 'skipZS'
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
