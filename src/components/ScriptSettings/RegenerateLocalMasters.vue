<template>
  <section>
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Number of Bias</label>
      </div>
      <div class="field">
        <div class="control">
          <b-numberinput
            v-model="numOfBias"
            size="is-small"
            type="is-light"
            controls-position="compact"
            min="0"
            class="inputfield"
          />
        </div>
      </div>
    </div>

    <hr>

    <div class="field is-horizontal">
      <div class="field-label">
        <label class="label">Dark Time</label>
      </div>
      <div class="field">
        <b-field class="inputfield">
          <b-input
            v-model="darkTime"
            size="is-small"
            name="subject"
            autocomplete="off"
          />
          <p class="control">
            <span class="button is-small is-static">s</span>
          </p>
        </b-field>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Number of Dark</label>
      </div>
      <div class="field">
        <div class="control">
          <b-numberinput
            v-model="numOfDark"
            size="is-small"
            class="inputfield"
            type="is-light"
            controls-position="compact"
            min="0"
          />
        </div>
      </div>
    </div>

    <hr>

    <div class="field-group">
      <b-field>
        <b-checkbox v-model="coldMap">
          Cold Map
        </b-checkbox>
        <b-checkbox v-model="hotMap">
          Hot Map
        </b-checkbox>
      </b-field>
    </div>
  </section>
</template>

<script>
export default {
  name: 'RegenerateLocalMasters',

  computed: {

    numOfBias: {
      get () { return this.$store.state.scriptSettings.regenerateLocalMasters.numOfBias },
      set (value) {
        const scriptName = 'regenerateLocalMasters'
        const paramName = 'numOfBias'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    darkTime: {
      get () { return this.$store.state.scriptSettings.regenerateLocalMasters.darkTime },
      set (value) {
        const scriptName = 'regenerateLocalMasters'
        const paramName = 'darkTime'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    numOfDark: {
      get () { return this.$store.state.scriptSettings.regenerateLocalMasters.numOfDark },
      set (value) {
        const scriptName = 'regenerateLocalMasters'
        const paramName = 'numOfDark'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    coldMap: {
      get () { return this.$store.state.scriptSettings.regenerateLocalMasters.coldMap },
      set (value) {
        const scriptName = 'regenerateLocalMasters'
        const paramName = 'coldMap'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    hotMap: {
      get () { return this.$store.state.scriptSettings.regenerateLocalMasters.hotMap },
      set (value) {
        const scriptName = 'regenerateLocalMasters'
        const paramName = 'hotMap'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.inputfield {
    width: 200px;
}
.field-group {
    padding-right: 10px;
    padding-bottom: 2em;
}
</style>
